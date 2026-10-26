/**
 * Appointment Module & Appointment-Linked Blood Request Integration Test Suite
 *
 * SAFETY GUARANTEES:
 * - Executes EXCLUSIVELY against `medicsprime_disposable_test`.
 * - Strictly aborts if connection points to `medicsprime_hms_dev` or production.
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

console.log('------------------------------------------------------------');
console.log('SAFETY VERIFICATION: Appointment & Blood Request Test Suite');
console.log(`Active Target Database: ${TEST_DB}`);
console.log('Explicitly Prohibited DB: medicsprime_hms_dev');
console.log('------------------------------------------------------------');

process.env.DB_NAME = TEST_DB;
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'Krishna@01';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  database: TEST_DB,
  user: process.env.DB_USER || 'postgres',
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

async function executeMigrationDown(client, relPath) {
  const fullPath = path.resolve(import.meta.dirname, '..', relPath);
  const mod = await import('file:///' + fullPath.replace(/\\/g, '/'));
  const sqlStatements = [];
  const pgm = {
    sql: (q) => { sqlStatements.push(q); }
  };
  mod.down(pgm);
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

    console.log('[Setup] Applying Migration 1: 1791635204809_initial-schema.js...');
    await executeMigration(client, 'migrations/1791635204809_initial-schema.js');

    console.log('[Setup] Applying Migration 2: 1791785051918_blood-bank-schema.js...');
    await executeMigration(client, 'migrations/1791785051918_blood-bank-schema.js');

    console.log('[Setup] Applying Migration 3: 1791785895061_blood-bank-refinements.js...');
    await executeMigration(client, 'migrations/1791785895061_blood-bank-refinements.js');

    console.log('[Setup] Applying Migration 4: 1791800000000_staff-accounts-and-rbac.js...');
    await executeMigration(client, 'migrations/1791800000000_staff-accounts-and-rbac.js');

    console.log('[Setup] Applying Migration 5: 1791810000000_appointment-enhancements.js...');
    await executeMigration(client, 'migrations/1791810000000_appointment-enhancements.js');

    console.log('[Setup] Applying Migration 6: 1791820000000_appointment-blood-requests.js...');
    await executeMigration(client, 'migrations/1791820000000_appointment-blood-requests.js');

    // Test rollback down() of migration 6 & 5
    console.log('[Setup] Verifying Migration 6 & 5 rollback down()...');
    await executeMigrationDown(client, 'migrations/1791820000000_appointment-blood-requests.js');
    await executeMigrationDown(client, 'migrations/1791810000000_appointment-enhancements.js');
    console.log('✓ Migration 6 and 5 down() verified cleanly');

    // Re-apply 5 & 6
    console.log('[Setup] Re-applying Migration 5 and 6 up()...');
    await executeMigration(client, 'migrations/1791810000000_appointment-enhancements.js');
    await executeMigration(client, 'migrations/1791820000000_appointment-blood-requests.js');

    // Seed reference departments
    const tmDept = await client.query("INSERT INTO departments (name, code) VALUES ('Transfusion Medicine', 'TM') RETURNING id");
    const tsDept = await client.query("INSERT INTO departments (name, code) VALUES ('Trauma Surgery', 'TS') RETURNING id");
    const cardDept = await client.query("INSERT INTO departments (name, code) VALUES ('Cardiology', 'CARD') RETURNING id");
    seedData.deptId = tsDept.rows[0].id;

    // Seed reference doctor
    const docRes = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, is_active) VALUES ('DOC-TR-01', 'Dr. Arindam Mitra', '9830000001', $1, TRUE) RETURNING id",
      [seedData.deptId]
    );
    seedData.doctorId = docRes.rows[0].id;

    // Seed reference patient
    const patRes = await client.query(
      "INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender) VALUES ('UHID-2026-9001', 'Rohan Chatterjee', '9830099999', '1985-06-20', 'male') RETURNING id"
    );
    seedData.patientId = patRes.rows[0].id;

    const pat2Res = await client.query(
      "INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender) VALUES ('UHID-2026-9002', 'Sunita Ghosh', '9830088888', '1992-09-14', 'female') RETURNING id"
    );
    seedData.patient2Id = pat2Res.rows[0].id;

    // Seed staff accounts
    const testAccounts = [
      { code: 'EMP-DOC-01', name: 'Dr. Arindam Mitra', email: 'doctor@hospital.test', pass: 'Doc#Pass2026!', role: 'clinician_doctor', docId: seedData.doctorId, deptId: seedData.deptId },
      { code: 'EMP-BBO-01', name: 'Dr. Meenakshi Sundaram', email: 'bbo@hospital.test', pass: 'BBO#Secure2026!', role: 'blood_bank_officer', docId: null, deptId: tmDept.rows[0].id },
      { code: 'EMP-REC-01', name: 'Alok Roy', email: 'reception@hospital.test', pass: 'Recept#Pass2026!', role: 'receptionist', docId: null, deptId: null },
      { code: 'EMP-PHL-01', name: 'Savitri Devi', email: 'phleb@hospital.test', pass: 'Phleb#Pass2026!', role: 'phlebotomist', docId: null, deptId: tmDept.rows[0].id },
      { code: 'EMP-ADM-01', name: 'IT Admin', email: 'admin@hospital.test', pass: 'Admin#Pass2026!', role: 'super_admin', docId: null, deptId: null }
    ];

    for (const acc of testAccounts) {
      await client.query(
        `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, doctor_id, department_id, is_active)
         VALUES ($1, $2, $3, $4, $5, $6, $7, TRUE)`,
        [acc.code, acc.name, acc.email, hashPassword(acc.pass), acc.role, acc.docId, acc.deptId]
      );
    }

    console.log(`✓ All migrations and seed fixtures successfully initialized in ${TEST_DB}`);
  } finally {
    client.release();
  }
}

async function runTests() {
  let server;
  let baseUrl;
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`  FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passedTests++;
    console.log(`  ✓ ${message}`);
  }

  try {
    await setupDatabase();

    const appMod = await import('../src/app.js');
    const app = appMod.default || appMod;

    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;
    console.log(`[Server] Production Express server listening on ephemeral port ${port} -> ${baseUrl}`);

    // Helper login function
    async function login(email, password) {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data.data?.token;
    }

    const docToken = await login('doctor@hospital.test', 'Doc#Pass2026!');
    const bboToken = await login('bbo@hospital.test', 'BBO#Secure2026!');
    const receptionToken = await login('reception@hospital.test', 'Recept#Pass2026!');
    const phlebToken = await login('phleb@hospital.test', 'Phleb#Pass2026!');

    assert(!!docToken && !!bboToken && !!receptionToken && !!phlebToken, 'Acquired valid JWT tokens for test personas');

    // ========================================================================
    // SUITE 1: AUTHENTICATION & RBAC ACCESS CONTROL
    // ========================================================================
    console.log('\n--- SUITE 1: Authentication & Role-Based Access Control ---');
    {
      // 1. Unauthenticated request to /appointments
      const unauthApt = await fetch(`${baseUrl}/appointments`);
      assert(unauthApt.status === 401, 'Unauthenticated GET /appointments rejected with HTTP 401');

      // 2. Unauthenticated request to /blood-requests
      const unauthBlood = await fetch(`${baseUrl}/blood-requests`);
      assert(unauthBlood.status === 401, 'Unauthenticated GET /blood-requests rejected with HTTP 401');

      // 3. Phlebotomist forbidden from booking appointment
      const phlebBook = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${phlebToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert(phlebBook.status === 403, 'Phlebotomist booking appointment rejected with HTTP 403 Forbidden');

      // 4. Receptionist forbidden from ordering blood request
      const receptBlood = await fetch(`${baseUrl}/blood-requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({})
      });
      assert(receptBlood.status === 403, 'Receptionist ordering blood request rejected with HTTP 403 Forbidden');

      // 5. Receptionist permitted to list appointments
      const receptList = await fetch(`${baseUrl}/appointments`, {
        headers: { 'Authorization': `Bearer ${receptionToken}` }
      });
      assert(receptList.status === 200, 'Receptionist permitted to GET /appointments (HTTP 200)');

      // 6. Clinician permitted to list appointments
      const docList = await fetch(`${baseUrl}/appointments`, {
        headers: { 'Authorization': `Bearer ${docToken}` }
      });
      assert(docList.status === 200, 'Clinician permitted to GET /appointments (HTTP 200)');
    }

    // ========================================================================
    // SUITE 2: APPOINTMENT BOOKING, CONFLICT DETECTION & RESCHEDULING
    // ========================================================================
    console.log('\n--- SUITE 2: Appointment Booking, Conflict Detection & Rescheduling ---');
    let appointmentId;
    let appointmentNumber;
    {
      const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

      // 1. Invalid patient ID
      const fakePatientRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: '00000000-0000-0000-0000-000000000000',
          doctorId: seedData.doctorId,
          departmentId: seedData.deptId,
          appointmentDate: tomorrow,
          startTime: '10:00',
          visitType: 'first_visit'
        })
      });
      assert(fakePatientRes.status === 404, 'Booking with non-existent patient returns HTTP 404 Not Found');

      // 2. Booking past date
      const pastRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patientId,
          doctorId: seedData.doctorId,
          departmentId: seedData.deptId,
          appointmentDate: '2020-01-01',
          startTime: '10:00',
          visitType: 'first_visit'
        })
      });
      assert(pastRes.status === 400, 'Booking in the past returns HTTP 400 Bad Request');

      // 3. Valid Appointment Booking
      const bookRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patientId,
          doctorId: seedData.doctorId,
          departmentId: seedData.deptId,
          appointmentDate: tomorrow,
          startTime: '10:00',
          visitType: 'first_visit',
          notes: 'Pre-operative trauma evaluation'
        })
      });
      const bookData = await bookRes.json();
      assert(bookRes.status === 201, 'Valid appointment booking returns HTTP 201 Created');
      assert(bookData.success === true, 'Returns success: true');
      assert(bookData.data.appointment_number.startsWith('APT-'), 'Generated sequential appointment_number starting with APT-');
      assert(bookData.data.token_number === 1, 'Assigned sequential daily token_number = 1');
      assert(bookData.data.end_time === '10:15:00', 'Calculated end_time exactly 15 minutes after start_time');

      appointmentId = bookData.data.id;
      appointmentNumber = bookData.data.appointment_number;

      // 4. Duplicate slot collision check (Same doctor, same date, overlapping time)
      const collisionRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patient2Id,
          doctorId: seedData.doctorId,
          departmentId: seedData.deptId,
          appointmentDate: tomorrow,
          startTime: '10:00',
          visitType: 'first_visit'
        })
      });
      const collisionData = await collisionRes.json();
      assert(collisionRes.status === 409, 'Overlapping appointment slot rejected with HTTP 409 Conflict');
      assert(collisionData.message.includes('already booked'), 'Returns conflict message explaining slot is booked');

      // 5. Booking non-conflicting slot succeeds
      const nextSlotRes = await fetch(`${baseUrl}/appointments`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patient2Id,
          doctorId: seedData.doctorId,
          departmentId: seedData.deptId,
          appointmentDate: tomorrow,
          startTime: '10:15',
          visitType: 'first_visit'
        })
      });
      const nextSlotData = await nextSlotRes.json();
      assert(nextSlotRes.status === 201, 'Adjacent slot booked successfully (HTTP 201)');
      assert(nextSlotData.data.token_number === 2, 'Assigned next sequential token_number = 2');

      // 6. Reschedule Appointment
      const rescheduleRes = await fetch(`${baseUrl}/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: tomorrow,
          startTime: '11:00',
          reason: 'Doctor surgery delay'
        })
      });
      const rescheduleData = await rescheduleRes.json();
      assert(rescheduleRes.status === 200, 'Rescheduling appointment returns HTTP 200');
      assert(rescheduleData.data.start_time === '11:00:00', 'Appointment start_time updated to 11:00');
      assert(rescheduleData.data.end_time === '11:15:00', 'Appointment end_time updated to 11:15');

      // 7. Reschedule collision
      const rescheduleCollision = await fetch(`${baseUrl}/appointments/${appointmentId}/reschedule`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          appointmentDate: tomorrow,
          startTime: '10:15', // Already taken by patient 2
          reason: 'Conflict test'
        })
      });
      assert(rescheduleCollision.status === 409, 'Rescheduling to occupied slot rejected with HTTP 409 Conflict');

      // 8. Available Slots calculation
      const slotsRes = await fetch(`${baseUrl}/appointments/available-slots?doctorId=${seedData.doctorId}&date=${tomorrow}`, {
        headers: { 'Authorization': `Bearer ${receptionToken}` }
      });
      const slotsData = await slotsRes.json();
      assert(slotsRes.status === 200, 'GET /appointments/available-slots returns HTTP 200');
      assert(slotsData.data.totalSlots > 0, 'Generated total slots for working windows');
      assert(slotsData.data.bookedSlots >= 2, 'Accurately detected booked slots in calculation');
    }

    // ========================================================================
    // SUITE 3: APPOINTMENT-LINKED BLOOD BANK REQUESTS
    // ========================================================================
    console.log('\n--- SUITE 3: Appointment-Linked Blood Requests & Blood Bank Bridge ---');
    let bloodRequestId;
    let bloodRequisitionId;
    {
      // 1. Missing patient rejected
      const missingPat = await fetch(`${baseUrl}/blood-requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${docToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: '00000000-0000-0000-0000-000000000000',
          bloodGroup: 'B+',
          clinicalIndication: 'Trauma pre-op'
        })
      });
      assert(missingPat.status === 404, 'Blood request with non-existent patient returns HTTP 404');

      // 2. Invalid blood group rejected
      const invalidBg = await fetch(`${baseUrl}/blood-requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${docToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patientId,
          bloodGroup: 'Z+', // Invalid
          clinicalIndication: 'Trauma pre-op'
        })
      });
      assert(invalidBg.status === 400, 'Invalid blood group Z+ rejected with HTTP 400 Bad Request');

      // 3. Appointment mismatch: attempting to link patient 1's blood request to patient 2's appointment
      const fakeAptRes = await fetch(`${baseUrl}/blood-requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${docToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patient2Id,
          appointmentId: appointmentId, // belongs to patient 1!
          bloodGroup: 'O+',
          clinicalIndication: 'Trauma pre-op'
        })
      });
      assert(fakeAptRes.status === 400, 'Linking blood request to another patient appointment rejected with HTTP 400');

      // 4. Valid Appointment Blood Request created by Clinician Doctor
      const reqRes = await fetch(`${baseUrl}/blood-requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${docToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patientId,
          appointmentId: appointmentId,
          bloodGroup: 'O+',
          componentType: 'red_cells',
          unitsRequested: 2,
          urgency: 'urgent',
          clinicalIndication: 'Emergency trauma surgery pre-op reserve',
          notes: 'Prepare crossmatch tubes'
        })
      });
      const reqData = await reqRes.json();
      assert(reqRes.status === 201, 'Clinician creating appointment blood request returns HTTP 201 Created');
      assert(reqData.success === true, 'Returns success: true');
      assert(reqData.data.patient_id === seedData.patientId, 'Persisted correct patient_id');
      assert(reqData.data.appointment_id === appointmentId, 'Persisted correct appointment_id');
      assert(reqData.data.requested_by_doctor_id === seedData.doctorId, 'Server-derived doctor_id matches clinician doctor record');
      assert(reqData.data.status === 'pending', 'Initial blood request status is pending');

      bloodRequestId = reqData.data.id;
      bloodRequisitionId = reqData.data.blood_requisition_id;

      assert(!!bloodRequisitionId, 'Transactionally generated and linked blood_requisition_id');
      assert(reqData.data.blood_requisition.requisition_number.startsWith('REQ-'), 'Blood bank requisition assigned REQ- sequential number');
      assert(reqData.data.blood_requisition.patient_blood_group === 'O', 'Parsed patient_blood_group = O');
      assert(reqData.data.blood_requisition.patient_rh_factor === 'positive', 'Parsed patient_rh_factor = positive');
      assert(reqData.data.blood_requisition.requested_component === 'prbc', 'Mapped red_cells to Blood Bank canonical PRBC component');
      assert(reqData.data.blood_requisition.units_requested === 2, 'Units requested = 2 in Blood Bank requisition');

      // 5. Verify PostgreSQL Persistence & Linkage
      const dbCheck = await pool.query(
        `SELECT abr.*, br.requisition_number, br.requested_component, br.patient_blood_group
         FROM appointment_blood_requests abr
         JOIN blood_requisitions br ON br.id = abr.blood_requisition_id
         WHERE abr.id = $1`,
        [bloodRequestId]
      );
      assert(dbCheck.rows.length === 1, 'Appointment blood request confirmed physically persisted in PostgreSQL');
      assert(dbCheck.rows[0].requested_component === 'prbc', 'PostgreSQL blood_requisitions record matches linked request');

      // 6. GET /blood-requests returns joined records
      const listReqs = await fetch(`${baseUrl}/blood-requests`, {
        headers: { 'Authorization': `Bearer ${bboToken}` }
      });
      const listReqsData = await listReqs.json();
      assert(listReqs.status === 200, 'Blood Bank Officer GET /blood-requests returns HTTP 200');
      assert(listReqsData.count >= 1, 'Returned populated array of blood requests');
      assert(listReqsData.data.some(r => r.id === bloodRequestId), 'Created request present in list with appointment_number');

      // 8. State Machine Status Transitions
      // Valid: pending -> under_review
      const reviewRes = await fetch(`${baseUrl}/blood-requests/${bloodRequestId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${bboToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'under_review', notes: 'Blood bank reviewing inventory' })
      });
      assert(reviewRes.status === 200, 'Valid transition pending -> under_review returns HTTP 200');

      // Invalid: under_review -> pending (backward transition forbidden)
      const badTransition = await fetch(`${baseUrl}/blood-requests/${bloodRequestId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${bboToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'pending' })
      });
      assert(badTransition.status === 400, 'Invalid backwards transition under_review -> pending rejected with HTTP 400');

      // Valid: under_review -> approved
      const approveRes = await fetch(`${baseUrl}/blood-requests/${bloodRequestId}/status`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${bboToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved', notes: 'Units reserved in blood bank' })
      });
      assert(approveRes.status === 200, 'Valid transition under_review -> approved returns HTTP 200');
    }

    // ========================================================================
    // SUITE 4: APPOINTMENT CANCELLATION & INTEGRITY
    // ========================================================================
    console.log('\n--- SUITE 4: Appointment Cancellation & Integrity ---');
    {
      const cancelRes = await fetch(`${baseUrl}/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Patient emergency transfer' })
      });
      assert(cancelRes.status === 200, 'Appointment cancellation returns HTTP 200');

      // Cannot re-cancel already cancelled appointment
      const reCancel = await fetch(`${baseUrl}/appointments/${appointmentId}/cancel`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${receptionToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: 'Duplicate cancel' })
      });
      assert(reCancel.status === 400, 'Cancelling already cancelled appointment returns HTTP 400');

      // Cannot order blood for cancelled appointment
      const bloodForCancelled = await fetch(`${baseUrl}/blood-requests`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${docToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: seedData.patientId,
          appointmentId: appointmentId,
          bloodGroup: 'A+',
          clinicalIndication: 'Test cancelled apt'
        })
      });
      assert(bloodForCancelled.status === 400, 'Creating blood request for cancelled appointment rejected with HTTP 400');
    }

    console.log('\n============================================================');
    console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests} checks verified!`);
    console.log(`Database: ${TEST_DB} (Isolated Disposable Database)`);
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
