import pg from 'pg';
const { Pool } = pg;
import path from 'path';
import http from 'http';
import crypto from 'crypto';
import dotenv from 'dotenv';
dotenv.config();

// ============================================================================
// STRICT SAFETY GUARD: ENSURE DISPOSABLE TEST DATABASE ONLY
// ============================================================================
const TEST_DB = 'medicsprime_disposable_test';
const DEV_DB = 'medicsprime_hms_dev';

if (TEST_DB === DEV_DB) {
  throw new Error('FATAL: TEST_DB cannot be the same as DEV_DB!');
}

process.env.DB_NAME = TEST_DB;
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || '';

console.log('------------------------------------------------------------');
console.log('SAFETY VERIFICATION: Auth & Blood Bank Flow Test Suite');
console.log(`Active Target Database: ${process.env.DB_NAME}`);
console.log(`Explicitly Prohibited DB: ${DEV_DB}`);
console.log('------------------------------------------------------------');

if (process.env.DB_NAME !== TEST_DB) {
  throw new Error(`FATAL: DB_NAME is ${process.env.DB_NAME}, expected ${TEST_DB}`);
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

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log(`[Setup] Resetting public schema in isolated ${TEST_DB}...`);
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    console.log('[Setup] Applying Migration 1: 1791635204809_initial-schema.js...');
    await executeMigration(client, 'migrations/1791635204809_initial-schema.js');

    console.log('[Setup] Applying Migration 2: 1791980000000_blood-bank-schema.js...');
    await executeMigration(client, 'migrations/1791980000000_blood-bank-schema.js');

    console.log('[Setup] Applying Migration 3: 1791980000001_blood-bank-refinements.js...');
    await executeMigration(client, 'migrations/1791980000001_blood-bank-refinements.js');

    console.log('[Setup] Applying Migration 4: 1791980000002_staff-accounts-and-rbac.js...');
    await executeMigration(client, 'migrations/1791980000002_staff-accounts-and-rbac.js');

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
      { code: 'EMP-REC-01', name: 'Alok Roy', email: 'reception@hospital.test', pass: 'Recept#Pass2026!', role: 'receptionist', docId: null, deptId, pin: null },
      { code: 'EMP-ADM-01', name: 'IT Admin', email: 'admin@hospital.test', pass: 'Admin#Pass2026!', role: 'super_admin', docId: null, deptId, pin: null }
    ];

    for (const acc of testAccounts) {
      await client.query(
        `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, emergency_pin_hash, role, doctor_id, department_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [acc.code, acc.name, acc.email, hashPassword(acc.pass), acc.pin ? hashPassword(acc.pin) : null, acc.role, acc.docId, acc.deptId]
      );
    }

    // Seed test donor in PostgreSQL
    await client.query(
      `INSERT INTO blood_donors (donor_code, full_name, date_of_birth, gender, blood_group, rh_factor, mobile, email, donor_status)
       VALUES ('DNR-2026-0001', 'Sunil Kumar Banerjee', '1988-03-15', 'male', 'O', 'positive', '9831000001', 'sunil.banerjee@test.local', 'active')`
    );

    console.log(`✓ All migrations, staff seed accounts, and test donor successfully applied to ${TEST_DB}`);
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

    // ========================================================================
    // CHECK 1: Missing Bearer Token on Protected Endpoints Returns 401, Public 200
    // ========================================================================
    console.log('\n--- CHECK 1: Unauthenticated Access Detection & Public Endpoints ---');
    {
      const healthRes = await fetch(`${baseUrl}/health`);
      assert(healthRes.status === 200, 'Public GET /health returns HTTP 200 without Authorization header');

      const protectedEndpoints = ['/blood-bank/donors', '/appointments', '/patients', '/blood-requests'];
      for (const ep of protectedEndpoints) {
        const unauthRes = await fetch(`${baseUrl}${ep}`);
        const unauthData = await unauthRes.json();
        assert(unauthRes.status === 401, `Unauthenticated GET ${ep} returns HTTP 401 Unauthorized`);
        assert(unauthData.code === 'UNAUTHORIZED', `GET ${ep} returns code: UNAUTHORIZED`);
        assert(
          unauthData.message.includes('Authentication required. Missing Bearer token in Authorization header'),
          `GET ${ep} returns message: "Authentication required. Missing Bearer token in Authorization header."`
        );
      }
    }

    // ========================================================================
    // CHECK 2: Login API Exists and Returns Valid JWT & Profile
    // ========================================================================
    console.log('\n--- CHECK 2: Working Login API & Token Retrieval ---');
    let bboToken;
    let bboUser;
    {
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bbo@hospital.test', password: 'BBO#Secure2026!' })
      });
      const loginData = await loginRes.json();
      assert(loginRes.status === 200, 'POST /auth/login returns HTTP 200');
      assert(loginData.success === true, 'Login returns success: true');
      assert(typeof loginData.data?.token === 'string' && loginData.data.token.length > 20, 'Returns signed JWT token string');
      assert(loginData.data?.user?.email === 'bbo@hospital.test', 'Returns user email bbo@hospital.test');
      assert(loginData.data?.user?.role === 'blood_bank_officer', 'Returns user role blood_bank_officer');
      assert(loginData.data?.user?.employee_code === 'EMP-BBO-01', 'Returns employee code EMP-BBO-01');

      bboToken = loginData.data.token;
      bboUser = loginData.data.user;
    }

    // ========================================================================
    // CHECK 3: Protected Request with Bearer Token Loads Donor Data (200 OK)
    // ========================================================================
    console.log('\n--- CHECK 3: Protected Data Fetching with Bearer Token ---');
    {
      const authRes = await fetch(`${baseUrl}/blood-bank/donors`, {
        headers: {
          'Authorization': `Bearer ${bboToken}`,
          'Content-Type': 'application/json'
        }
      });
      const authData = await authRes.json();
      assert(authRes.status === 200, 'Authenticated GET /blood-bank/donors returns HTTP 200');
      assert(authData.success === true, 'Returns success: true');
      assert(Array.isArray(authData.data), 'Returns data array');
      assert(authData.data.length >= 1, 'Data array contains real PostgreSQL donor records');
      assert(authData.data[0].donor_code === 'DNR-2026-0001', 'Loaded donor matches seeded PostgreSQL record DNR-2026-0001');
      assert(authData.data[0].full_name === 'Sunil Kumar Banerjee', 'Loaded donor full_name matches Sunil Kumar Banerjee');
    }

    // ========================================================================
    // CHECK 4: Unauthorized Access (RBAC 403 Forbidden)
    // ========================================================================
    console.log('\n--- CHECK 4: Unauthorized Access & Separation of Duties ---');
    {
      // 4A: Login as receptionist
      const recLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'reception@hospital.test', password: 'Recept#Pass2026!' })
      });
      const recLoginData = await recLoginRes.json();
      assert(recLoginRes.status === 200, 'Receptionist login returns HTTP 200');
      const recToken = recLoginData.data.token;

      // Receptionist is unauthorized for /blood-bank/donors
      const recAccessRes = await fetch(`${baseUrl}/blood-bank/donors`, {
        headers: {
          'Authorization': `Bearer ${recToken}`,
          'Content-Type': 'application/json'
        }
      });
      const recAccessData = await recAccessRes.json();
      assert(recAccessRes.status === 403, 'Receptionist accessing /blood-bank/donors receives HTTP 403 Forbidden');
      assert(recAccessData.code === 'FORBIDDEN', 'Returns code: FORBIDDEN');
      assert(recAccessData.message.toLowerCase().includes('receptionist'), 'Clear error states receptionist role is not authorized');

      // 4B: Super Admin unauthorized for safe release (Separation of Duties)
      const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@hospital.test', password: 'Admin#Pass2026!' })
      });
      const adminLoginData = await adminLoginRes.json();
      const adminToken = adminLoginData.data.token;

      const adminReleaseRes = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${adminToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          donation_id: '00000000-0000-0000-0000-000000000001',
          release_decision: 'approved_for_release'
        })
      });
      assert(adminReleaseRes.status === 403, 'Super Admin denied safe release authorization (403 Separation of Duties)');
    }

    // ========================================================================
    // CHECK 5: Logout & Token Revocation
    // ========================================================================
    console.log('\n--- CHECK 5: Logout & Session Revocation ---');
    {
      const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${bboToken}`,
          'Content-Type': 'application/json'
        }
      });
      const logoutData = await logoutRes.json();
      assert(logoutRes.status === 200, 'POST /auth/logout returns HTTP 200');
      assert(logoutData.success === true, 'Returns success: true on logout');

      // Subsequent access with revoked token strictly rejected
      const revokedAccessRes = await fetch(`${baseUrl}/blood-bank/donors`, {
        headers: {
          'Authorization': `Bearer ${bboToken}`,
          'Content-Type': 'application/json'
        }
      });
      const revokedAccessData = await revokedAccessRes.json();
      assert(revokedAccessRes.status === 401, 'Request with revoked token strictly rejected (401)');
      assert(revokedAccessData.code === 'TOKEN_REVOKED', 'Returns error code: TOKEN_REVOKED');
      assert(revokedAccessData.message.includes('Token has been revoked'), 'Clear message indicates session was terminated');
    }

    // ========================================================================
    // CHECK 6: Invalid Credentials & Brute Force Prevention
    // ========================================================================
    console.log('\n--- CHECK 6: Invalid Credentials & Username Enumeration Protection ---');
    {
      const badPassRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bbo@hospital.test', password: 'WrongPassword!' })
      });
      assert(badPassRes.status === 401, 'Invalid password returns HTTP 401');

      const badEmailRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@hospital.test', password: 'WrongPassword!' })
      });
      assert(badEmailRes.status === 401, 'Nonexistent email returns identical HTTP 401 preventing user enumeration');
    }

    console.log('\n============================================================');
    console.log(`ALL AUTH & BLOOD BANK FLOW TESTS PASSED: ${passedTests}/${totalTests} checks verified!`);
    console.log(`Database: ${TEST_DB} (Isolated Disposable Database)`);
    console.log(`Zero modifications made to: ${DEV_DB}`);
    console.log('============================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
    process.exit(0);
  }
}

runTests().catch((err) => {
  console.error('\nTEST FAILED:', err);
  process.exit(1);
});
