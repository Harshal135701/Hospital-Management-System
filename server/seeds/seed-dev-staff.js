/**
 * Development Database Seed Script: Institutional Staff & Reference Personas
 *
 * Seeds documented test accounts matching the frontend LoginModal quick-select personas.
 * ONLY for local development (`medicsprime_hms_dev`) and test environments.
 * Strictly blocked in production.
 */

const dotenv = require('dotenv');
dotenv.config();

const { Pool } = require('pg');
const { hashPassword, hashPin } = require('../src/modules/auth/auth.utils');

if (process.env.NODE_ENV === 'production') {
  console.error('FATAL: Attempted to run dev seed script in production environment!');
  process.exit(1);
}

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function seed() {
  const client = await pool.connect();
  try {
    const dbInfo = await client.query('SELECT current_database() as db');
    console.log(`[Seed] Connected to database: ${dbInfo.rows[0].db}`);

    await client.query('BEGIN');

    // 1. Departments
    console.log('[Seed] Ensuring reference departments exist...');
    const depts = [
      { name: 'Transfusion Medicine', code: 'TM', desc: 'Blood Bank & Transfusion Medicine Service' },
      { name: 'Trauma Surgery', code: 'TS', desc: 'Emergency & Trauma Surgery' },
      { name: 'Hospital Administration', code: 'ADMIN', desc: 'Hospital IT & Administration' },
      { name: 'Front Desk & Reception', code: 'OPD-REC', desc: 'Patient Intake & Reception' }
    ];

    const deptMap = {};
    for (const d of depts) {
      const res = await client.query(
        `INSERT INTO departments (name, code, description, is_active)
         VALUES ($1, $2, $3, TRUE)
         ON CONFLICT (code) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description
         RETURNING id, code`,
        [d.name, d.code, d.desc]
      );
      deptMap[d.code] = res.rows[0].id;
    }

    // 2. Doctor for Clinician Persona (Emergency PIN Authorization)
    console.log('[Seed] Ensuring reference clinician doctor exists...');
    const docRes = await client.query(
      `INSERT INTO doctors (employee_code, full_name, mobile, department_id, is_active)
       VALUES ('DOC-TR-01', 'Dr. Arindam Mitra', '9830000001', $1, TRUE)
       ON CONFLICT (employee_code) DO UPDATE SET full_name = EXCLUDED.full_name, is_active = TRUE
       RETURNING id`,
      [deptMap['TS']]
    );
    const doctorId = docRes.rows[0].id;

    // 3. Documented Test Staff Personas matching LoginModal.jsx
    console.log('[Seed] Provisioning documented institutional staff personas...');
    const staffPersonas = [
      {
        code: 'EMP-BBO-01',
        name: 'Dr. Meenakshi Sundaram',
        email: 'bbo@hospital.test',
        pass: 'BBO#Secure2026!',
        role: 'blood_bank_officer',
        deptId: deptMap['TM'],
        docId: null,
        pin: null
      },
      {
        code: 'EMP-LAB-01',
        name: 'Anirban Das',
        email: 'tech@hospital.test',
        pass: 'Tech#Pass2026!',
        role: 'lab_technician',
        deptId: deptMap['TM'],
        docId: null,
        pin: null
      },
      {
        code: 'EMP-PHL-01',
        name: 'Savitri Devi',
        email: 'phleb@hospital.test',
        pass: 'Phleb#Pass2026!',
        role: 'phlebotomist',
        deptId: deptMap['TM'],
        docId: null,
        pin: null
      },
      {
        code: 'EMP-DOC-01',
        name: 'Dr. Arindam Mitra',
        email: 'doctor@hospital.test',
        pass: 'Doc#Pass2026!',
        role: 'clinician_doctor',
        deptId: deptMap['TS'],
        docId: doctorId,
        pin: '123456'
      },
      {
        code: 'EMP-REC-01',
        name: 'Alok Roy',
        email: 'reception@hospital.test',
        pass: 'Recept#Pass2026!',
        role: 'receptionist',
        deptId: deptMap['OPD-REC'],
        docId: null,
        pin: null
      },
      {
        code: 'EMP-ADM-01',
        name: 'IT System Admin',
        email: 'admin@hospital.test',
        pass: 'Admin#Pass2026!',
        role: 'super_admin',
        deptId: deptMap['ADMIN'],
        docId: null,
        pin: null
      }
    ];

    for (const p of staffPersonas) {
      const passHash = hashPassword(p.pass);
      const pinHash = p.pin ? hashPin(p.pin) : null;
      await client.query(
        `INSERT INTO staff_accounts (
           employee_code, full_name, email, password_hash, emergency_pin_hash,
           role, department_id, doctor_id, is_active, token_version,
           failed_login_attempts, locked_until, failed_pin_attempts, pin_locked_until
         )
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE, 1, 0, NULL, 0, NULL)
         ON CONFLICT (email) DO UPDATE SET
           full_name = EXCLUDED.full_name,
           password_hash = EXCLUDED.password_hash,
           emergency_pin_hash = EXCLUDED.emergency_pin_hash,
           role = EXCLUDED.role,
           department_id = EXCLUDED.department_id,
           doctor_id = EXCLUDED.doctor_id,
           is_active = TRUE,
           failed_login_attempts = 0,
           locked_until = NULL`,
        [p.code, p.name, p.email, passHash, pinHash, p.role, p.deptId, p.docId]
      );
      console.log(`  ✓ Provisioned staff persona: ${p.email} [${p.role}]`);
    }

    // 4. Sample Blood Donor (for authenticated read-back testing)
    console.log('[Seed] Ensuring sample blood donor exists...');
    await client.query(
      `INSERT INTO blood_donors (
         donor_code, full_name, date_of_birth, gender, blood_group, rh_factor,
         mobile, email, donor_status
       )
       VALUES ('DNR-2026-0001', 'Sunil Kumar Banerjee', '1988-03-15', 'male', 'O', 'positive', '9831000001', 'sunil.banerjee@test.local', 'active')
       ON CONFLICT (donor_code) DO NOTHING`
    );
    console.log('  ✓ Verified sample donor DNR-2026-0001 exists');

    await client.query('COMMIT');
    console.log('[Seed] Dev seed successfully completed!');
  } catch (err) {
    await client.query('ROLLBACK');
    console.error('[Seed] Error during seeding:', err);
    throw err;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(() => process.exit(1));
