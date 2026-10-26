import pg from 'pg';
const { Pool } = pg;
import path from 'path';
import fs from 'fs';
import http from 'http';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const serverDir = path.resolve(__dirname, '..');

import dotenv from 'dotenv';
dotenv.config({ path: path.join(serverDir, '.env') });

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64);
  return ['scrypt', salt, derivedKey.toString('hex')].join('$');
}

// ============================================================================
// STRICT SAFETY GUARD: ENSURE DISPOSABLE TEST DATABASE ONLY
// ============================================================================
const TEST_DB = 'medicsprime_disposable_test';
const DEV_DB = 'medicsprime_hms_dev';

if (TEST_DB === DEV_DB) {
  throw new Error('FATAL: TEST_DB cannot be the same as DEV_DB!');
}

// Strictly force DB_NAME to TEST_DB regardless of what is in .env
process.env.NODE_ENV = 'test';
process.env.DB_NAME = TEST_DB;
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';

console.log('------------------------------------------------------------');
console.log('SAFETY VERIFICATION: Automated Integration Test Suite');
console.log(`Active Target Database: ${process.env.DB_NAME}`);
console.log(`Explicitly Prohibited DB: ${DEV_DB}`);
console.log('------------------------------------------------------------');

if (process.env.DB_NAME !== TEST_DB) {
  throw new Error(`FATAL: DB_NAME is ${process.env.DB_NAME}, expected ${TEST_DB}`);
}

async function ensureTestDatabaseExists() {
  if (TEST_DB !== 'medicsprime_disposable_test') {
    throw new Error(`CRITICAL: Expected TEST_DB 'medicsprime_disposable_test', received '${TEST_DB}'`);
  }
  if (TEST_DB === DEV_DB) {
    throw new Error('CRITICAL: TEST_DB cannot equal DEV_DB');
  }

  const adminPool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT, 10),
    database: 'postgres',
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
  });

  try {
    const res = await adminPool.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [TEST_DB]
    );
    if (res.rowCount === 0) {
      console.log(`[Safety Provisioning] Test database '${TEST_DB}' not found. Provisioning isolated test DB...`);
      if (!/^[a-zA-Z0-9_]+$/.test(TEST_DB)) {
        throw new Error(`Invalid test database name: ${TEST_DB}`);
      }
      await adminPool.query(`CREATE DATABASE ${TEST_DB}`);
      console.log(`[Safety Provisioning] Successfully created isolated test database '${TEST_DB}'.`);
    } else {
      console.log(`[Safety Provisioning] Verified dedicated test database '${TEST_DB}' exists.`);
    }
  } finally {
    await adminPool.end();
  }
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: TEST_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

function resolveMigrationPath(preferred, fallback) {
  const p1 = path.resolve(serverDir, preferred);
  if (fs.existsSync(p1)) return preferred;
  const p2 = path.resolve(serverDir, fallback);
  if (fs.existsSync(p2)) return fallback;
  return preferred;
}

