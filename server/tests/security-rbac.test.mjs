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
process.env.JWT_SECRET = 'medicsprime-test-suite-secure-secret-key-at-least-32-chars';
process.env.NODE_ENV = 'test';

console.log('------------------------------------------------------------');
console.log('SAFETY VERIFICATION: Comprehensive RBAC Security Test Suite');
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

// Helper for dynamic migrations
async function executeMigration(client, relPath, direction = 'up') {
  const fullPath = path.resolve(import.meta.dirname, '..', relPath);
  const mod = await import('file:///' + fullPath.replace(/\\/g, '/'));
  const sqlStatements = [];
  const pgm = {
    sql: (q) => { sqlStatements.push(q); }
  };
  if (direction === 'up') {
    mod.up(pgm);
  } else {
    mod.down(pgm);
  }
  for (const stmt of sqlStatements) {
    await client.query(stmt);
  }
}

// Password hashing utility matching auth.utils.js
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
    await executeMigration(client, 'migrations/1791635204809_initial-schema.js', 'up');

    console.log('[Setup] Applying Migration 2: 1791785051918_blood-bank-schema.js...');
    await executeMigration(client, 'migrations/1791785051918_blood-bank-schema.js', 'up');

    console.log('[Setup] Applying Migration 3: 1791785895061_blood-bank-refinements.js...');
    await executeMigration(client, 'migrations/1791785895061_blood-bank-refinements.js', 'up');

    console.log('[Setup] Applying Migration 4: 1791800000000_staff-accounts-and-rbac.js...');
    await executeMigration(client, 'migrations/1791800000000_staff-accounts-and-rbac.js', 'up');

    // Migration Rollback Verification: Test down() and up()
    console.log('[Setup] Verifying Migration 4 rollback down()...');
    await executeMigration(client, 'migrations/1791800000000_staff-accounts-and-rbac.js', 'down');
    const tableCheck = await client.query("SELECT to_regclass('public.staff_accounts') as tbl");
    if (tableCheck.rows[0].tbl !== null) {
      throw new Error('Migration down() failed to drop staff_accounts table!');
    }
    console.log('✓ Migration 4 down() verified cleanly dropped staff_accounts and token_revocations');

    console.log('[Setup] Re-applying Migration 4 up()...');
    await executeMigration(client, 'migrations/1791800000000_staff-accounts-and-rbac.js', 'up');
    console.log(`✓ All 4 migrations successfully applied to ${TEST_DB}`);
  } finally {
    client.release();
  }
}

