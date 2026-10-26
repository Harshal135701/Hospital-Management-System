/**
 * Phase 3A Integration Test Suite: Clinical Consultation Backend & Schema Verification
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
import app from '../src/app.js';

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
console.log('SAFETY VERIFICATION: Clinical Consultation Test Suite');
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

    console.log('[Setup] Applying Migrations 1-7 (including Clinical Consultation Schema)...');
    await executeMigration(client, 'migrations/1791635204809_initial-schema.js');
    await executeMigration(client, 'migrations/1791785051918_blood-bank-schema.js');
    await executeMigration(client, 'migrations/1791785895061_blood-bank-refinements.js');
    await executeMigration(client, 'migrations/1791800000000_staff-accounts-and-rbac.js');
    await executeMigration(client, 'migrations/1791810000000_appointment-enhancements.js');
    await executeMigration(client, 'migrations/1791820000000_appointment-blood-requests.js');
    await executeMigration(client, 'migrations/1791900000000_clinical-consultation-schema.js');

    // 1. Seed Departments
    const cardDept = await client.query("INSERT INTO departments (name, code, is_active) VALUES ('Cardiology', 'CARD', TRUE) RETURNING id");
    const orthoDept = await client.query("INSERT INTO departments (name, code, is_active) VALUES ('Orthopaedics', 'ORTHO', TRUE) RETURNING id");
    seedData.cardiologyId = cardDept.rows[0].id;
    seedData.orthoId = orthoDept.rows[0].id;

    // 2. Reference Rooms
    const room1 = await client.query("SELECT id FROM rooms WHERE room_number = 'OPD-101'");
    seedData.room1Id = room1.rows[0].id;

    // 3. Seed Doctors
    const doc1 = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, room_id, is_active) VALUES ('DOC-CARD-01', 'Dr. Arindam Mitra', '9830000001', $1, $2, TRUE) RETURNING id",
      [seedData.cardiologyId, seedData.room1Id]
    );
    const doc2 = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, room_id, is_active) VALUES ('DOC-ORTHO-02', 'Dr. Pradeep K. Sharma', '9830000002', $1, $2, TRUE) RETURNING id",
      [seedData.orthoId, seedData.room1Id]
    );
    seedData.doc1Id = doc1.rows[0].id;
    seedData.doc2Id = doc2.rows[0].id;

    // 4. Seed Patients
    const pat1 = await client.query(
      "INSERT INTO patients (uhid, full_name, gender, date_of_birth, mobile) VALUES ('UHID-2026-0001', 'Devika Sengupta', 'female', '1988-04-12', '9830011111') RETURNING id"
    );
    const pat2 = await client.query(
      "INSERT INTO patients (uhid, full_name, gender, date_of_birth, mobile) VALUES ('UHID-2026-0002', 'Rohan Chatterjee', 'male', '1975-08-20', '9830022222') RETURNING id"
    );
    seedData.patientDevikaId = pat1.rows[0].id;
    seedData.patientRohanId = pat2.rows[0].id;

    // 5. Seed Staff Accounts
    const defaultHash = hashPassword('Staff@123');

    // Doctor 1 account
    const staffDoc1 = await client.query(
      "INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, doctor_id, is_active) VALUES ('EMP-DOC-01', 'Dr. Arindam Mitra', 'doc1@hospital.org', $1, 'clinician_doctor', $2, TRUE) RETURNING id",
      [defaultHash, seedData.doc1Id]
    );
    seedData.staffDoc1Id = staffDoc1.rows[0].id;

    // Doctor 2 account
    const staffDoc2 = await client.query(
      "INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, doctor_id, is_active) VALUES ('EMP-DOC-02', 'Dr. Pradeep Sharma', 'doc2@hospital.org', $1, 'clinician_doctor', $2, TRUE) RETURNING id",
      [defaultHash, seedData.doc2Id]
    );
    seedData.staffDoc2Id = staffDoc2.rows[0].id;

    // Staff Nurse account (doctor_id is null)
    const staffNurse = await client.query(
      "INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, doctor_id, is_active) VALUES ('EMP-NURSE-01', 'Nurse Priyanka Roy', 'nurse@hospital.org', $1, 'staff_nurse', NULL, TRUE) RETURNING id",
      [defaultHash]
    );
    seedData.staffNurseId = staffNurse.rows[0].id;

    // Receptionist account
    const staffRecep = await client.query(
      "INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, role, doctor_id, is_active) VALUES ('EMP-RECEP-01', 'Rajesh K. Receptionist', 'recep@hospital.org', $1, 'receptionist', NULL, TRUE) RETURNING id",
      [defaultHash]
    );
    seedData.staffRecepId = staffRecep.rows[0].id;

    // 6. Seed Appointments
    const apt1 = await client.query(
      `INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, token_number)
       VALUES ('APT-2026-0001', $1, $2, $3, '2026-11-15', '09:00', '09:15', 'arrived', 1)
       RETURNING id`,
      [seedData.patientDevikaId, seedData.doc1Id, seedData.cardiologyId]
    );
    seedData.apt1Id = apt1.rows[0].id;

    const apt2 = await client.query(
      `INSERT INTO appointments (appointment_number, patient_id, doctor_id, department_id, appointment_date, start_time, end_time, status, token_number)
       VALUES ('APT-2026-0002', $1, $2, $3, '2026-11-15', '10:00', '10:15', 'arrived', 2)
       RETURNING id`,
      [seedData.patientRohanId, seedData.doc2Id, seedData.orthoId]
    );
    seedData.apt2Id = apt2.rows[0].id;

    console.log('[Setup] Test database fixtures seeded successfully.');
  } finally {
    client.release();
  }
}

async function runTests() {
  await setupDatabase();

  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;

  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`❌ FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passedTests++;
    console.log(`  ✔ [PASS] ${message}`);
  }

  try {
    async function login(email, password = 'Staff@123') {
      const res = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      return data.data.token;
    }

    const doc1Token = await login('doc1@hospital.org');
    const doc2Token = await login('doc2@hospital.org');
    const nurseToken = await login('nurse@hospital.org');
    const recepToken = await login('recep@hospital.org');

    console.log('\n--- SUITE 1: Authentication & Role Enforcement ---');
    {
      // 1.1 Unauthenticated requests return 401
      const unauth = await fetch(`${baseUrl}/consultations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ appointmentId: seedData.apt1Id, patientId: seedData.patientDevikaId })
      });
      assert(unauth.status === 401, 'Unauthenticated POST /consultations returns HTTP 401');

      // 1.2 Receptionist role cannot create consultation (403)
      const recepCreate = await fetch(`${baseUrl}/consultations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${recepToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointmentId: seedData.apt1Id, patientId: seedData.patientDevikaId })
      });
      assert(recepCreate.status === 403, 'Receptionist POST /consultations returns HTTP 403');
    }

    console.log('\n--- SUITE 2: Cross-Doctor Access & Doctor Ownership ---');
    let encounter1Id = null;
    {
      // 2.1 Doctor 2 cannot start consultation for Doctor 1's appointment
      const crossStart = await fetch(`${baseUrl}/consultations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc2Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointmentId: seedData.apt1Id, patientId: seedData.patientDevikaId })
      });
      assert(crossStart.status === 403, 'Doctor 2 attempting to start Doctor 1 appointment returns HTTP 403');

      // 2.2 Doctor 1 starts their own appointment consultation
      const startRes = await fetch(`${baseUrl}/consultations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointmentId: seedData.apt1Id, patientId: seedData.patientDevikaId })
      });
      assert(startRes.status === 201, 'Doctor 1 successfully starts consultation (HTTP 201)');
      const startData = await startRes.json();
      encounter1Id = startData.data.id;
      assert(startData.data.doctor_id === seedData.doc1Id, 'Encounter doctor_id strictly matches Doctor 1');
      assert(startData.data.status === 'in_progress', 'Initial encounter status is in_progress');

      // 2.3 Doctor 2 cannot complete Doctor 1's encounter
      const crossComplete = await fetch(`${baseUrl}/consultations/${encounter1Id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${doc2Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ summary: 'Attempt cross complete' })
      });
      assert(crossComplete.status === 403, 'Doctor 2 completing Doctor 1 encounter returns HTTP 403');
    }

    console.log('\n--- SUITE 3: Cross-Patient and Relational Integrity ---');
    {
      // 3.1 Patient mismatch (appointment belongs to Devika, but payload claims Rohan)
      const mismatchRes = await fetch(`${baseUrl}/consultations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc2Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointmentId: seedData.apt2Id, patientId: seedData.patientDevikaId })
      });
      assert(mismatchRes.status === 400, 'Cross-patient mismatch rejected with HTTP 400 Bad Request');
    }

    console.log('\n--- SUITE 4: Nurse Access Policy & Privileges ---');
    {
      // 4.1 Nurse CANNOT create consultation encounter
      const nurseStart = await fetch(`${baseUrl}/consultations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nurseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ appointmentId: seedData.apt2Id, patientId: seedData.patientRohanId })
      });
      assert(nurseStart.status === 403, 'Nurse creating consultation encounter returns HTTP 403');

      // 4.2 Nurse CAN record vitals with recorded_by = null
      const nurseVitals = await fetch(`${baseUrl}/vitals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nurseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          systolic: 120,
          diastolic: 80,
          heartRate: 72,
          temperature: 98.6,
          tempUnit: 'F',
          spo2: 99,
          height: 165,
          weight: 62
        })
      });
      assert(nurseVitals.status === 201, 'Nurse recording vitals returns HTTP 201 Created');
      const vitalsData = await nurseVitals.json();
      assert(vitalsData.data.recorded_by === null, 'Nurse vitals correctly stored with recorded_by = null');
      assert(vitalsData.data.temperature_c === '37.0', 'Fahrenheit 98.6°F correctly converted to 37.0°C');

      // 4.3 Nurse CANNOT place CPOE provider orders
      const nurseOrder = await fetch(`${baseUrl}/provider-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nurseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          order_type: 'laboratory',
          order_name: 'Complete Blood Count (CBC)'
        })
      });
      assert(nurseOrder.status === 403, 'Nurse placing CPOE order returns HTTP 403 Forbidden');

      // 4.4 Nurse CANNOT author clinical progress notes
      const nurseNote = await fetch(`${baseUrl}/clinical-notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${nurseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          assessment: 'Triage assessment',
          plan: 'Awaiting physician'
        })
      });
      assert(nurseNote.status === 403, 'Nurse authoring clinical progress note returns HTTP 403');

      // 4.5 Nurse CANNOT complete consultation encounter
      const nurseComplete = await fetch(`${baseUrl}/consultations/${encounter1Id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${nurseToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ summary: 'Close encounter' })
      });
      assert(nurseComplete.status === 403, 'Nurse completing encounter returns HTTP 403');
    }

    console.log('\n--- SUITE 5: Vitals Adaptation & Range Validations ---');
    {
      // 5.1 Invalid BP: systolic <= diastolic returns 400
      const badBp = await fetch(`${baseUrl}/vitals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          systolic: 80,
          diastolic: 120
        })
      });
      assert(badBp.status === 400, 'Systolic <= Diastolic returns HTTP 400 Bad Request');

      // 5.2 Celsius temperature preserved directly
      const celsiusVitals = await fetch(`${baseUrl}/vitals`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          temperature: 37.2,
          tempUnit: 'C',
          cvs: 'Normal S1, S2',
          rs: 'Bilateral clear'
        })
      });
      assert(celsiusVitals.status === 201, 'Celsius temperature recorded with HTTP 201');
      const cData = await celsiusVitals.json();
      assert(cData.data.temperature_c === '37.2', 'Celsius 37.2°C preserved directly');
      assert(cData.data.examination_findings.includes('CVS: Normal S1, S2'), 'Systemic examination notes assembled');
    }

    console.log('\n--- SUITE 6: CPOE Orders, Progress Notes & Clinical History ---');
    {
      // 6.1 Doctor records clinical history
      const histRes = await fetch(`${baseUrl}/clinical-history`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          chief_complaints: 'Exertional chest discomfort for 2 weeks',
          history_of_present_illness: 'Gradual onset, relieved by rest',
          past_medical_history: 'Hypertension diagnosed 2020',
          medication_history: 'Amlodipine 5mg OD'
        })
      });
      assert(histRes.status === 201, 'Doctor records clinical history (HTTP 201)');

      // 6.2 Doctor places CPOE provider order
      const orderRes = await fetch(`${baseUrl}/provider-orders`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          order_type: 'laboratory',
          order_name: 'Lipid Profile & Serum Electrolytes',
          priority: 'Urgent',
          instructions: 'Fasting 12 hours required'
        })
      });
      assert(orderRes.status === 201, 'Doctor places CPOE provider order (HTTP 201)');
      const orderData = await orderRes.json();
      assert(orderData.data.priority === 'urgent', 'Priority capitalized Urgent normalized to lowercase urgent');
      assert(orderData.data.ordered_by === seedData.doc1Id, 'ordered_by strictly populated with Doctor 1 UUID');

      // 6.3 Doctor authors SOAP progress note
      const noteRes = await fetch(`${baseUrl}/clinical-notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          subjective: 'Patient reports mild chest tightness on walking.',
          objective: 'BP 120/80, HR 72, normal heart sounds.',
          assessment: 'Suspected stable angina; hypertensive heart disease.',
          plan: 'Order urgent lipid panel, resting ECG, follow up next Tuesday.'
        })
      });
      assert(noteRes.status === 201, 'Doctor authors SOAP progress note (HTTP 201)');
      const noteData = await noteRes.json();
      assert(noteData.data.author_doctor_id === seedData.doc1Id, 'author_doctor_id strictly matches Doctor 1');
    }

    console.log('\n--- SUITE 7: Appointment Lookup & Completion Lifecycle ---');
    {
      // 7.1 Appointment to encounter lookup
      const lookupRes = await fetch(`${baseUrl}/consultations/appointment/${seedData.apt1Id}`, {
        headers: { 'Authorization': `Bearer ${doc1Token}` }
      });
      assert(lookupRes.status === 200, 'GET /consultations/appointment/:id returns HTTP 200');
      const lookupData = await lookupRes.json();
      assert(lookupData.data.id === encounter1Id, 'Resolved encounter ID matches active consultation');

      // 7.2 Complete consultation encounter
      const completeRes = await fetch(`${baseUrl}/consultations/${encounter1Id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ summary: 'Stable angina evaluated, medications prescribed' })
      });
      assert(completeRes.status === 200, 'Attending doctor completes consultation with HTTP 200');
      const compData = await completeRes.json();
      assert(compData.data.status === 'completed', 'Encounter status updated to completed');
      assert(compData.data.completed_at !== null, 'completed_at populated');

      // 7.3 Completing already completed encounter returns 409 Conflict
      const reComplete = await fetch(`${baseUrl}/consultations/${encounter1Id}/complete`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ summary: 'Attempt duplicate completion' })
      });
      assert(reComplete.status === 409, 'Duplicate completion returns HTTP 409 Conflict');

      // 7.4 Modifying completed encounter rejected with 400
      const postCompleteNote = await fetch(`${baseUrl}/clinical-notes`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${doc1Token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          encounterId: encounter1Id,
          assessment: 'Post-completion note attempt',
          plan: 'Should be rejected'
        })
      });
      assert(postCompleteNote.status === 400, 'Writing notes to completed encounter returns HTTP 400 Bad Request');
    }

    console.log('\n============================================================');
    console.log(`ALL PHASE 3A TESTS PASSED: ${passedTests}/${totalTests} verified!`);
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

// Guarded test definition - to run:
// TEST_DB=medicsprime_disposable_test DB_NAME=medicsprime_disposable_test node server/tests/clinical-consultation.test.mjs