async function executeMigration(client, relPath) {
  const fullPath = path.resolve(serverDir, relPath);
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

async function setupDatabase() {
  await ensureTestDatabaseExists();

  const client = await pool.connect();
  try {
    const dbCheck = await client.query('SELECT current_database() as db');
    if (dbCheck.rows[0].db !== TEST_DB) {
      throw new Error(`CRITICAL ABORT: Connected to ${dbCheck.rows[0].db}, expected ${TEST_DB}`);
    }
    if (dbCheck.rows[0].db === DEV_DB) {
      throw new Error(`CRITICAL ABORT: Connected to protected DEV_DB ${DEV_DB}`);
    }

    console.log(`[Setup] Resetting public schema in isolated ${TEST_DB}...`);
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    console.log('[Setup] Applying Migration 1: 1791635204809_initial-schema.js...');
    await executeMigration(client, 'migrations/1791635204809_initial-schema.js');

    const mig2 = resolveMigrationPath('migrations/1791980000000_blood-bank-schema.js', 'migrations/1791785051918_blood-bank-schema.js');
    console.log(`[Setup] Applying Migration 2: ${mig2}...`);
    await executeMigration(client, mig2);

    const mig3 = resolveMigrationPath('migrations/1791980000001_blood-bank-refinements.js', 'migrations/1791785895061_blood-bank-refinements.js');
    console.log(`[Setup] Applying Migration 3: ${mig3}...`);
    await executeMigration(client, mig3);

    const mig4 = resolveMigrationPath('migrations/1791980000002_staff-accounts-and-rbac.js', 'migrations/1791800000000_staff-accounts-and-rbac.js');
    console.log(`[Setup] Applying Migration 4: ${mig4}...`);
    await executeMigration(client, mig4);

    if (fs.existsSync(path.resolve(serverDir, 'migrations/1793000000002_core-hms-workflows-enhancements.js'))) {
      console.log('[Setup] Applying Migration 5: migrations/1793000000002_core-hms-workflows-enhancements.js...');
      await executeMigration(client, 'migrations/1793000000002_core-hms-workflows-enhancements.js');
    }

    // Pre-populate Department & Doctor in Disposable DB
    const deptRes = await client.query("INSERT INTO departments (name, code) VALUES ('Transfusion Medicine', 'TM') RETURNING id");
    const deptId = deptRes.rows[0].id;
    const traumaDeptRes = await client.query("INSERT INTO departments (name, code) VALUES ('Trauma Surgery', 'TS') RETURNING id");
    const traumaDeptId = traumaDeptRes.rows[0].id;

    const docRes = await client.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, is_active) VALUES ('DOC-TR-01', 'Dr. Arindam Mitra', '9830000001', $1, TRUE) RETURNING id",
      [traumaDeptId]
    );
    const doctorId = docRes.rows[0].id;

    // Pre-populate staff accounts with salted scrypt hashes
    const testAccounts = [
      { code: 'EMP-BBO-01', name: 'Dr. Meenakshi Sundaram', email: 'bbo@hospital.test', pass: 'BBO#Secure2026!', role: 'blood_bank_officer', docId: null, deptId, pin: null },
      { code: 'EMP-LAB-01', name: 'Anirban Das', email: 'tech@hospital.test', pass: 'Tech#Pass2026!', role: 'lab_technician', docId: null, deptId, pin: null },
      { code: 'EMP-PHL-01', name: 'Savitri Devi', email: 'phleb@hospital.test', pass: 'Phleb#Pass2026!', role: 'phlebotomist', docId: null, deptId, pin: null },
      { code: 'EMP-DOC-01', name: 'Dr. Arindam Mitra', email: 'doctor@hospital.test', pass: 'Doc#Pass2026!', role: 'clinician_doctor', docId: doctorId, deptId: traumaDeptId, pin: '123456' },
      { code: 'EMP-REC-01', name: 'Alok Roy', email: 'reception@hospital.test', pass: 'Recept#Pass2026!', role: 'receptionist', docId: null, deptId, pin: null }
    ];

    for (const acc of testAccounts) {
      await client.query(
        `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, emergency_pin_hash, role, doctor_id, department_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [acc.code, acc.name, acc.email, hashPassword(acc.pass), acc.pin ? hashPassword(acc.pin) : null, acc.role, acc.docId, acc.deptId]
      );
    }

    console.log(`✓ All migrations and staff seed accounts successfully applied to ${TEST_DB}`);
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

    

    // Dynamically load Express app
    const appMod = await import('../src/app.js');
    const app = appMod.default || appMod;

    // Start server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;
    console.log(`[Server] Test Express server listening on ephemeral port ${port} -> ${baseUrl}`);

    // Obtain auth tokens for test personas
    const nativeFetch = globalThis.fetch;

    const bboLoginRes = await nativeFetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'bbo@hospital.test', password: 'BBO#Secure2026!' })
    });
    const bboLoginData = await bboLoginRes.json();
    const bboToken = bboLoginData.data.token;

    const recLoginRes = await nativeFetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'reception@hospital.test', password: 'Recept#Pass2026!' })
    });
    const recLoginData = await recLoginRes.json();
    const receptionToken = recLoginData.data.token;

    // Define smart fetch wrapper that injects Authorization headers automatically
    const fetch = (url, options = {}) => {
      const opts = { ...options };
      opts.headers = { ...(opts.headers || {}) };
      if (!opts.headers['Authorization'] && !opts.headers['authorization']) {
        if (url.includes('/api/patients') && (opts.method || 'GET').toUpperCase() === 'POST') {
          opts.headers['Authorization'] = `Bearer ${receptionToken}`;
        } else if (!url.endsWith('/health') && !url.includes('/auth/login')) {
          opts.headers['Authorization'] = `Bearer ${bboToken}`;
        }
      }
      return nativeFetch(url, opts);
    };

    // ========================================================================
    // SUITE 1: HEALTH & PATIENT API
    // ========================================================================
    console.log('\n--- SUITE 1: Health & Patient Master API ---');
    {
      const healthRes = await fetch(`${baseUrl}/health`);
      const healthData = await healthRes.json();
      assert(healthRes.status === 200, 'GET /health returns HTTP 200');
      assert(healthData.success === true, 'GET /health returns success: true');

      // Create Patient
      const createPatRes = await fetch(`${baseUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uhid: 'UHID-2026-TEST01',
          full_name: 'Ananya Mukherjee',
          mobile: '9830012345',
          date_of_birth: '1985-05-20',
          gender: 'female'
        })
      });
      const patData = await createPatRes.json();
      assert(createPatRes.status === 201, 'POST /patients creates patient (201)');
      assert(patData.data.uhid === 'UHID-2026-TEST01', 'Patient has correct UHID');

      // Step 2: Confirm patient physically persisted in PostgreSQL table
      const patDbCheck = await pool.query('SELECT * FROM patients WHERE uhid = $1', ['UHID-2026-TEST01']);
      assert(patDbCheck.rows.length === 1, 'Step 2: Patient confirmed physically persisted in PostgreSQL');
      assert(patDbCheck.rows[0].full_name === 'Ananya Mukherjee', 'Step 2: Patient DB record full_name matches');

      // Fetch Patient by UHID (Step 3)
      const getPatRes = await fetch(`${baseUrl}/patients/UHID-2026-TEST01`);
      const getPatData = await getPatRes.json();
      assert(getPatRes.status === 200, 'GET /patients/:uhid returns HTTP 200 (Step 3)');
      assert(getPatData.data.full_name === 'Ananya Mukherjee', 'Patient full_name matches (Step 3)');
    }

    // ========================================================================
    // SUITE 2: DONOR REGISTRATION & HEALTH SCREENING API
    // ========================================================================
    console.log('\n--- SUITE 2: Donor Registration & Screening API ---');
    let donorId;
    let validScreeningId;
    let deferredScreeningIdForTest;
    {
      // Register Donor
      const createDonorRes = await fetch(`${baseUrl}/blood-bank/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Vikramaditya Roy',
          date_of_birth: '1990-08-15',
          gender: 'male',
          blood_group: 'O',
          rh_factor: 'positive',
          mobile: '9831122334',
          email: 'vikram.roy@example.com'
        })
      });
      const donorData = await createDonorRes.json();
      assert(createDonorRes.status === 201, 'POST /blood-bank/donors returns 201');
      assert(donorData.data.donor_code.startsWith('DNR-'), 'Donor has sequential donor_code');
      donorId = donorData.data.id;

      // Step 5: Verify donor is saved in PostgreSQL and appears in donor API response
      const donorDbCheck = await pool.query('SELECT * FROM blood_donors WHERE id = $1', [donorId]);
      assert(donorDbCheck.rows.length === 1, 'Step 5: Donor confirmed physically persisted in PostgreSQL');
      assert(donorDbCheck.rows[0].donor_code.startsWith('DNR-'), 'Step 5: Donor DB record has valid DNR- code');

      const donorApiRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorApiData = await donorApiRes.json();
      assert(donorApiRes.status === 200, 'Step 5: GET /blood-bank/donors/:id returns 200');
      assert(donorApiData.data.full_name === 'Vikramaditya Roy', 'Step 5: Donor name matches in API response');

      // Screening Test A: Hemoglobin < 12.5 g/dL should defer donor
      const deferScreeningRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 65,
          hemoglobin_g_dl: 11.2, // Below 12.5!
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const deferData = await deferScreeningRes.json();
      assert(deferScreeningRes.status === 201, 'Low Hb screening recorded');
      assert(deferData.data.eligibility_status === 'temporarily_deferred', 'Low Hb auto-defers eligibility');

      // Verify donor status became temporarily_deferred
      const donorAfterDeferRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterDefer = await donorAfterDeferRes.json();
      assert(donorAfterDefer.data.donor_status === 'temporarily_deferred', 'Donor status updated to temporarily_deferred');

      // Boundary Test 1: Hemoglobin strict sub-threshold 12.4 g/dL
      const hb124Res = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 50.0,
          hemoglobin_g_dl: 12.4, // Strict sub-threshold
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const hb124Data = await hb124Res.json();
      assert(hb124Data.data.eligibility_status === 'temporarily_deferred', 'Hb = 12.4 g/dL boundary correctly deferred');

      // Boundary Test 2: Weight strict sub-threshold 44.5 kg
      const wt445Res = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 44.5, // Strict sub-threshold
          hemoglobin_g_dl: 13.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const wt445Data = await wt445Res.json();
      assert(wt445Data.data.eligibility_status === 'temporarily_deferred', 'Weight = 44.5 kg boundary correctly deferred');

      // Boundary Test 3: Exact minimum thresholds Hb = 12.5 and Weight = 45.0 approved
      const boundaryPassRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 45.0,
          hemoglobin_g_dl: 12.5,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 70,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const boundaryPassData = await boundaryPassRes.json();
      assert(boundaryPassData.data.eligibility_status === 'approved', 'Hb = 12.5 g/dL and Wt = 45.0 kg exact boundary approved');

      // Questionnaire Test: Recent illness causes temporary deferral
      const illnessRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 60.0,
          hemoglobin_g_dl: 14.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          questionnaire_answers: { recent_illness: true },
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const illnessData = await illnessRes.json();
      assert(illnessData.data.eligibility_status === 'temporarily_deferred', 'Questionnaire recent_illness causes temporary deferral');

      // Questionnaire Test: High risk exposure causes permanent deferral
      const highRiskRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 60.0,
          hemoglobin_g_dl: 14.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          questionnaire_answers: { high_risk_behavior: true },
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const highRiskData = await highRiskRes.json();
      assert(highRiskData.data.eligibility_status === 'permanently_deferred', 'Questionnaire high_risk_behavior causes permanent deferral');
      const donorAfterHighRiskRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterHighRisk = await donorAfterHighRiskRes.json();
      assert(donorAfterHighRisk.data.donor_status === 'permanently_deferred', 'Donor status updated to permanently_deferred in master registry');

      // Consent Test: Missing consent rejected
      const noConsentRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 60.0,
          hemoglobin_g_dl: 14.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: false, // Refused consent!
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const noConsentData = await noConsentRes.json();
      assert(noConsentData.data.eligibility_status === 'rejected', 'Missing consent auto-rejects screening');
      deferredScreeningIdForTest = noConsentData.data.id;

      // Screening Test B: Valid screening with Hb >= 12.5 and consent
      const validScreeningRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 68.5,
          hemoglobin_g_dl: 14.5,
          blood_pressure_systolic: 122,
          blood_pressure_diastolic: 82,
          pulse_bpm: 74,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const validData = await validScreeningRes.json();
      assert(validScreeningRes.status === 201, 'Valid screening returns 201');
      assert(validData.data.eligibility_status === 'approved', 'Valid screening approved');
      validScreeningId = validData.data.id;

      // Verify donor status restored to active
      const donorAfterValidRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterValid = await donorAfterValidRes.json();
      assert(donorAfterValid.data.donor_status === 'active', 'Donor status restored to active');
    }

    // ========================================================================
    // SUITE 3: PHLEBOTOMY & COLLECTION BARCODING API
    // ========================================================================
    console.log('\n--- SUITE 3: Phlebotomy & Bag Collection API ---');
    let donationId;
    {
      // Safety Test 1: Blood collection on deferred/rejected screening strictly blocked
      const badCollectionRes = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          screening_id: deferredScreeningIdForTest,
          primary_bag_barcode: 'BB-REJECTED-001',
          volume_ml: 450,
          bag_type: 'triple',
          collection_type: 'voluntary',
          phlebotomist_name: 'Nurse Savitri Devi'
        })
      });
      assert(badCollectionRes.status === 400, 'Collection from non-approved screening rejected (400)');

      // Step 7: Blood collection from an unscreened donor strictly rejected
      const unscreenedColRes = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          screening_id: 'a0000000-0000-0000-0000-000000000001', // Non-existent screening
          primary_bag_barcode: 'BB-UNSCREENED-001',
          volume_ml: 450,
          bag_type: 'single',
          collection_type: 'voluntary',
          phlebotomist_name: 'Nurse Savitri Devi'
        })
      });
      assert(unscreenedColRes.status === 400 || unscreenedColRes.status === 404, 'Step 7: Collection from unscreened donor rejected by backend (400/404)');

      // Valid Primary Collection (Step 8)
      const bagBarcode = 'BB-2026-98745612301';
      const colRes = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          screening_id: validScreeningId,
          primary_bag_barcode: bagBarcode,
          volume_ml: 450,
          bag_type: 'triple',
          collection_type: 'voluntary',
          phlebotomist_name: 'Nurse Savitri Devi'
        })
      });
      const colData = await colRes.json();
      assert(colRes.status === 201, 'POST /blood-bank/donations returns 201');
      assert(colData.data.donation_number.startsWith('BLD-'), 'Donation assigned BLD number');
      assert(colData.data.primary_bag_barcode === bagBarcode, 'Bag barcode recorded');
      donationId = colData.data.id;

      // Safety Test 2 (Step 9): Duplicate primary bag barcode strictly blocked (409 Conflict)
      const dupColRes = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          screening_id: validScreeningId,
          primary_bag_barcode: bagBarcode, // DUPLICATE!
          volume_ml: 450,
          bag_type: 'triple',
          collection_type: 'voluntary',
          phlebotomist_name: 'Nurse Savitri Devi'
        })
      });
      assert(dupColRes.status === 409, 'Step 9: Duplicate primary bag barcode rejected (409 Conflict)');

      // Step 9: Database confirms no duplicate donation or sample rows created
      const dupDbCheck = await pool.query('SELECT COUNT(*) FROM blood_donations WHERE primary_bag_barcode = $1', [bagBarcode]);
      assert(parseInt(dupDbCheck.rows[0].count, 10) === 1, 'Step 9: Database confirms duplicate attempt did not create duplicate donation');

      // Requirement 5.2 & 5.4 Verification: Automatic Pilot Sample Tubes Created (Step 8)
      const donDetailsRes = await fetch(`${baseUrl}/blood-bank/donations`);
      const donDetails = await donDetailsRes.json();
      const targetDon = donDetails.data.find(d => d.id === donationId);
      assert(Array.isArray(targetDon.pilot_samples), 'Donation contains pilot_samples array');
      assert(targetDon.pilot_samples.length === 3, 'Exactly 3 pilot sample tubes generated (-EDTA, -CLOT, -NAT)');
      const tubeTypes = targetDon.pilot_samples.map(s => s.tube_type);
      assert(tubeTypes.includes('edta') && tubeTypes.includes('plain_clot') && tubeTypes.includes('nat'), 'All required tube types (edta, plain_clot, nat) recorded');

      // Step 8: Confirm physical persistence of 3 pilot sample tubes in PostgreSQL
      const samplesDbCheck = await pool.query('SELECT * FROM blood_samples WHERE donation_id = $1 ORDER BY tube_type ASC', [donationId]);
      assert(samplesDbCheck.rows.length === 3, 'Step 8: Exactly 3 pilot sample tubes physically persisted in PostgreSQL');

      // Requirement 5.2: Verification of All Bag Types (single, double, quadruple)
      for (const bType of ['single', 'double', 'quadruple']) {
        const testBagBarcode = `BB-TYPE-${bType.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const testBagRes = await fetch(`${baseUrl}/blood-bank/donations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donor_id: donorId,
            screening_id: validScreeningId,
            primary_bag_barcode: testBagBarcode,
            volume_ml: bType === 'single' ? 350 : 450,
            bag_type: bType,
            phlebotomist_name: 'Nurse Savitri Devi'
          })
        });
        assert(testBagRes.status === 201, `Collection with bag configuration '${bType}' successfully created`);
      }

      // Verify donor donations count incremented
      const donorAfterColRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterCol = await donorAfterColRes.json();
      assert(donorAfterCol.data.total_donations === 4, 'Donor total_donations incremented to 4');
    }

    // ========================================================================
    // SUITE 4: COMPONENT SEPARATION & INVENTORY API
    // ========================================================================
    console.log('\n--- SUITE 4: Component Separation & Inventory API ---');
    let prbcComponentId;
    let prbcBarcode;
    {
      prbcBarcode = 'PRBC-2026-091401';
      const compRes = await fetch(`${baseUrl}/blood-bank/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_donation_id: donationId,
          components: [
            {
              component_barcode: prbcBarcode,
              component_type: 'prbc',
              volume_ml: 280,
              storage_location: 'Cold-01',
              storage_min_temp_c: 2.0,
              storage_max_temp_c: 6.0,
              expires_at: new Date(Date.now() + 42 * 24 * 3600 * 1000).toISOString()
            },
            {
              component_barcode: 'FFP-2026-091402',
              component_type: 'ffp',
              volume_ml: 220,
              storage_location: 'DeepFreezer-02',
              storage_min_temp_c: -40.0,
              storage_max_temp_c: -30.0,
              expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
            }
          ]
        })
      });
      const compData = await compRes.json();
      assert(compRes.status === 201, 'POST /blood-bank/components returns 201');
      assert(compData.data.length === 2, '2 components created');
      assert(compData.data[0].status === 'quarantined', 'Components initially quarantined');
      prbcComponentId = compData.data[0].id;

      // GET /blood-bank/components (Step 10)
      const getCompRes = await fetch(`${baseUrl}/blood-bank/components?status=quarantined`);
      const getCompData = await getCompRes.json();
      assert(getCompData.data.length >= 2, 'Step 10: GET /components retrieves quarantined inventory');

      // Step 10: Confirm physical persistence of components in PostgreSQL
      const compDbCheck = await pool.query('SELECT * FROM blood_components WHERE parent_donation_id = $1', [donationId]);
      assert(compDbCheck.rows.length === 2, 'Step 10: Exactly 2 blood components physically persisted in PostgreSQL');
      assert(compDbCheck.rows.every(c => c.status === 'quarantined'), 'Step 10: All newly separated components confirmed quarantined in database');
    }

    // ========================================================================
    // SUITE 5: DUAL GROUPING & MANDATORY 5 TTI SEROLOGY & SAFE RELEASE GATE
    // ========================================================================
    console.log('\n--- SUITE 5: Dual Grouping & TTI Safe-Release Gate API ---');
    {
      // 1. Dual Grouping Verification
      const groupRes = await fetch(`${baseUrl}/blood-bank/grouping-verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          forward_anti_a: '0',
          forward_anti_b: '0',
          forward_anti_d: '4+',
          reverse_a_cells: '4+',
          reverse_b_cells: '4+',
          determined_abo_group: 'O',
          determined_rh_factor: 'positive',
          technician1_name: 'Tech Anirban Das',
          technician2_name: 'Tech Sourav Paul',
          technicians_concur: true
        })
      });
      const groupData = await groupRes.json();
      assert(groupRes.status === 201, 'POST /grouping-verifications recorded');
      assert(groupData.data.technicians_concur === true, 'Technicians concurred on group');

      // 2. Record 5 mandatory TTI tests: HIV, HBV, HCV, Syphilis, Malaria
      const ttiNames = ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria'];
      for (const tti of ttiNames) {
        const ttiRes = await fetch(`${baseUrl}/blood-bank/serology-tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donation_id: donationId,
            test_name: tti,
            test_method: 'elisa',
            result: 'non_reactive',
            tested_by_name: 'Lab Tech S. Paul'
          })
        });
        assert(ttiRes.status === 201, `TTI test ${tti} recorded as non_reactive`);
      }

      // Check Serology Workbench
      const seroWorkRes = await fetch(`${baseUrl}/blood-bank/serology-workbench`);
      const seroWorkData = await seroWorkRes.json();
      assert(seroWorkRes.status === 200, 'GET /serology-workbench returns 200');
      const workbenchDonation = seroWorkData.data.find(d => d.donation_id === donationId);
      assert(workbenchDonation.tti_tests.length === 5, 'All 5 TTI tests present in workbench');

      // Safety Test 1: Safe release authorization without dual grouping verification strictly rejected (400)
      const badRelease1 = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          release_decision: 'approved_for_release',
          all_tti_non_reactive: true,
          dual_grouping_verified: false, // Incomplete!
          authorized_by_name: 'Dr. Meenakshi Sundaram (BBO)',
          notes: 'Attempted premature release'
        })
      });
      assert(badRelease1.status === 400, 'Safe release without dual grouping verification strictly rejected (400)');

      // Safety Test 2 (Step 13): Safe release authorization with reactive TTI strictly rejected (400)
      const badRelease2 = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          release_decision: 'approved_for_release',
          all_tti_non_reactive: false, // Reactive infection!
          dual_grouping_verified: true,
          authorized_by_name: 'Dr. Meenakshi Sundaram (BBO)',
          notes: 'Attempted release with reactive TTI'
        })
      });
      assert(badRelease2.status === 400, 'Step 13: Safe release with reactive/untested TTI strictly rejected (400)');

      // Step 14: Verify that a component cannot be released simply because frontend displays positive status
      // Direct SQL update attempt without an approved release authorization must be aborted by database trigger
      let directStatusUpdateFailed = false;
      try {
        await pool.query("UPDATE blood_components SET status = 'safe_for_release' WHERE id = $1", [prbcComponentId]);
      } catch (err) {
        directStatusUpdateFailed = true;
      }
      assert(directStatusUpdateFailed === true, 'Step 14: Direct component status update to safe_for_release strictly blocked by database trigger fn_assert_donation_safe_release');

      // 3. Valid Safe Release Authorization (Step 14)
      const releaseRes = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          release_decision: 'approved_for_release',
          all_tti_non_reactive: true,
          dual_grouping_verified: true,
          authorized_by_name: 'Dr. Meenakshi Sundaram (BBO)',
          notes: 'Safe release certified.'
        })
      });
      const releaseData = await releaseRes.json();
      assert(releaseRes.status === 201, 'Step 14: Safe release authorization approved (201)');
      assert(releaseData.data.release_decision === 'approved_for_release', 'Step 14: Decision approved_for_release');

      // Verify PRBC component transitioned to safe_for_release
      const compCheckRes = await fetch(`${baseUrl}/blood-bank/components?status=safe_for_release`);
      const compCheckData = await compCheckRes.json();
      const releasedPrbc = compCheckData.data.find(c => c.id === prbcComponentId);
      assert(releasedPrbc !== undefined, 'Step 14: PRBC component status transitioned to safe_for_release');

      // Verify FFP component also transitioned to safe_for_release
      const releasedFfp = compCheckData.data.find(c => c.component_type === 'ffp');
      assert(releasedFfp !== undefined, 'Step 14: FFP component status also transitioned to safe_for_release');
    }

    // ========================================================================
    // SUITE 6: REQUISITIONS, CROSSMATCHING & RESERVATIONS API
    // ========================================================================
    console.log('\n--- SUITE 6: Requisition, Crossmatch & Reservation API ---');
    let requisitionId;
    let crossmatchId;
    let reservationId;
    let expiredXmId;
    let winningRequisitionId;
    {
      // Safety Test 1: Requisition for non-existent patient strictly blocked (404)
      const badReqRes = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uhid: 'UHID-NONEXISTENT-9999',
          requested_component: 'prbc',
          units_requested: 1,
          urgency: 'routine',
          clinical_indication: 'Invalid requisition check',
          patient_blood_group: 'O',
          patient_rh_factor: 'positive',
          requester_name: 'Dr. Ghost'
        })
      });
      assert(badReqRes.status === 404, 'Requisition with non-existent patient UHID rejected (404)');

      // 1. Create Valid Requisition
      const reqRes = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uhid: 'UHID-2026-TEST01',
          requested_component: 'prbc',
          units_requested: 1,
          urgency: 'urgent',
          clinical_indication: 'Pre-operative reserve for scheduled laparotomy',
          patient_blood_group: 'O',
          patient_rh_factor: 'positive',
          requester_name: 'Dr. Arindam Mitra'
        })
      });
      const reqData = await reqRes.json();
      assert(reqRes.status === 201, 'Step 15: POST /requisitions with valid UHID returns 201');
      assert(reqData.data.requisition_number.startsWith('REQ-'), 'Step 15: Requisition has generated REQ number');
      requisitionId = reqData.data.id;

      // Step 16: Verify requisition physically persisted in PostgreSQL and visible on read-back
      const reqDbCheck = await pool.query('SELECT * FROM blood_requisitions WHERE id = $1', [requisitionId]);
      assert(reqDbCheck.rows.length === 1, 'Step 16: Requisition confirmed physically persisted in PostgreSQL');
      assert(reqDbCheck.rows[0].status === 'pending', 'Step 16: Requisition initial status in PostgreSQL is pending');
      assert(reqDbCheck.rows[0].units_requested === 1, 'Step 16: Requisition units_requested = 1');

      // Safety Test 2: Incompatible crossmatch cannot be reserved
      const incompatibleXmRes = await fetch(`${baseUrl}/blood-bank/crossmatches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          technique: 'gel_card',
          major_crossmatch: 'incompatible',
          minor_crossmatch: 'compatible',
          compatibility_result: 'incompatible',
          performed_by_name: 'Tech Anirban Das'
        })
      });
      const incompatibleXmData = await incompatibleXmRes.json();
      assert(incompatibleXmRes.status === 201, 'Incompatible crossmatch recorded in lab');

      const badReserveXmRes = await fetch(`${baseUrl}/blood-bank/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          crossmatch_id: incompatibleXmData.data.id,
          reserved_by_name: 'Dr. Meenakshi'
        })
      });
      assert(badReserveXmRes.status === 400, 'Reservation using incompatible crossmatch strictly rejected (400)');

      // Safety Test 3: Expired crossmatch cannot be reserved
      const expiredXmClient = await pool.connect();
      try {
        const expXmRes = await expiredXmClient.query(
          `INSERT INTO blood_crossmatches (
            requisition_id, patient_id, component_id, technique,
            major_crossmatch, compatibility_result, performed_by_name,
            tested_at
          ) VALUES ($1, (SELECT patient_id FROM blood_requisitions WHERE id = $1), $2, 'gel_card',
            'compatible', 'compatible', 'Tech S. Paul', NOW() - INTERVAL '5 days')
          RETURNING id`,
          [requisitionId, prbcComponentId]
        );
        expiredXmId = expXmRes.rows[0].id;
      } finally {
        expiredXmClient.release();
      }

      const expiredReserveRes = await fetch(`${baseUrl}/blood-bank/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          crossmatch_id: expiredXmId,
          reserved_by_name: 'Dr. Meenakshi'
        })
      });
      assert(expiredReserveRes.status === 400, 'Reservation using expired crossmatch strictly rejected (400)');

      // 2. Perform Valid Compatible Crossmatch
      const xmRes = await fetch(`${baseUrl}/blood-bank/crossmatches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          technique: 'gel_card',
          major_crossmatch: 'compatible',
          minor_crossmatch: 'compatible',
          compatibility_result: 'compatible',
          performed_by_name: 'Tech Anirban Das'
        })
      });
      const xmData = await xmRes.json();
      assert(xmRes.status === 201, 'Crossmatch recorded as compatible');
      crossmatchId = xmData.data.id;

      // 3. Reserve Component
      const reserveRes = await fetch(`${baseUrl}/blood-bank/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          crossmatch_id: crossmatchId,
          reserved_by_name: 'Dr. Meenakshi'
        })
      });
      const reserveData = await reserveRes.json();
      assert(reserveRes.status === 201, 'Reservation created successfully');
      assert(reserveData.data.status === 'active', 'Reservation status is active');
      reservationId = reserveData.data.id;

      // Verify Requisition units_reserved incremented
      const reqCheckRes = await fetch(`${baseUrl}/blood-bank/requisitions`);
      const reqCheckData = await reqCheckRes.json();
      const targetReq = reqCheckData.data.find(r => r.id === requisitionId);
      assert(targetReq.units_reserved === 1, 'Requisition units_reserved = 1');

      // 4. Test Reservation Cancellation & Idempotent Balance Restoration
      const cancelRes = await fetch(`${baseUrl}/blood-bank/reservations/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservationId,
          cancellation_reason: 'Surgery rescheduled, release back to general stock',
          cancelled_by_name: 'Dr. Meenakshi'
        })
      });
      assert(cancelRes.status === 200, 'Reservation cancelled successfully');

      // Verify Requisition units_reserved restored to 0
      const reqCheckAfterCancelRes = await fetch(`${baseUrl}/blood-bank/requisitions`);
      const reqCheckAfterCancelData = await reqCheckAfterCancelRes.json();
      const targetReqAfterCancel = reqCheckAfterCancelData.data.find(r => r.id === requisitionId);
      assert(targetReqAfterCancel.units_reserved === 0, 'Requisition units_reserved decremented to 0');

      // 5. Concurrency Race Test: Two simultaneous reservation requests for the same available component unit
      // Create second requisition
      const req2Res = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uhid: 'UHID-2026-TEST01',
          requested_component: 'prbc',
          units_requested: 1,
          urgency: 'routine',
          clinical_indication: 'Concurrent reservation race test',
          patient_blood_group: 'O',
          patient_rh_factor: 'positive',
          requester_name: 'Dr. Subhash Bose'
        })
      });
      const req2Data = await req2Res.json();
      assert(req2Res.status === 201, 'Second requisition created for concurrency test');
      const req2Id = req2Data.data.id;

      // Parallel reservation attempts for prbcComponentId
      const [race1, race2] = await Promise.all([
        fetch(`${baseUrl}/blood-bank/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requisition_id: requisitionId,
            component_id: prbcComponentId,
            crossmatch_id: crossmatchId,
            reserved_by_name: 'Dr. Worker 1'
          })
        }),
        fetch(`${baseUrl}/blood-bank/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requisition_id: req2Id,
            component_id: prbcComponentId,
            crossmatch_id: crossmatchId,
            reserved_by_name: 'Dr. Worker 2'
          })
        })
      ]);

      const raceStatuses = [race1.status, race2.status];
      assert(raceStatuses.includes(201), 'Concurrency race: exactly one reservation succeeds (201)');
      assert(raceStatuses.includes(409), 'Concurrency race: the colliding reservation receives 409 Conflict');

      // Ensure reservationId points to the winning reservation for downstream issue testing
      const winData = race1.status === 201 ? await race1.json() : await race2.json();
      reservationId = winData.data.id;
      winningRequisitionId = race1.status === 201 ? requisitionId : req2Id;
    }

    // ========================================================================
    // SUITE 7: BLOOD ISSUE & SAFETY GATES ENFORCEMENT API
    // ========================================================================
    console.log('\n--- SUITE 7: Issue & Clinical Safety Gates Enforcement API ---');
    {
      // Safety Test 1: Routine issue without crossmatch MUST fail
      const badIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: winningRequisitionId,
          component_id: prbcComponentId,
          is_emergency_unmatched: false,
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'OT Nurse'
          // Omitting crossmatch_id!
        })
      });
      assert(badIssueRes.status === 400, 'Routine issue without crossmatch rejected (400)');

      // Safety Test 2: Emergency uncrossed release on routine requisition MUST fail
      const badEmergencyRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: winningRequisitionId, // Urgency is 'urgent' or 'routine', NOT 'stat_emergency'
          component_id: prbcComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Exsanguinating hemorrhage',
          emergency_authorized_by_name: 'Dr. Trauma Lead',
          issued_by_name: 'Dr. Meenakshi',
          verified_by_name: 'Tech Anirban Das',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(badEmergencyRes.status === 400, 'Emergency uncrossed release on non-stat requisition strictly blocked');

      // Safety Test 3: Routine issue with expired crossmatch MUST fail
      const badExpiredIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: winningRequisitionId,
          component_id: prbcComponentId,
          reservation_id: reservationId,
          crossmatch_id: expiredXmId, // Expired!
          is_emergency_unmatched: false,
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(badExpiredIssueRes.status === 400, 'Routine issue with expired crossmatch strictly rejected (400)');

      // Valid Routine Issue: Compatible crossmatch + valid reservation
      const validIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: winningRequisitionId,
          component_id: prbcComponentId,
          reservation_id: reservationId,
          crossmatch_id: crossmatchId,
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Staff Nurse R. Thomas (OT 2)',
          received_by_designation: 'Operating Theatre Nurse',
          transport_box_id: 'BOX-CTOT-04',
          transport_temperature_c: 4.2,
          cold_chain_maintained: true
        })
      });
      const validIssueData = await validIssueRes.json();
      assert(validIssueRes.status === 201, 'Routine compatible issue succeeds (201)');
      assert(validIssueData.data.issue_slip_number.startsWith('ISS-'), 'Issue slip generated');

      // Verify component status became 'issued'
      const compAfterIssueRes = await fetch(`${baseUrl}/blood-bank/components?status=issued`);
      const compAfterIssueData = await compAfterIssueRes.json();
      const issuedComp = compAfterIssueData.data.find(c => c.id === prbcComponentId);
      assert(issuedComp !== undefined, 'Component status marked as issued in inventory');

      // Verify requisition units_issued incremented
      const reqAfterIssueRes = await fetch(`${baseUrl}/blood-bank/requisitions`);
      const reqAfterIssueData = await reqAfterIssueRes.json();
      const targetReqAfterIssue = reqAfterIssueData.data.find(r => r.id === winningRequisitionId);
      assert(targetReqAfterIssue.units_issued === 1, 'Requisition units_issued incremented to 1');
      assert(targetReqAfterIssue.status === 'fulfilled', 'Requisition status transitioned to fulfilled');

      // ======================================================================
      // EMERGENCY UNCROSSED WORKFLOW (Step 19 & 20)
      // ======================================================================
      // 1. Create stat_emergency requisition for emergency release testing
      const statReqRes = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uhid: 'UHID-2026-TEST01',
          requested_component: 'ffp',
          units_requested: 1,
          urgency: 'stat_emergency',
          clinical_indication: 'Severe hemorrhagic shock with exsanguinating trauma',
          patient_blood_group: 'O',
          patient_rh_factor: 'positive',
          requester_name: 'Dr. Trauma Lead'
        })
      });
      const statReqData = await statReqRes.json();
      assert(statReqRes.status === 201, 'Step 19: stat_emergency requisition created (201)');
      const statReqId = statReqData.data.id;

      // 2. Fetch available FFP component
      const ffpCheckRes = await fetch(`${baseUrl}/blood-bank/components?status=safe_for_release`);
      const ffpCheckData = await ffpCheckRes.json();
      const ffpComp = ffpCheckData.data.find(c => c.component_type === 'ffp');
      assert(ffpComp !== undefined, 'Step 19: Verified safe_for_release FFP component in inventory');

      // 3. Emergency release without justification strictly rejected (400)
      const noJustRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: statReqId,
          component_id: ffpComp.id,
          is_emergency_unmatched: true,
          emergency_clinical_justification: '',
          emergency_authorized_by_name: 'Dr. Trauma Lead',
          issued_by_name: 'Dr. Meenakshi',
          verified_by_name: 'Tech Anirban Das',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Trauma Staff Nurse'
        })
      });
      assert(noJustRes.status === 400, 'Step 19: Emergency release without justification strictly rejected (400)');

      // 4. Emergency release without authorizer strictly rejected (400)
      const noAuthRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: statReqId,
          component_id: ffpComp.id,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Exsanguinating hemorrhagic trauma shock',
          emergency_authorized_by_name: '',
          issued_by_name: 'Dr. Meenakshi',
          verified_by_name: 'Tech Anirban Das',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Trauma Staff Nurse'
        })
      });
      assert(noAuthRes.status === 400, 'Step 19: Emergency release without authorizer strictly rejected (400)');

      // 5. Valid Emergency Uncrossed Release on stat_emergency Requisition
      const validEmergencyRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: statReqId,
          component_id: ffpComp.id,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Exsanguinating hemorrhagic trauma shock requiring urgent uncrossed plasma',
          emergency_authorizer_code: 'DOC-TR-01',
          emergency_authorizer_pin: '123456',
          emergency_authorized_by_name: 'Dr. Trauma Lead (Senior Consultant)',
          issued_by_name: 'Dr. Meenakshi Sundaram (BBO)',
          verified_by_name: 'Tech Anirban Das',
          received_by_name: 'Staff Nurse R. Thomas (Trauma Bay)',
          received_by_designation: 'Trauma Bay Senior Nurse',
          transport_box_id: 'BOX-EMERG-01',
          transport_temperature_c: 4.0,
          cold_chain_maintained: true
        })
      });
      const validEmergencyData = await validEmergencyRes.json();
      assert(validEmergencyRes.status === 201, 'Step 19: Valid emergency uncrossed release on stat_emergency succeeds (201)');
      assert(validEmergencyData.data.issue_slip_number.startsWith('ISS-'), 'Step 20: Emergency issue slip generated');
      assert(validEmergencyData.data.is_emergency_unmatched === true, 'Step 20: Issue record flagged as emergency unmatched');

      // Verify FFP component status transitioned to issued
      const ffpDbCheck = await pool.query('SELECT status FROM blood_components WHERE id = $1', [ffpComp.id]);
      assert(ffpDbCheck.rows[0].status === 'issued', 'Step 20: FFP component marked as issued in PostgreSQL');

      // Verify stat requisition status transitioned to fulfilled
      const statReqDbCheck = await pool.query('SELECT status, units_issued FROM blood_requisitions WHERE id = $1', [statReqId]);
      assert(statReqDbCheck.rows[0].status === 'fulfilled', 'Step 20: stat_emergency requisition marked as fulfilled');
      assert(statReqDbCheck.rows[0].units_issued === 1, 'Step 20: stat_emergency requisition units_issued incremented to 1');
    }

    // ========================================================================
    // SUITE 8: IMMUTABLE AUDIT TRAIL API
    // ========================================================================
    console.log('\n--- SUITE 8: Immutable Audit Trail API ---');
    {
      const auditRes = await fetch(`${baseUrl}/blood-bank/audit-logs?component_id=${prbcComponentId}`);
      const auditData = await auditRes.json();
      console.log('Recorded action types:', auditData.data.map(l => l.action_type));
      const actionTypes = auditData.data.map(l => l.action_type.toLowerCase());
      assert(actionTypes.includes('component_issued'), 'Audit trail captured COMPONENT_ISSUED action');
      assert(actionTypes.includes('component_reserved'), 'Audit trail captured COMPONENT_RESERVED action');
      assert(actionTypes.includes('reservation_cancelled_released'), 'Audit trail captured RESERVATION_CANCELLED_RELEASED action');
      assert(actionTypes.includes('safe_release_approved'), 'Audit trail captured safe_release_approved action');

      // Also check FFP emergency audit log (Step 20)
      const allAuditRes = await fetch(`${baseUrl}/blood-bank/audit-logs`);
      const allAuditData = await allAuditRes.json();
      const emergencyLog = allAuditData.data.find(l => l.metadata && l.metadata.emergency_release === true);
      assert(emergencyLog !== undefined, 'Step 20: Audit trail captured EMERGENCY UNCROSSED issue with authorizer and clinical justification');
    }

    // ========================================================================
    // SUITE 9: STORAGE TEMPERATURE LOGS & LIVE PATIENT UHID VERIFICATION
    // ========================================================================
    console.log('\n--- SUITE 9: Storage Temperature Logs & Patient UHID Verification ---');
    {
      // 1. Record compliant temperature reading for PRBC refrigerator (Step 11)
      const normalTempRes = await fetch(`${baseUrl}/blood-bank/storage-temperature-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_unit_code: 'FRIDGE-PRBC-01',
          storage_unit_type: 'prbc_refrigerator',
          recorded_temperature_c: 4.0,
          target_min_temp_c: 2.0,
          target_max_temp_c: 6.0,
          recorded_by_name: 'Tech Anirban Das'
        })
      });
      const normalTempData = await normalTempRes.json();
      assert(normalTempRes.status === 201, 'Step 11: POST /blood-bank/storage-temperature-logs returns 201');
      assert(normalTempData.data.alert_raised === false, 'Step 11: Compliant temperature logs alert_raised = false');

      // 2. Record excursion temperature reading (8.5°C > 6.0°C) triggering alert (Step 11)
      const alertTempRes = await fetch(`${baseUrl}/blood-bank/storage-temperature-logs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storage_unit_code: 'FRIDGE-PRBC-01',
          storage_unit_type: 'prbc_refrigerator',
          recorded_temperature_c: 8.5,
          target_min_temp_c: 2.0,
          target_max_temp_c: 6.0,
          recorded_by_name: 'Tech Sourav Paul',
          corrective_action: 'Compressor check and door seal realignment'
        })
      });
      const alertTempData = await alertTempRes.json();
      assert(alertTempRes.status === 201, 'Step 11: Excursion temperature log recorded (201)');
      assert(alertTempData.data.alert_raised === true, 'Step 11: Out-of-range temperature automatically raises alert');

      // 3. Query all temperature logs (Step 11)
      const allLogsRes = await fetch(`${baseUrl}/blood-bank/storage-temperature-logs`);
      const allLogsData = await allLogsRes.json();
      assert(allLogsRes.status === 200, 'Step 11: GET /blood-bank/storage-temperature-logs returns 200');
      assert(allLogsData.data.length >= 2, 'Step 11: Retrieved all persisted temperature logs');

      // 4. Query alert-only temperature logs (Step 11)
      const alertsOnlyRes = await fetch(`${baseUrl}/blood-bank/storage-temperature-logs?alert_only=true`);
      const alertsOnlyData = await alertsOnlyRes.json();
      assert(alertsOnlyRes.status === 200, 'Step 11: Alerts filter returns 200');
      assert(alertsOnlyData.data.length >= 1, 'Step 11: Alert filter returned excursion logs');
      assert(alertsOnlyData.data.every(l => l.alert_raised === true), 'Step 11: All returned logs have alert_raised = true');

      // 5. Patient UHID live lookup verification
      const validUhidRes = await fetch(`${baseUrl}/patients/UHID-2026-TEST01`);
      const validUhidData = await validUhidRes.json();
      assert(validUhidRes.status === 200, 'Live GET /patients/:uhid returns 200 for valid patient');
      assert(validUhidData.data.uhid === 'UHID-2026-TEST01', 'Live UHID lookup matches patient master record');

      // 6. Non-existent patient UHID returns 404
      const invalidUhidRes = await fetch(`${baseUrl}/patients/UHID-DOES-NOT-EXIST`);
      assert(invalidUhidRes.status === 404, 'Live GET /patients/:uhid returns 404 for non-existent patient');
    }

    // ========================================================================
    // SUITE 10: STEP 21 POST-AUDIT COMPREHENSIVE READ-BACK & STATE VERIFICATION
    // ========================================================================
    console.log('\n--- SUITE 10: Step 21 Comprehensive End-to-End Persistence Read-Back ---');
    {
      // 1. Patient Master
      const patReadRes = await fetch(`${baseUrl}/patients/UHID-2026-TEST01`);
      assert(patReadRes.status === 200, 'Step 21: Patient master record exists on read-back');

      // 2. Donor Registry
      const donorReadRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorReadData = await donorReadRes.json();
      assert(donorReadRes.status === 200, 'Step 21: Donor record exists on read-back');
      assert(donorReadData.data.donor_status === 'active', 'Step 21: Donor status remains active');

      // 3. Phlebotomy & Pilot Samples
      const donReadRes = await fetch(`${baseUrl}/blood-bank/donations`);
      const donReadData = await donReadRes.json();
      const donItem = donReadData.data.find(d => d.id === donationId);
      assert(donItem !== undefined, 'Step 21: Donation record exists on read-back');
      assert(donItem.pilot_samples.length === 3, 'Step 21: Exactly 3 pilot samples exist on read-back');

      // 4. Component Inventory
      const compReadRes = await fetch(`${baseUrl}/blood-bank/components`);
      const compReadData = await compReadRes.json();
      const prbcItem = compReadData.data.find(c => c.id === prbcComponentId);
      assert(prbcItem !== undefined, 'Step 21: PRBC component exists in inventory');
      assert(prbcItem.status === 'issued', 'Step 21: PRBC component status remains issued');

      // 5. Serology Workbench
      const seroReadRes = await fetch(`${baseUrl}/blood-bank/serology-workbench`);
      const seroReadData = await seroReadRes.json();
      const seroItem = seroReadData.data.find(d => d.donation_id === donationId);
      assert(seroItem !== undefined, 'Step 21: Serology workbench record exists on read-back');
      assert(seroItem.dual_grouping.concur === true, 'Step 21: Dual grouping verified concurred');
      assert(seroItem.tti_tests.length === 5, 'Step 21: All 5 TTI tests exist on read-back');

      // 6. Blood Requisitions
      const reqReadRes = await fetch(`${baseUrl}/blood-bank/requisitions`);
      const reqReadData = await reqReadRes.json();
      const reqItem = reqReadData.data.find(r => r.id === winningRequisitionId);
      assert(reqItem !== undefined, 'Step 21: Routine requisition exists on read-back');
      assert(reqItem.status === 'fulfilled', 'Step 21: Routine requisition status remains fulfilled');

      // 7. Blood Issues & Handover Dispatches
      const issueReadRes = await fetch(`${baseUrl}/blood-bank/issues`);
      const issueReadData = await issueReadRes.json();
      assert(issueReadRes.status === 200, 'Step 21: Issues list retrieved successfully');
      assert(issueReadData.data.length >= 2, 'Step 21: Both routine and emergency issues exist on read-back');

      // 8. Immutable Audit Trail
      const auditReadRes = await fetch(`${baseUrl}/blood-bank/audit-logs`);
      const auditReadData = await auditReadRes.json();
      assert(auditReadData.data.length >= 5, 'Step 21: Full audit history preserved without truncation or data loss');
    }

    console.log('\n============================================================');
    console.log(`ALL INTEGRATION TESTS PASSED: ${passedTests}/${totalTests} checks verified!`);
    console.log('Tested against isolated disposable database: medicsprime_disposable_test');
    console.log('Zero modifications or connections made to medicsprime_hms_dev.');
    console.log('============================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