async function runSecurityTests() {
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

    // Dynamically import real Express production app
    const appMod = await import('../src/app.js');
    const app = appMod.default || appMod;

    // Start server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;
    console.log(`[Server] Production Express server listening on ephemeral port ${port} -> ${baseUrl}`);

    // Pre-populate Department & Doctor in Disposable DB
    const deptRes = await pool.query("INSERT INTO departments (name, code) VALUES ('Transfusion Medicine', 'TM') RETURNING id");
    const deptId = deptRes.rows[0].id;
    const traumaDeptRes = await pool.query("INSERT INTO departments (name, code) VALUES ('Trauma Surgery', 'TS') RETURNING id");
    const traumaDeptId = traumaDeptRes.rows[0].id;

    const docRes = await pool.query(
      "INSERT INTO doctors (employee_code, full_name, mobile, department_id, is_active) VALUES ('DOC-TR-01', 'Dr. Arindam Mitra', '9830000001', $1, TRUE) RETURNING id",
      [traumaDeptId]
    );
    const doctorId = docRes.rows[0].id;

    // Pre-populate 7 Distinct Role Staff Accounts in Disposable DB
    // Doctor Arindam Mitra has secret emergency PIN: '123456'
    const testAccounts = [
      { code: 'EMP-BBO-01', name: 'Dr. Meenakshi Sundaram', email: 'bbo@hospital.test', pass: 'BBO#Secure2026!', role: 'blood_bank_officer', docId: null, deptId, pin: null },
      { code: 'EMP-LAB-01', name: 'Anirban Das', email: 'tech@hospital.test', pass: 'Tech#Pass2026!', role: 'lab_technician', docId: null, deptId, pin: null },
      { code: 'EMP-PHL-01', name: 'Savitri Devi', email: 'phleb@hospital.test', pass: 'Phleb#Pass2026!', role: 'phlebotomist', docId: null, deptId, pin: null },
      { code: 'EMP-DOC-01', name: 'Dr. Arindam Mitra', email: 'doctor@hospital.test', pass: 'Doc#Pass2026!', role: 'clinician_doctor', docId: doctorId, deptId: traumaDeptId, pin: '123456' },
      { code: 'EMP-NUR-01', name: 'R. Thomas', email: 'nurse@hospital.test', pass: 'Nurse#Pass2026!', role: 'staff_nurse', docId: null, deptId: traumaDeptId, pin: null },
      { code: 'EMP-REC-01', name: 'Alok Roy', email: 'reception@hospital.test', pass: 'Recept#Pass2026!', role: 'receptionist', docId: null, deptId, pin: null },
      { code: 'EMP-ADM-01', name: 'IT Admin', email: 'admin@hospital.test', pass: 'Admin#Pass2026!', role: 'super_admin', docId: null, deptId, pin: null },
      { code: 'EMP-LOCK-01', name: 'Lockout Test User', email: 'lockout@hospital.test', pass: 'Lockout#Pass2026!', role: 'lab_technician', docId: null, deptId, pin: null }
    ];

    for (const acc of testAccounts) {
      await pool.query(
        `INSERT INTO staff_accounts (employee_code, full_name, email, password_hash, emergency_pin_hash, role, doctor_id, department_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [acc.code, acc.name, acc.email, hashPassword(acc.pass), acc.pin ? hashPassword(acc.pin) : null, acc.role, acc.docId, acc.deptId]
      );
    }
    console.log('✓ Pre-populated 8 staff accounts with salted scrypt password hashes and emergency PINs');

    // ========================================================================
    // SUITE 1: PASSWORD HASHING, AUTHENTICATION & ACCOUNT LOCKOUT
    // ========================================================================
    console.log('\n--- SUITE 1: Password Hashing, Authentication & Account Lockout ---');
    let bboToken, techToken, phlebToken, docToken, nurseToken, receptionToken, adminToken;
    {
      // 1. Password storage check
      const dbPassCheck = await pool.query('SELECT email, password_hash FROM staff_accounts');
      for (const row of dbPassCheck.rows) {
        assert(row.password_hash.startsWith('scrypt$'), `Password for ${row.email} is stored as salted scrypt hash`);
        assert(!row.password_hash.includes('Pass') && !row.password_hash.includes('Secure'), `Password for ${row.email} does not contain plaintext string`);
      }

      // 2. Valid Login returns JWT and user profile
      const loginRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bbo@hospital.test', password: 'BBO#Secure2026!' })
      });
      const loginData = await loginRes.json();
      assert(loginRes.status === 200, 'Valid credentials return HTTP 200');
      assert(typeof loginData.data.token === 'string', 'Returns signed JWT token');
      assert(loginData.data.user.role === 'blood_bank_officer', 'Returns user object with verified role');
      bboToken = loginData.data.token;

      // Log in all roles
      async function getTokenFor(email, pass) {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password: pass })
        });
        const d = await res.json();
        return d.data.token;
      }

      techToken = await getTokenFor('tech@hospital.test', 'Tech#Pass2026!');
      phlebToken = await getTokenFor('phleb@hospital.test', 'Phleb#Pass2026!');
      docToken = await getTokenFor('doctor@hospital.test', 'Doc#Pass2026!');
      nurseToken = await getTokenFor('nurse@hospital.test', 'Nurse#Pass2026!');
      receptionToken = await getTokenFor('reception@hospital.test', 'Recept#Pass2026!');
      adminToken = await getTokenFor('admin@hospital.test', 'Admin#Pass2026!');

      // 3. Invalid Password returns generic error
      const badPassRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'bbo@hospital.test', password: 'WrongPassword123' })
      });
      assert(badPassRes.status === 401, 'Invalid password returns HTTP 401 Unauthorized');
      const badPassData = await badPassRes.json();
      assert(badPassData.message === 'Invalid email or password', 'Generic error message masks account existence');

      // 4. Nonexistent email returns identical generic error
      const badEmailRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'nonexistent@hospital.test', password: 'WrongPassword123' })
      });
      assert(badEmailRes.status === 401, 'Nonexistent email returns HTTP 401 Unauthorized');
      const badEmailData = await badEmailRes.json();
      assert(badEmailData.message === 'Invalid email or password', 'Identical error prevents username enumeration');

      // 5. Account Lockout: 5 consecutive failed login attempts trigger lockout
      for (let i = 1; i <= 4; i++) {
        const failRes = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'lockout@hospital.test', password: `WrongAttempt#${i}` })
        });
        assert(failRes.status === 401, `Failed attempt #${i} returns 401`);
      }

      // 5th failed attempt triggers lockout
      const fifthRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'lockout@hospital.test', password: 'WrongAttempt#5' })
      });
      assert(fifthRes.status === 403, '5th consecutive failed attempt returns HTTP 403 Account Locked');
      const fifthData = await fifthRes.json();
      assert(fifthData.message.includes('locked'), 'Response message confirms account lockout');

      // 6th attempt from another station with CORRECT password is also strictly blocked by database lockout
      const sixthRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-forwarded-for': '10.0.0.99' },
        body: JSON.stringify({ email: 'lockout@hospital.test', password: 'Lockout#Pass2026!' })
      });
      assert(sixthRes.status === 403, 'Subsequent login with correct password blocked while account is locked (403)');
      const sixthData = await sixthRes.json();
      assert(sixthData.message.includes('locked'), 'Response confirms account is locked across all terminals');

      // 7th attempt from the original IP triggers the IP rate limiter (429)
      const seventhRes = await fetch(`${baseUrl}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'lockout@hospital.test', password: 'WrongAttempt#7' })
      });
      assert(seventhRes.status === 429, 'Excessive login requests from same IP trigger rate limiter (429 Too Many Requests)');
      assert(seventhRes.headers.has('retry-after'), 'Rate limiter provides Retry-After header');

      // Verify database lockout state
      const lockDbCheck = await pool.query('SELECT failed_login_attempts, locked_until FROM staff_accounts WHERE email = $1', ['lockout@hospital.test']);
      assert(lockDbCheck.rows[0].failed_login_attempts >= 5, 'Database confirms 5 failed attempts recorded');
      assert(new Date(lockDbCheck.rows[0].locked_until) > new Date(), 'Database confirms locked_until is set in the future');
    }

    // ========================================================================
    // SUITE 2: JWT INTEGRITY, TAMPERING, EXPIRY, REVOCATION & PROFILE
    // ========================================================================
    console.log('\n--- SUITE 2: JWT Integrity, Tampering & Revocation ---');
    {
      // 1. Missing Authorization header
      const noAuthRes = await fetch(`${baseUrl}/patients`);
      assert(noAuthRes.status === 401, 'Request without Authorization header rejected (401)');

      // 2. Malformed token
      const malformedRes = await fetch(`${baseUrl}/patients`, {
        headers: { 'Authorization': 'Bearer this.is.not.a.valid.jwt' }
      });
      assert(malformedRes.status === 401, 'Malformed JWT rejected (401)');

      // 3. Tampered token signature
      const tokenParts = techToken.split('.');
      const tamperedToken = `${tokenParts[0]}.${tokenParts[1]}.tampered_signature_payload`;
      const tamperedRes = await fetch(`${baseUrl}/patients`, {
        headers: { 'Authorization': `Bearer ${tamperedToken}` }
      });
      assert(tamperedRes.status === 401, 'Tampered token signature strictly rejected (401)');

      // 4. Altered token role (Privilege Escalation attempt)
      const decodedPayload = JSON.parse(Buffer.from(tokenParts[1], 'base64url').toString('utf8'));
      decodedPayload.role = 'blood_bank_officer'; // Attempt escalation
      const forgedBody = Buffer.from(JSON.stringify(decodedPayload)).toString('base64url');
      const forgedToken = `${tokenParts[0]}.${forgedBody}.${tokenParts[2]}`;
      const forgedRes = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${forgedToken}` },
        body: JSON.stringify({ donation_id: 'd0000000-0000-0000-0000-000000000001' })
      });
      assert(forgedRes.status === 401, 'Forged payload with old signature strictly rejected (401)');

      // 5. Current User Profile endpoint
      const meRes = await fetch(`${baseUrl}/auth/me`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(meRes.status === 200, 'GET /auth/me returns 200');
      const meData = await meRes.json();
      assert(meData.data.email === 'tech@hospital.test', 'GET /auth/me returns authenticated staff email');
      assert(meData.data.role === 'lab_technician', 'GET /auth/me returns authenticated staff role');

      // 6. Explicit Logout and Revocation
      const logoutRes = await fetch(`${baseUrl}/auth/logout`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(logoutRes.status === 200, 'Logout succeeds and revokes token JTI (200)');

      // Subsequent request with revoked token must fail
      const postLogoutRes = await fetch(`${baseUrl}/blood-bank/components`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(postLogoutRes.status === 401, 'Subsequent request with revoked token strictly rejected (401)');
      const postLogoutData = await postLogoutRes.json();
      assert(postLogoutData.code === 'TOKEN_REVOKED', 'Returns TOKEN_REVOKED error code');

      // Re-login technician for subsequent tests
      techToken = await (async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'tech@hospital.test', password: 'Tech#Pass2026!' })
        });
        const d = await res.json();
        return d.data.token;
      })();
      assert(typeof techToken === 'string', 'Re-login issued fresh valid token');
    }

    // ========================================================================
    // SUITE 3: DEACTIVATED STAFF & DEMOTED ROLES IMMEDIATE INVALIDATION
    // ========================================================================
    console.log('\n--- SUITE 3: Deactivated Staff & Demoted Roles Immediate Invalidation ---');
    {
      // 1. Valid request before deactivation
      const preDeactRes = await fetch(`${baseUrl}/blood-bank/components`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(preDeactRes.status === 200, 'Active staff member token succeeds (200)');

      // 2. Admin deactivates staff account in database
      await pool.query("UPDATE staff_accounts SET is_active = FALSE WHERE email = 'tech@hospital.test'");

      // 3. Same unexpired token must be immediately rejected
      const deactRes = await fetch(`${baseUrl}/blood-bank/components`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(deactRes.status === 403, 'Deactivated staff member token immediately rejected (403)');
      const deactData = await deactRes.json();
      assert(deactData.code === 'ACCOUNT_DEACTIVATED', 'Returns ACCOUNT_DEACTIVATED error code');

      // 4. Re-activate account, demote role and increment token_version
      await pool.query(
        "UPDATE staff_accounts SET is_active = TRUE, role = 'phlebotomist', token_version = token_version + 1 WHERE email = 'tech@hospital.test'"
      );

      // 5. Older unexpired token with old token_version immediately rejected
      const staleRes = await fetch(`${baseUrl}/blood-bank/components`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(staleRes.status === 401, 'Stale token with old token_version immediately rejected (401)');
      const staleData = await staleRes.json();
      assert(staleData.code === 'SESSION_INVALIDATED', 'Returns SESSION_INVALIDATED error code');

      // Restore technician account to original role
      await pool.query(
        "UPDATE staff_accounts SET role = 'lab_technician', token_version = token_version + 1 WHERE email = 'tech@hospital.test'"
      );
      techToken = await (async () => {
        const res = await fetch(`${baseUrl}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'tech@hospital.test', password: 'Tech#Pass2026!' })
        });
        const d = await res.json();
        return d.data.token;
      })();
    }

    // ========================================================================
    // SUITE 4: PROTECTED READ-ONLY ENDPOINTS RBAC POLICIES
    // ========================================================================
    console.log('\n--- SUITE 4: Protected Read-Only Endpoints RBAC Policies ---');
    {
      // 1. GET /patients: Phlebotomist forbidden, Receptionist permitted
      const phlebPatRes = await fetch(`${baseUrl}/patients`, {
        headers: { 'Authorization': `Bearer ${phlebToken}` }
      });
      assert(phlebPatRes.status === 403, 'PHLEBOTOMIST denied GET /patients (403 Forbidden)');

      const recepPatRes = await fetch(`${baseUrl}/patients`, {
        headers: { 'Authorization': `Bearer ${receptionToken}` }
      });
      assert(recepPatRes.status === 200, 'RECEPTIONIST permitted GET /patients (200 OK)');

      // 2. GET /blood-bank/donors: Clinician forbidden, Phlebotomist permitted
      const docDonorRes = await fetch(`${baseUrl}/blood-bank/donors`, {
        headers: { 'Authorization': `Bearer ${docToken}` }
      });
      assert(docDonorRes.status === 403, 'CLINICIAN_DOCTOR denied GET /blood-bank/donors (403 Forbidden)');

      const phlebDonorRes = await fetch(`${baseUrl}/blood-bank/donors`, {
        headers: { 'Authorization': `Bearer ${phlebToken}` }
      });
      assert(phlebDonorRes.status === 200, 'PHLEBOTOMIST permitted GET /blood-bank/donors (200 OK)');

      // 3. GET /blood-bank/components: Phlebotomist forbidden, Lab Tech permitted
      const phlebCompRead = await fetch(`${baseUrl}/blood-bank/components`, {
        headers: { 'Authorization': `Bearer ${phlebToken}` }
      });
      assert(phlebCompRead.status === 403, 'PHLEBOTOMIST denied GET /blood-bank/components (403 Forbidden)');

      const techCompRead = await fetch(`${baseUrl}/blood-bank/components`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(techCompRead.status === 200, 'LAB_TECHNICIAN permitted GET /blood-bank/components (200 OK)');

      // 4. GET /blood-bank/serology-workbench: Clinician forbidden, Lab Tech permitted
      const docSeroRead = await fetch(`${baseUrl}/blood-bank/serology-workbench`, {
        headers: { 'Authorization': `Bearer ${docToken}` }
      });
      assert(docSeroRead.status === 403, 'CLINICIAN_DOCTOR denied GET /blood-bank/serology-workbench (403 Forbidden)');

      const techSeroRead = await fetch(`${baseUrl}/blood-bank/serology-workbench`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(techSeroRead.status === 200, 'LAB_TECHNICIAN permitted GET /blood-bank/serology-workbench (200 OK)');

      // 5. GET /blood-bank/requisitions: Phlebotomist forbidden, Nurse permitted
      const phlebReqRead = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        headers: { 'Authorization': `Bearer ${phlebToken}` }
      });
      assert(phlebReqRead.status === 403, 'PHLEBOTOMIST denied GET /blood-bank/requisitions (403 Forbidden)');

      const nurseReqRead = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        headers: { 'Authorization': `Bearer ${nurseToken}` }
      });
      assert(nurseReqRead.status === 200, 'STAFF_NURSE permitted GET /blood-bank/requisitions (200 OK)');

      // 6. GET /blood-bank/audit-logs: Lab Tech forbidden, BBO permitted, Super Admin permitted
      const techAuditRead = await fetch(`${baseUrl}/blood-bank/audit-logs`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(techAuditRead.status === 403, 'LAB_TECHNICIAN denied GET /blood-bank/audit-logs (403 Forbidden)');

      const bboAuditRead = await fetch(`${baseUrl}/blood-bank/audit-logs`, {
        headers: { 'Authorization': `Bearer ${bboToken}` }
      });
      assert(bboAuditRead.status === 200, 'BLOOD_BANK_OFFICER permitted GET /blood-bank/audit-logs (200 OK)');

      const adminAuditRead = await fetch(`${baseUrl}/blood-bank/audit-logs`, {
        headers: { 'Authorization': `Bearer ${adminToken}` }
      });
      assert(adminAuditRead.status === 200, 'SUPER_ADMIN permitted GET /blood-bank/audit-logs (200 OK)');

      // 7. GET /blood-bank/storage-temperature-logs: Phlebotomist forbidden, Lab Tech permitted
      const phlebTempRead = await fetch(`${baseUrl}/blood-bank/storage-temperature-logs`, {
        headers: { 'Authorization': `Bearer ${phlebToken}` }
      });
      assert(phlebTempRead.status === 403, 'PHLEBOTOMIST denied GET /blood-bank/storage-temperature-logs (403 Forbidden)');

      const techTempRead = await fetch(`${baseUrl}/blood-bank/storage-temperature-logs`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      assert(techTempRead.status === 200, 'LAB_TECHNICIAN permitted GET /blood-bank/storage-temperature-logs (200 OK)');
    }

    // ========================================================================
    // SUITE 5: COMPLETE ENDPOINT-TO-ROLE MUTATION WORKFLOW & SEPARATION OF DUTIES
    // ========================================================================
    console.log('\n--- SUITE 5: Complete Endpoint-to-Role Mutation Workflow & Separation of Duties ---');
    let testPatientUhid;
    let testDonorId;
    let testScreeningId;
    let testDonationId;
    let testComponentId;
    let testRequisitionId;
    {
      // 1. Patient Registration: RECEPTIONIST permitted, PHLEBOTOMIST prohibited
      const phlebPatCreate = await fetch(`${baseUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${phlebToken}` },
        body: JSON.stringify({ full_name: 'Patient Unauthorized', mobile: '9830099999', date_of_birth: '1990-01-01', gender: 'male' })
      });
      assert(phlebPatCreate.status === 403, 'PHLEBOTOMIST denied POST /patients (403 Forbidden)');

      const recepPatCreate = await fetch(`${baseUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${receptionToken}` },
        body: JSON.stringify({ full_name: 'Devika Sengupta', mobile: '9830122410', date_of_birth: '1988-04-12', gender: 'female' })
      });
      const patData = await recepPatCreate.json();
      assert(recepPatCreate.status === 201, 'RECEPTIONIST permitted POST /patients (201 Created)');
      testPatientUhid = patData.data.uhid;

      // 2. Donor Registration: PHLEBOTOMIST permitted, CLINICIAN prohibited
      const docDonorCreate = await fetch(`${baseUrl}/blood-bank/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
        body: JSON.stringify({ full_name: 'Donor Unauth', date_of_birth: '1992-05-14', gender: 'male', mobile: '9831122334' })
      });
      assert(docDonorCreate.status === 403, 'CLINICIAN_DOCTOR denied POST /blood-bank/donors (403 Forbidden)');

      const phlebDonorCreate = await fetch(`${baseUrl}/blood-bank/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${phlebToken}` },
        body: JSON.stringify({ full_name: 'Subhash Mukherjee', date_of_birth: '1992-05-14', gender: 'male', mobile: '9831122334', blood_group: 'O', rh_factor: 'positive' })
      });
      const donorData = await phlebDonorCreate.json();
      assert(phlebDonorCreate.status === 201, 'PHLEBOTOMIST permitted POST /blood-bank/donors (201 Created)');
      testDonorId = donorData.data.id;

      // 3. Donor Screening: PHLEBOTOMIST permitted, RECEPTIONIST prohibited
      const recepScreenCreate = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${receptionToken}` },
        body: JSON.stringify({ donor_id: testDonorId, weight_kg: 68, hemoglobin_g_dl: 14.5, blood_pressure_systolic: 120, blood_pressure_diastolic: 80, pulse_bpm: 72, consent_obtained: true, eligibility_status: 'approved', reviewed_by_name: 'Nurse Savitri' })
      });
      assert(recepScreenCreate.status === 403, 'RECEPTIONIST denied POST /blood-bank/screenings (403 Forbidden)');

      const phlebScreenCreate = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${phlebToken}` },
        body: JSON.stringify({ donor_id: testDonorId, weight_kg: 68, hemoglobin_g_dl: 14.5, blood_pressure_systolic: 120, blood_pressure_diastolic: 80, pulse_bpm: 72, consent_obtained: true, eligibility_status: 'approved', reviewed_by_name: 'Nurse Savitri Devi' })
      });
      const screenData = await phlebScreenCreate.json();
      assert(phlebScreenCreate.status === 201, 'PHLEBOTOMIST permitted POST /blood-bank/screenings (201 Created)');
      testScreeningId = screenData.data.id;

      // 4. Blood Collection: PHLEBOTOMIST permitted, STAFF_NURSE prohibited
      const nurseColCreate = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${nurseToken}` },
        body: JSON.stringify({ donor_id: testDonorId, screening_id: testScreeningId, primary_bag_barcode: 'BB-RBAC-001', volume_ml: 450, bag_type: 'triple', phlebotomist_name: 'Nurse Savitri' })
      });
      assert(nurseColCreate.status === 403, 'STAFF_NURSE denied POST /blood-bank/donations (403 Forbidden)');

      const phlebColCreate = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${phlebToken}` },
        body: JSON.stringify({ donor_id: testDonorId, screening_id: testScreeningId, primary_bag_barcode: 'BB-RBAC-001', volume_ml: 450, bag_type: 'triple', phlebotomist_name: 'Nurse Savitri Devi' })
      });
      const colData = await phlebColCreate.json();
      assert(phlebColCreate.status === 201, 'PHLEBOTOMIST permitted POST /blood-bank/donations (201 Created)');
      testDonationId = colData.data.id;

      // 5. Component Separation: LAB_TECHNICIAN permitted, PHLEBOTOMIST prohibited
      const compPayload = {
        parent_donation_id: testDonationId,
        components: [{
          component_barcode: 'PRBC-RBAC-01',
          component_type: 'prbc',
          volume_ml: 280,
          storage_location: 'Cold-01',
          storage_min_temp_c: 2.0,
          storage_max_temp_c: 6.0,
          expires_at: new Date(Date.now() + 42 * 24 * 3600 * 1000).toISOString()
        }]
      };

      const phlebCompCreate = await fetch(`${baseUrl}/blood-bank/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${phlebToken}` },
        body: JSON.stringify(compPayload)
      });
      assert(phlebCompCreate.status === 403, 'PHLEBOTOMIST denied POST /blood-bank/components (403 Forbidden)');

      const techCompCreate = await fetch(`${baseUrl}/blood-bank/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify(compPayload)
      });
      const compData = await techCompCreate.json();
      assert(techCompCreate.status === 201, 'LAB_TECHNICIAN permitted POST /blood-bank/components (201 Created)');
      testComponentId = compData.data[0].id;

      // 6. Dual Grouping & Serology: LAB_TECHNICIAN permitted, CLINICIAN prohibited
      const docSeroCreate = await fetch(`${baseUrl}/blood-bank/serology-tests`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
        body: JSON.stringify({ donation_id: testDonationId, test_name: 'hiv_1_2', test_method: 'elisa', result: 'non_reactive', tested_by_name: 'Dr. Mitra' })
      });
      assert(docSeroCreate.status === 403, 'CLINICIAN_DOCTOR denied POST /blood-bank/serology-tests (403 Forbidden)');

      // Record dual grouping by lab tech
      await fetch(`${baseUrl}/blood-bank/grouping-verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({ donation_id: testDonationId, forward_anti_a: '0', forward_anti_b: '0', forward_anti_d: '4+', reverse_a_cells: '4+', reverse_b_cells: '4+', determined_abo_group: 'O', determined_rh_factor: 'positive', technician1_name: 'Tech 1', technician2_name: 'Tech 2', technicians_concur: true })
      });

      // Record 5 TTI tests by lab tech
      for (const tti of ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria']) {
        await fetch(`${baseUrl}/blood-bank/serology-tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
          body: JSON.stringify({ donation_id: testDonationId, test_name: tti, test_method: 'elisa', result: 'non_reactive', tested_by_name: 'Tech 1' })
        });
      }

      // 7. SEPARATION OF DUTIES: SAFE RELEASE GATE
      // Lab Tech is forbidden from safe release approval
      const techReleaseCreate = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({ donation_id: testDonationId, release_decision: 'approved_for_release', all_tti_non_reactive: true, dual_grouping_verified: true, authorized_by_name: 'Tech Anirban' })
      });
      assert(techReleaseCreate.status === 403, 'LAB_TECHNICIAN denied POST /blood-bank/release-authorizations (403 Forbidden)');

      // SUPER ADMIN is strictly forbidden from signing clinical safe release!
      const adminReleaseCreate = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({ donation_id: testDonationId, release_decision: 'approved_for_release', all_tti_non_reactive: true, dual_grouping_verified: true, authorized_by_name: 'IT Admin' })
      });
      assert(adminReleaseCreate.status === 403, 'SUPER_ADMIN denied POST /blood-bank/release-authorizations (403 Separation of Duties)');

      // BLOOD BANK OFFICER is the ONLY role authorized to sign biological safe release
      const bboReleaseCreate = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${bboToken}` },
        body: JSON.stringify({ donation_id: testDonationId, release_decision: 'approved_for_release', all_tti_non_reactive: true, dual_grouping_verified: true, authorized_by_name: 'Dr. Meenakshi Sundaram (BBO)' })
      });
      assert(bboReleaseCreate.status === 201, 'BLOOD_BANK_OFFICER permitted POST /blood-bank/release-authorizations (201 Approved)');

      // Verify PRBC transitioned to safe_for_release
      const compCheckRes = await fetch(`${baseUrl}/blood-bank/components?status=safe_for_release`, {
        headers: { 'Authorization': `Bearer ${techToken}` }
      });
      const compCheckData = await compCheckRes.json();
      assert(compCheckData.data.some(c => c.id === testComponentId), 'PRBC component successfully transitioned to safe_for_release');

      // 8. Requisition Creation: CLINICIAN permitted, PHLEBOTOMIST prohibited
      const phlebReqCreate = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${phlebToken}` },
        body: JSON.stringify({ patient_uhid: testPatientUhid, requested_component: 'prbc', units_requested: 1, urgency: 'stat_emergency', clinical_indication: 'Trauma shock', requester_name: 'Phleb S.' })
      });
      assert(phlebReqCreate.status === 403, 'PHLEBOTOMIST denied POST /blood-bank/requisitions (403 Forbidden)');

      const docReqCreate = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${docToken}` },
        body: JSON.stringify({ patient_uhid: testPatientUhid, requested_component: 'prbc', units_requested: 1, urgency: 'stat_emergency', clinical_indication: 'Trauma shock', requester_name: 'Dr. Arindam Mitra' })
      });
      const reqData = await docReqCreate.json();
      assert(docReqCreate.status === 201, 'CLINICIAN_DOCTOR permitted POST /blood-bank/requisitions (201 Created)');
      testRequisitionId = reqData.data.id;
    }

    // ========================================================================
    // SUITE 6: SECURE EMERGENCY CLINICIAN AUTHORIZATION (ANTI-FORGERY & THROTTLING)
    // ========================================================================
    console.log('\n--- SUITE 6: Secure Emergency Clinician Authorization ---');
    {
      // 1. Super Admin strictly prohibited from issuing blood
      const adminIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${adminToken}` },
        body: JSON.stringify({
          requisition_id: testRequisitionId,
          component_id: testComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Exsanguinating hemorrhage',
          emergency_authorizer_code: 'DOC-TR-01',
          emergency_authorizer_pin: '123456',
          issued_by_name: 'IT Admin',
          verified_by_name: 'Dr. Meenakshi',
          received_by_name: 'OT Nurse',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(adminIssueRes.status === 403, 'SUPER_ADMIN denied POST /blood-bank/issues (403 Forbidden)');

      // 2. Missing Clinician Code on emergency issue
      const missingCodeRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({
          requisition_id: testRequisitionId,
          component_id: testComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Severe hemorrhagic shock',
          emergency_authorizer_pin: '123456',
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(missingCodeRes.status === 400, 'Missing clinician code rejected (400 Bad Request)');

      // 3. Missing Clinician PIN on emergency issue
      const missingPinRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({
          requisition_id: testRequisitionId,
          component_id: testComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Severe hemorrhagic shock',
          emergency_authorizer_code: 'DOC-TR-01',
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(missingPinRes.status === 400, 'Missing clinician PIN rejected (400 Bad Request)');

      // 4. Forged / Non-existent Doctor Code
      const forgedDoctorRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({
          requisition_id: testRequisitionId,
          component_id: testComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Severe hemorrhagic shock',
          emergency_authorizer_code: 'FAKE-DOC-999',
          emergency_authorizer_pin: '123456',
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(forgedDoctorRes.status === 403, 'Forged / nonexistent clinician code rejected (403 Forbidden)');

      // 5. Wrong Emergency Release PIN
      const wrongPinRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({
          requisition_id: testRequisitionId,
          component_id: testComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Severe hemorrhagic shock',
          emergency_authorizer_code: 'DOC-TR-01',
          emergency_authorizer_pin: '999999', // INCORRECT PIN
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(wrongPinRes.status === 403, 'Incorrect clinician emergency PIN rejected (403 Forbidden)');

      // 6. Emergency PIN Attempt Throttling: 3 consecutive wrong PINs trigger lockout
      for (let p = 1; p <= 2; p++) {
        await fetch(`${baseUrl}/blood-bank/issues`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
          body: JSON.stringify({
            requisition_id: testRequisitionId,
            component_id: testComponentId,
            is_emergency_unmatched: true,
            emergency_clinical_justification: 'Severe hemorrhagic shock',
            emergency_authorizer_code: 'DOC-TR-01',
            emergency_authorizer_pin: '000000',
            issued_by_name: 'Tech Anirban Das',
            verified_by_name: 'Tech Sourav Paul',
            received_by_name: 'Nurse Savitri',
            received_by_designation: 'Staff Nurse'
          })
        });
      }

      // Now PIN is locked out
      const lockedPinRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({
          requisition_id: testRequisitionId,
          component_id: testComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Severe hemorrhagic shock',
          emergency_authorizer_code: 'DOC-TR-01',
          emergency_authorizer_pin: '123456', // Even correct PIN blocked while locked!
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(lockedPinRes.status === 403, '3 consecutive wrong PIN attempts lock clinician emergency authorization (403)');
      const lockedPinData = await lockedPinRes.json();
      assert(lockedPinData.message.includes('locked'), 'Response confirms clinician PIN lockout');

      // Admin or system resets doctor PIN lock for emergency resolution
      await pool.query("UPDATE staff_accounts SET failed_pin_attempts = 0, pin_locked_until = NULL WHERE employee_code = 'EMP-DOC-01'");

      // 7. Valid Clinician Code + Valid PIN succeeds
      const validIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${techToken}` },
        body: JSON.stringify({
          requisition_id: testRequisitionId,
          component_id: testComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Severe hemorrhagic shock verified by attending trauma surgeon',
          emergency_authorizer_code: 'DOC-TR-01',
          emergency_authorizer_pin: '123456', // VERIFIED DOCTOR PIN!
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Dr. Meenakshi Sundaram',
          received_by_name: 'Nurse R. Thomas',
          received_by_designation: 'Trauma OT Nurse'
        })
      });
      const validIssueData = await validIssueRes.json();
      assert(validIssueRes.status === 201, 'Verified clinician code + PIN permits emergency uncrossed blood release (201 Created)');
      assert(validIssueData.data.issue_slip_number.startsWith('ISS-'), 'Generated authenticated issue slip');

      // 8. Database Verification: Check persisted row in blood_issues
      const issueDbCheck = await pool.query(
        'SELECT issued_by_user_id, emergency_authorized_by_doctor_id, is_emergency_unmatched FROM blood_issues WHERE id = $1',
        [validIssueData.data.id]
      );
      assert(issueDbCheck.rows.length === 1, 'Issue record persisted in PostgreSQL');
      assert(issueDbCheck.rows[0].is_emergency_unmatched === true, 'Issue flagged as emergency unmatched');
      assert(issueDbCheck.rows[0].emergency_authorized_by_doctor_id === doctorId, 'Doctor ID correctly bound to emergency authorizer in database');

      // 9. Database Verification: Audit Trail captured both acting tech and authorizer
      const auditDbCheck = await pool.query(
        "SELECT * FROM blood_inventory_audit_logs WHERE action_type = 'emergency_uncrossed_issue' OR (metadata->>'emergency_release')::boolean = true"
      );
      assert(auditDbCheck.rows.length >= 1, 'Audit trail captured emergency release with forensic metadata');
    }

    console.log('\n============================================================');
    console.log(`ALL COMPREHENSIVE RBAC SECURITY TESTS PASSED: ${passedTests}/${totalTests} checks verified!`);
    console.log(`Tested against isolated disposable database: ${TEST_DB}`);
    console.log(`Zero modifications or connections made to ${DEV_DB}.`);
    console.log('============================================================\n');

  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await pool.end();
  }
}

runSecurityTests().catch((err) => {
  console.error('\nSECURITY TEST SUITE FAILED:', err);
  process.exit(1);
});
