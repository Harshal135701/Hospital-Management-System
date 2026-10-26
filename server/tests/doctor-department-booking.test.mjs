/**
 * Phase 2C Integration Test Suite: Doctor & Department Endpoints, Patient Search, and Booking Flow
 *
 * SAFETY GUARANTEES:
 * - Executes EXCLUSIVELY against `medicsprime_disposable_test`.
 * - Fail-closed: Strictly aborts if connection points to `medicsprime_hms_dev` or production.
 * - Zero modifications to dev or production databases.
 */

import http from 'http';
import path from 'path';
import crypto from 'crypto';
import dotenv from 'dotenv';
import pg from 'pg';

const { Pool } = pg;

dotenv.config();
if (!process.env.DB_PASSWORD) {
  dotenv.config({ path: path.resolve(process.cwd(), 'server/.env') });
}
if (!process.env.DB_PASSWORD) {
  dotenv.config({ path: path.resolve(process.cwd(), '.env') });
}

const TEST_DB = 'medicsprime_disposable_test';
const DEV_DB = 'medicsprime_hms_dev';

if (TEST_DB === DEV_DB) {
  throw new Error('FATAL: TEST_DB cannot be identical to DEV_DB!');
}

if (process.env.NODE_ENV === 'production') {
  throw new Error('CRITICAL ABORT: Destructive test setup cannot run in production environment!');
}

if (process.env.TEST_DB && process.env.TEST_DB !== TEST_DB) {
  throw new Error(`CRITICAL ABORT: TEST_DB is set to '${process.env.TEST_DB}'. Destructive test setup can only target '${TEST_DB}'!`);
}

const incomingDb = process.env.DB_NAME;
if (incomingDb === DEV_DB) {
  throw new Error(`CRITICAL ABORT: Incoming DB_NAME is '${DEV_DB}'. Destructive test setup is strictly prohibited on development database!`);
}

if (incomingDb !== TEST_DB) {
  throw new Error(`CRITICAL ABORT: Incoming DB_NAME is '${incomingDb}'. Destructive test setup can only target '${TEST_DB}'!`);
}

console.log('------------------------------------------------------------');
console.log('SAFETY VERIFICATION: Doctor/Department & Booking Test Suite');
console.log(`Target Database: ${TEST_DB}`);
console.log(`Explicitly Prohibited DB: ${DEV_DB}`);
console.log('------------------------------------------------------------');

process.env.DB_NAME = TEST_DB;
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';

