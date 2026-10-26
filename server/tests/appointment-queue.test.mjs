/**
 * Phase 2D Integration Test Suite: Appointment Queue Status Transitions & Concurrency Safety
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
console.log('SAFETY VERIFICATION: Appointment Queue Status Test Suite');
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

    // 1. Seed Departments
    const cardDept = await client.query("INSERT INTO departments (name, code, is_active) VALUES ('Cardiology', 'CARD', TRUE) RETURNING id");
    const orthoDept = await client.query("INSERT INTO departments (name, code, is_active) VALUES ('Orthopaedics', 'ORTHO', TRUE) RETURNING id");
    seedData.cardiologyId = cardDept.rows[0].id;
    seedData.orthoId = orthoDept.rows[0].id;

    // 2. Reference Rooms
    const room1 = await client.query("SELECT id FROM rooms WHERE room_number = 'OPD-101'");
    const room2 = await client.query("SELECT id FROM rooms WHERE room_number = 'OPD-202'");
    seedData.room1Id = room1.rows[0].id;
    seedData.room2Id = room2.rows[0].id;

    // 3. Seed Doctors
    const doc1 = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, room_id, is_active) VALUES ('DOC-CARD-01', 'Dr. Arindam Mitra', '9830000001', $1, $2, TRUE) RETURNING id",
      [seedData.cardiologyId, seedData.room1Id]
    );
    const doc2 = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, room_id, is_active) VALUES ('DOC-ORTHO-02', 'Dr. Pradeep K. Sharma', '9830000002', $1, $2, TRUE) RETURNING id",
      [seedData.orthoId, seedData.room2Id]
    );
    seedData.doc1Id = doc1.rows[0].id;
    seedData.doc2Id = doc2.rows[0].id;

    // 4. Seed Patients
    const pat1 = await client.query(
      "INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender) VALUES ('UHID-2026-0814', 'Devika Sengupta', '9876543210', '1990-05-15', 'female') RETURNING id"
    );
    const pat2 = await client.query(
      "INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender) VALUES ('UHID-2026-0922', 'Rohan Chatterjee', '9830012345', '1985-11-20', 'male') RETURNING id"
    );
    seedData.patient1Id = pat1.rows[0].id;
    seedData.patient2Id = pat2.rows[0].id;

    // 5. Seed Staff Accounts with different roles
    const passHash = hashPassword('Staff@123');

    // Receptionist
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active)
       VALUES ('RECEP-01', 'Reception Staff', 'recep@hospital.org', $1, 'receptionist', TRUE)`,
      [passHash]
    );

    // Nurse
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active)
       VALUES ('NURSE-01', 'Staff Nurse Joyita', 'nurse@hospital.org', $1, 'staff_nurse', TRUE)`,
      [passHash]
    );

    // Clinician Doctor 1 (Cardiology)
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active, doctor_id)
       VALUES ('DOC-CARD-01', 'Dr. Arindam Mitra', 'doctor1@hospital.org', $1, 'clinician_doctor', TRUE, $2)`,
      [passHash, seedData.doc1Id]
    );

    // Clinician Doctor 2 (Ortho)
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active, doctor_id)
       VALUES ('DOC-ORTHO-02', 'Dr. Pradeep K. Sharma', 'doctor2@hospital.org', $1, 'clinician_doctor', TRUE, $2)`,
      [passHash, seedData.doc2Id]
    );

    // Super Admin
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active)
       VALUES ('ADMIN-01', 'System Administrator', 'admin@hospital.org', $1, 'super_admin', TRUE)`,
      [passHash]
    );

    // Blood Bank Officer (unauthorized for appointment status transition)
    await client.query(
      `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, is_active)
       VALUES ('BBO-01', 'Blood Bank Staff', 'bbo@hospital.org', $1, 'blood_bank_officer', TRUE)`,
      [passHash]
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

    // Helper for login
    async function login(email, password = 'Staff@123') {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data.data?.token;
    }

    const recepToken = await login('recep@hospital.org');
    const nurseToken = await login('nurse@hospital.org');
    const doc1Token = await login('doctor1@hospital.org');
    const doc2Token = await login('doctor2@hospital.org');
    const adminToken = await login('admin@hospital.org');
    const bboToken = await login('bbo@hospital.org');

    assert(Boolean(recepToken), 'Receptionist token obtained');
    assert(Boolean(nurseToken), 'Nurse token obtained');
    assert(Boolean(doc1Token), 'Doctor 1 token obtained');
    assert(Boolean(doc2Token), 'Doctor 2 token obtained');
    assert(Boolean(adminToken), 'Admin token obtained');
    assert(Boolean(bboToken), 'Blood bank officer token obtained');

    const tomorrow = new Date(Date.now() + 86400000).toISOString().slice(0, 10);

    // Book an appointment for Doctor 1
    const bookRes = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({
        patientId: seedData.patient1Id,
        doctorId: seedData.doc1Id,
        departmentId: seedData.cardiologyId,
        appointmentDate: tomorrow,
        startTime: '10:00',
        visitType: 'first_visit',
        notes: 'Initial cardiac evaluation',
        isPriority: false,
      })
    });
    const bookData = await bookRes.json();
    assert(bookRes.status === 201, 'Appointment booked for Doctor 1 (status 201)');
    const apt1Id = bookData.data.id;
    assert(Boolean(apt1Id), 'Appointment ID exists');
    assert(bookData.data.status === 'booked', 'Initial appointment status is booked');

    // 1. Unauthenticated PATCH /api/appointments/:id/status
    const unauthRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status: 'arrived' })
    });
    assert(unauthRes.status === 401, 'Unauthenticated status update returns 401 Unauthorized');

    // 2. Unauthorized role (Blood Bank Officer)
    const bboRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${bboToken}`
      },
      body: JSON.stringify({ status: 'arrived' })
    });
    assert(bboRes.status === 403, 'Blood Bank Officer role returns 403 Forbidden on status endpoint');

    // 3. Receptionist attempting in_consultation (forbidden for receptionist)
    const recepInConsultRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({ status: 'in_consultation' })
    });
    assert(recepInConsultRes.status === 403, 'Receptionist forbidden from setting status to in_consultation (403)');

    // 4. Receptionist attempting completed (forbidden for receptionist)
    const recepCompleteRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({ status: 'completed' })
    });
    assert(recepCompleteRes.status === 403, 'Receptionist forbidden from setting status to completed (403)');

    // 5. Doctor 2 (Ortho) attempting to update Doctor 1's appointment
    const doc2MismatchRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc2Token}`
      },
      body: JSON.stringify({ status: 'waiting' })
    });
    assert(doc2MismatchRes.status === 403, 'Doctor 2 updating Doctor 1 appointment returns 403 Forbidden (doctor mismatch)');

    // 6. Invalid transition: booked -> in_consultation directly (skipping arrival/waiting)
    const invalidJumpRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc1Token}`
      },
      body: JSON.stringify({ status: 'in_consultation' })
    });
    assert(invalidJumpRes.status === 400, 'Direct transition booked -> in_consultation rejected with 400 Bad Request');

    // 7. Valid transition: Receptionist marks booked -> arrived
    const arrivedRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({ status: 'arrived' })
    });
    const arrivedData = await arrivedRes.json();
    assert(arrivedRes.status === 200, 'Receptionist marks booked -> arrived successfully (200)');
    assert(arrivedData.data.status === 'arrived', 'Appointment status is now arrived');
    assert(Boolean(arrivedData.data.arrived_at), 'arrived_at timestamp was populated in database');

    // 8. Idempotency test: Receptionist marks arrived -> arrived again
    const idempotentRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({ status: 'arrived' })
    });
    assert(idempotentRes.status === 200, 'Idempotent status update to arrived returns 200 OK');

    // 9. Authorization checked before idempotency: Doctor 2 attempting arrived -> arrived returns 403
    const doc2IdempotentRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc2Token}`
      },
      body: JSON.stringify({ status: 'arrived' })
    });
    assert(doc2IdempotentRes.status === 403, 'Unauthorized doctor cannot probe idempotency (returns 403)');

    // 10. Valid transition: Staff Nurse marks arrived -> waiting
    const waitingRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nurseToken}`
      },
      body: JSON.stringify({ status: 'waiting' })
    });
    const waitingData = await waitingRes.json();
    assert(waitingRes.status === 200, 'Staff Nurse marks arrived -> waiting successfully (200)');
    assert(waitingData.data.status === 'waiting', 'Appointment status is now waiting');

    // 11. Valid transition: Doctor 1 marks waiting -> in_consultation
    const consultRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc1Token}`
      },
      body: JSON.stringify({ status: 'in_consultation' })
    });
    const consultData = await consultRes.json();
    assert(consultRes.status === 200, 'Doctor 1 marks waiting -> in_consultation successfully (200)');
    assert(consultData.data.status === 'in_consultation', 'Appointment status is now in_consultation');
    assert(Boolean(consultData.data.consultation_started_at), 'consultation_started_at timestamp was recorded');
    assert(Boolean(consultData.data.called_at), 'called_at timestamp was recorded');

    // 12. Valid transition: Doctor recalls patient back to waiting room (e.g. while awaiting lab tests)
    const recallRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc1Token}`
      },
      body: JSON.stringify({ status: 'waiting' })
    });
    const recallData = await recallRes.json();
    assert(recallRes.status === 200, 'Doctor moves in_consultation -> waiting (200)');
    assert(recallData.data.status === 'waiting', 'Appointment status is waiting');

    // Re-enter in_consultation
    const reConsultRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc1Token}`
      },
      body: JSON.stringify({ status: 'in_consultation' })
    });
    assert(reConsultRes.status === 200, 'Doctor re-enters in_consultation (200)');

    // 13. Valid transition: Doctor 1 completes consultation
    const completeRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc1Token}`
      },
      body: JSON.stringify({ status: 'completed' })
    });
    const completeData = await completeRes.json();
    assert(completeRes.status === 200, 'Doctor 1 marks in_consultation -> completed (200)');
    assert(completeData.data.status === 'completed', 'Appointment status is now completed');
    assert(Boolean(completeData.data.consultation_ended_at), 'consultation_ended_at timestamp was recorded');

    // 14. Terminal state rejection: completed -> waiting is rejected
    const afterCompleteRes = await fetch(`${baseUrl}/appointments/${apt1Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc1Token}`
      },
      body: JSON.stringify({ status: 'waiting' })
    });
    assert(afterCompleteRes.status === 400, 'Transition from terminal status completed returns 400 Bad Request');

    // 15. Cancellation workflow & reason validation
    const book2Res = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({
        patientId: seedData.patient2Id,
        doctorId: seedData.doc1Id,
        departmentId: seedData.cardiologyId,
        appointmentDate: tomorrow,
        startTime: '10:30',
        visitType: 'first_visit',
        notes: 'Follow up slot',
      })
    });
    const apt2Data = await book2Res.json();
    const apt2Id = apt2Data.data.id;

    const cancelRes = await fetch(`${baseUrl}/appointments/${apt2Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({
        status: 'cancelled',
        cancellation_reason: 'Patient requested cancellation due to travel'
      })
    });
    const cancelData = await cancelRes.json();
    assert(cancelRes.status === 200, 'Appointment cancelled successfully (200)');
    assert(cancelData.data.status === 'cancelled', 'Status is cancelled');
    assert(
      cancelData.data.cancellation_reason === 'Patient requested cancellation due to travel',
      'Cancellation reason correctly recorded'
    );

    // Cancelled is terminal
    const cancelTerminalRes = await fetch(`${baseUrl}/appointments/${apt2Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({ status: 'arrived' })
    });
    assert(cancelTerminalRes.status === 400, 'Transition from cancelled returns 400 Bad Request');

    // 16. No-show workflow
    const book3Res = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({
        patientId: seedData.patient1Id,
        doctorId: seedData.doc1Id,
        departmentId: seedData.cardiologyId,
        appointmentDate: tomorrow,
        startTime: '11:00',
        visitType: 'follow_up',
      })
    });
    const apt3Data = await book3Res.json();
    const apt3Id = apt3Data.data.id;

    const noShowRes = await fetch(`${baseUrl}/appointments/${apt3Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${nurseToken}`
      },
      body: JSON.stringify({ status: 'no_show' })
    });
    const noShowData = await noShowRes.json();
    assert(noShowRes.status === 200, 'Staff Nurse marks appointment as no_show (200)');
    assert(noShowData.data.status === 'no_show', 'Status is no_show');

    // 17. Direct arrived -> in_consultation (walk-in/direct call)
    const book4Res = await fetch(`${baseUrl}/appointments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({
        patientId: seedData.patient2Id,
        doctorId: seedData.doc2Id,
        departmentId: seedData.orthoId,
        appointmentDate: tomorrow,
        startTime: '14:00',
        visitType: 'first_visit',
      })
    });
    const apt4Data = await book4Res.json();
    const apt4Id = apt4Data.data.id;

    // Receptionist marks arrived
    await fetch(`${baseUrl}/appointments/${apt4Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${recepToken}`
      },
      body: JSON.stringify({ status: 'arrived' })
    });

    // Doctor 2 directly calls patient into room: arrived -> in_consultation
    const directCallRes = await fetch(`${baseUrl}/appointments/${apt4Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${doc2Token}`
      },
      body: JSON.stringify({ status: 'in_consultation' })
    });
    const directCallData = await directCallRes.json();
    assert(directCallRes.status === 200, 'Direct transition arrived -> in_consultation succeeds (200)');
    assert(directCallData.data.status === 'in_consultation', 'Status is in_consultation');

    // 18. Concurrency detection: atomic conditional update when expected status does not match
    const appRepoModule = await import('../src/modules/appointments/appointment.repository.js');
    const appRepo = appRepoModule.default || appRepoModule;
    // Attempt atomic update with expectedCurrentStatus 'booked' on apt4Id (which is actually in_consultation)
    const staleUpdateResult = await appRepo.updateStatusAtomic(apt4Id, 'waiting', 'booked');
    assert(staleUpdateResult === null, 'Atomic conditional update returns null when expected status does not match');

    // 19. Super Admin override: admin can update any doctor appointment
    const adminOverrideRes = await fetch(`${baseUrl}/appointments/${apt4Id}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'completed' })
    });
    assert(adminOverrideRes.status === 200, 'Super admin can complete consultation for any doctor (200)');

    // 20. Non-existent appointment 404
    const notFoundRes = await fetch(`${baseUrl}/appointments/00000000-0000-0000-0000-000000000099/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${adminToken}`
      },
      body: JSON.stringify({ status: 'arrived' })
    });
    assert(notFoundRes.status === 404, 'Non-existent appointment returns 404 Not Found');

    console.log('------------------------------------------------------------');
    console.log(`ALL TESTS PASSED: ${passedTests}/${totalTests}`);
    console.log('------------------------------------------------------------');
  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('Test Suite Failed:', err);
  process.exit(1);
});