if (process.env.DB_NAME !== TEST_DB) {
  throw new Error(`CRITICAL ABORT: DB_NAME must be strictly '${TEST_DB}', got '${process.env.DB_NAME}'`);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: TEST_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function executeMigration(client, relPath) {
  const fullPath = path.resolve(import.meta.dirname, '..', relPath);
  const mod = await import('file:///' + fullPath.replace(/\\/g, '/'));
  const sqlStatements = [];
  const pgm = {
    sql: (q) => { sqlStatements.push(q); }
  };
  mod.up(pgm);
  for (const stmt of sqlStatements) {
    await client.query(stmt);
  }
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return `scrypt$${salt}$${derivedKey.toString('hex')}`;
}

let seedData = {};

async function setupDatabase() {
  const client = await pool.connect();
  try {
    const dbCheck = await client.query('SELECT current_database() as db');
    if (dbCheck.rows[0].db !== TEST_DB) {
      throw new Error(`CRITICAL ABORT: Connected to ${dbCheck.rows[0].db}, expected ${TEST_DB}`);
    }

    console.log(`[Setup] Resetting public schema in isolated ${TEST_DB}...`);
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    console.log('[Setup] Applying Migrations 1-6...');
    await executeMigration(client, 'migrations/1791635204809_initial-schema.js');
    await executeMigration(client, 'migrations/1791785051918_blood-bank-schema.js');
    await executeMigration(client, 'migrations/1791785895061_blood-bank-refinements.js');
    await executeMigration(client, 'migrations/1791800000000_staff-accounts-and-rbac.js');
    await executeMigration(client, 'migrations/1791810000000_appointment-enhancements.js');
    await executeMigration(client, 'migrations/1791820000000_appointment-blood-requests.js');

    // 1. Seed Departments (active and inactive)
    const cardDept = await client.query("INSERT INTO departments (name, code, is_active) VALUES ('Cardiology', 'CARD', TRUE) RETURNING id");
    const orthoDept = await client.query("INSERT INTO departments (name, code, is_active) VALUES ('Orthopaedics', 'ORTHO', TRUE) RETURNING id");
    await client.query("INSERT INTO departments (name, code, is_active) VALUES ('Deprecated Ward', 'DEPR', FALSE)");
    seedData.cardiologyId = cardDept.rows[0].id;
    seedData.orthoId = orthoDept.rows[0].id;

    // 2. Query seeded reference Rooms
    const room1 = await client.query("SELECT id FROM rooms WHERE room_number = 'OPD-101'");
    const room2 = await client.query("SELECT id FROM rooms WHERE room_number = 'OPD-202'");
    seedData.room1Id = room1.rows[0].id;
    seedData.room2Id = room2.rows[0].id;

    // 3. Seed Doctors (active in Cardiology, active in Ortho, inactive)
    const doc1 = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, room_id, is_active) VALUES ('DOC-CARD-01', 'Dr. Arindam Mitra', '9830000001', $1, $2, TRUE) RETURNING id",
      [seedData.cardiologyId, seedData.room1Id]
    );
    const doc2 = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, room_id, is_active) VALUES ('DOC-ORTHO-02', 'Dr. Pradeep K. Sharma', '9830000002', $1, $2, TRUE) RETURNING id",
      [seedData.orthoId, seedData.room2Id]
    );
    await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, is_active) VALUES ('DOC-INACTIVE', 'Dr. Inactive Physician', '9830000099', $1, FALSE)",
      [seedData.cardiologyId]
    );
    seedData.docCardioId = doc1.rows[0].id;
    seedData.docOrthoId = doc2.rows[0].id;

    // 4. Seed Patients for search test
    const pat1 = await client.query(
      "INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender) VALUES ('UHID-2026-0814', 'Devika Sengupta', '9876543210', '1990-05-15', 'female') RETURNING id"
    );
    const pat2 = await client.query(
      "INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender) VALUES ('UHID-2026-0922', 'Rohan Chatterjee', '9830012345', '1985-11-20', 'male') RETURNING id"
    );
    seedData.patientDevikaId = pat1.rows[0].id;
    seedData.patientRohanId = pat2.rows[0].id;

    // 5. Seed Staff Accounts for Auth
    const passHash = hashPassword('Staff@123');
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active)
       VALUES ('RECEP-01', 'Reception Staff', 'recep@hospital.org', $1, 'receptionist', TRUE)`,
      [passHash]
    );
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active, doctor_id)
       VALUES ('DOC-CARD-01', 'Dr. Arindam Mitra', 'doctor@hospital.org', $1, 'clinician_doctor', TRUE, $2)`,
      [passHash, seedData.docCardioId]
    );

    console.log('[Setup] Test data successfully seeded in disposable database.');
  } finally {
    client.release();
  }
}

async function runTests() {
  let server;
  let totalTests = 0;
  let passedTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`  FAIL [${totalTests}]: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passedTests++;
    console.log(`  PASS [${totalTests}]: ${message}`);
  }

  try {
    await setupDatabase();

    // Start Express API Server dynamically
    const appModule = await import('../src/app.js');
    const app = appModule.default || appModule;

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    const baseUrl = `http://localhost:${port}/api`;

    // Obtain JWT for receptionist
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'recep@hospital.org', password: 'Staff@123' })
    });
    const loginData = await loginRes.json();
    assert(loginRes.status === 200, 'Receptionist login succeeds');
    const recepToken = loginData.data.token;

    // Obtain JWT for clinician
    const docLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'doctor@hospital.org', password: 'Staff@123' })
    });
    const docLoginData = await docLoginRes.json();
    assert(docLoginRes.status === 200, 'Clinician login succeeds');
    const docToken = docLoginData.data.token;

    // ========================================================================
    // SUITE 1: DEPARTMENTS READ ENDPOINT
    // ========================================================================
    console.log('\n--- SUITE 1: Departments Read Endpoint ---');
    {
      // 1.1 Unauthenticated request returns 401
      const unauth = await fetch(`${baseUrl}/departments`);
      assert(unauth.status === 401, 'Unauthenticated GET /departments returns HTTP 401');

      // 1.2 Authenticated request returns active departments
      const res = await fetch(`${baseUrl}/departments`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(res.status === 200, 'Authenticated GET /departments returns HTTP 200');
      const body = await res.json();
      assert(body.success === true, 'Response body has success: true');
      assert(Array.isArray(body.data), 'Returns array of departments');
      assert(body.data.length === 2, 'Returns only active departments (Cardiology and Orthopaedics)');
      assert(!body.data.some(d => d.name === 'Deprecated Ward'), 'Excludes inactive department');
      assert(body.data[0].id && body.data[0].name && body.data[0].code, 'Returns expected safe fields: id, name, code');
    }

    // ========================================================================
    // SUITE 2: DOCTORS READ ENDPOINT
    // ========================================================================
    console.log('\n--- SUITE 2: Doctors Read Endpoint ---');
    {
      // 2.1 Unauthenticated request returns 401
      const unauth = await fetch(`${baseUrl}/doctors`);
      assert(unauth.status === 401, 'Unauthenticated GET /doctors returns HTTP 401');

      // 2.2 Authenticated request returns all active doctors
      const res = await fetch(`${baseUrl}/doctors`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(res.status === 200, 'Authenticated GET /doctors returns HTTP 200');
      const body = await res.json();
      assert(body.success === true, 'Response body has success: true');
      assert(body.data.length === 2, 'Returns 2 active doctors');
      assert(!body.data.some(d => d.employee_code === 'DOC-INACTIVE'), 'Excludes inactive doctor');

      // Check safe field projection
      const doc = body.data.find(d => d.employee_code === 'DOC-CARD-01');
      assert(doc.full_name === 'Dr. Arindam Mitra', 'Returns doctor full_name');
      assert(doc.name === 'Dr. Arindam Mitra', 'Returns aliased name for frontend compatibility');
      assert(doc.department_name === 'Cardiology', 'Returns joined department_name');
      assert(doc.room_number === 'OPD-101', 'Returns joined room_number');
      assert(doc.mobile === undefined, 'Does not expose doctor private mobile number');

      // 2.3 Filter by departmentId
      const filtered = await fetch(`${baseUrl}/doctors?departmentId=${seedData.cardiologyId}`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(filtered.status === 200, 'GET /doctors?departmentId=... returns HTTP 200');
      const filteredBody = await filtered.json();
      assert(filteredBody.data.length === 1, 'Filtered query returns only Cardiology doctor');
      assert(filteredBody.data[0].employee_code === 'DOC-CARD-01', 'Matches Dr. Arindam Mitra');

      // 2.4 Invalid departmentId UUID returns 400
      const badUuid = await fetch(`${baseUrl}/doctors?departmentId=not-a-valid-uuid`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(badUuid.status === 400, 'Invalid departmentId UUID format returns HTTP 400');
    }

    // ========================================================================
    // SUITE 3: PATIENT SEARCH INTEGRATION
    // ========================================================================
    console.log('\n--- SUITE 3: Patient Search Contract ---');
    {
      // 3.1 Search by Full Name (GET /patients?search=...)
      const nameSearch = await fetch(`${baseUrl}/patients?search=Devika`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(nameSearch.status === 200, 'GET /patients?search=Devika returns HTTP 200');
      const nameBody = await nameSearch.json();
      assert(nameBody.data.length >= 1, 'Found at least 1 match');
      assert(nameBody.data[0].full_name === 'Devika Sengupta', 'Matched Devika Sengupta by name');

      // 3.2 Search by UHID
      const uhidSearch = await fetch(`${baseUrl}/patients?search=UHID-2026-0814`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(uhidSearch.status === 200, 'GET /patients?search=UHID returns HTTP 200');
      const uhidBody = await uhidSearch.json();
      assert(uhidBody.data[0].uhid === 'UHID-2026-0814', 'Matched patient by exact UHID');

      // 3.3 Search by Mobile
      const mobSearch = await fetch(`${baseUrl}/patients?search=9830012345`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(mobSearch.status === 200, 'GET /patients?search=mobile returns HTTP 200');
      const mobBody = await mobSearch.json();
      assert(mobBody.data[0].full_name === 'Rohan Chatterjee', 'Matched Rohan Chatterjee by mobile');
    }

    // ========================================================================
    // SUITE 4: APPOINTMENT BOOKING & SLOT AVAILABILITY END-TO-END FLOW
    // ========================================================================
    console.log('\n--- SUITE 4: Booking & Slot Availability Flow ---');
    {
      const testDate = '2026-11-10'; // Valid future date

      // 4.1 Check available slots before booking
      const slotsRes = await fetch(`${baseUrl}/appointments/available-slots?doctorId=${seedData.docCardioId}&date=${testDate}`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      assert(slotsRes.status === 200, 'GET /appointments/available-slots returns HTTP 200');
      const slotsBody = await slotsRes.json();
      assert(slotsBody.data.onLeave === false, 'Doctor is not on leave');
      assert(slotsBody.data.slots.length > 0, 'Server returns calculated slots array');
      const targetSlot = slotsBody.data.slots.find(s => s.available && s.startTime === '09:00');
      assert(targetSlot !== undefined, 'Target slot 09:00 is initially available');

      // 4.2 Submit appointment booking
      const bookPayload = {
        patientId: seedData.patientDevikaId,
        doctorId: seedData.docCardioId,
        departmentId: seedData.cardiologyId,
        appointmentDate: testDate,
        startTime: '09:00',
        visitType: 'first_visit',
        notes: 'Initial cardiac outpatient consultation',
        isPriority: true,
        roomId: seedData.room1Id
      };

      const bookRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${recepToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookPayload)
      });
      assert(bookRes.status === 201, 'POST /appointments creates appointment with HTTP 201');
      const bookBody = await bookRes.json();
      assert(bookBody.success === true, 'Booking response has success: true');
      assert(bookBody.data.appointment_number.startsWith('APT-'), 'Generated sequential appointment_number APT-');
      assert(bookBody.data.token_number === 1, 'Assigned token_number = 1');
      assert(bookBody.data.status === 'booked', 'Initial appointment status is booked');
      assert(bookBody.data.is_priority === true, 'Stored is_priority = true');

      // 4.3 Attempt duplicate booking on same doctor, date & slot (Double-Booking Conflict)
      const duplicateRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${recepToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...bookPayload,
          patientId: seedData.patientRohanId, // different patient, same doctor/slot
        })
      });
      assert(duplicateRes.status === 409, 'Double-booking the same slot returns HTTP 409 Conflict');

      // 4.4 Verify available-slots now reflects the booked slot
      const updatedSlotsRes = await fetch(`${baseUrl}/appointments/available-slots?doctorId=${seedData.docCardioId}&date=${testDate}`, {
        headers: { 'Authorization': `Bearer ${recepToken}` }
      });
      const updatedSlotsBody = await updatedSlotsRes.json();
      const bookedSlot = updatedSlotsBody.data.slots.find(s => s.startTime === '09:00');
      assert(bookedSlot.available === false, 'Slot 09:00 is marked available: false after booking');
      assert(updatedSlotsBody.data.bookedSlots === 1, 'Reported bookedSlots count = 1');
    }

    console.log('\n============================================================');
    console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} checks verified!`);
    console.log(`Target Database: ${TEST_DB}`);
    console.log('Zero modifications made to: medicsprime_hms_dev');
    console.log('============================================================\n');

  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('\nFATAL TEST FAILURE:', err);
  process.exit(1);
});
