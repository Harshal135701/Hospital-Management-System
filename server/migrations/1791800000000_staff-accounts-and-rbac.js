/**
 * Staff Accounts, Token Revocations, and RBAC Security Hardening Migration
 * Migration: 1791800000000_staff-accounts-and-rbac.js
 *
 * Implements:
 * 1. staff_accounts: Institutional staff registry with salted scrypt password hashing,
 *    role enforcement (7 approved roles), account lockout counters, and token_version for instant invalidation.
 * 2. token_revocations: Cryptographic JTI blacklist supporting immediate session termination on logout.
 * 3. Linkage to doctors, departments, blood_issues, and blood_audit_trail with foreign-key referential integrity.
 * 4. Reversible down() cleanly restoring previous schema state.
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    -- 1. Create Staff Accounts Table
    CREATE TABLE IF NOT EXISTS staff_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_code VARCHAR(30) NOT NULL UNIQUE,
      full_name VARCHAR(150) NOT NULL,
      email VARCHAR(150) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      emergency_pin_hash VARCHAR(255),
      role VARCHAR(30) NOT NULL CHECK (
        role IN (
          'super_admin',
          'blood_bank_officer',
          'lab_technician',
          'phlebotomist',
          'clinician_doctor',
          'staff_nurse',
          'receptionist'
        )
      ),
      department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
      doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      token_version INTEGER NOT NULL DEFAULT 1,
      failed_login_attempts INTEGER NOT NULL DEFAULT 0,
      locked_until TIMESTAMPTZ,
      failed_pin_attempts INTEGER NOT NULL DEFAULT 0,
      pin_locked_until TIMESTAMPTZ,
      must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_staff_accounts_email ON staff_accounts(email);
    CREATE INDEX IF NOT EXISTS idx_staff_accounts_emp_code ON staff_accounts(employee_code);
    CREATE INDEX IF NOT EXISTS idx_staff_accounts_doctor_id ON staff_accounts(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_staff_accounts_role ON staff_accounts(role);

    -- 2. Create Token Revocations Blacklist Table
    CREATE TABLE IF NOT EXISTS token_revocations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      token_id VARCHAR(100) NOT NULL UNIQUE,
      user_id UUID REFERENCES staff_accounts(id) ON DELETE CASCADE,
      revoked_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_token_revocations_jti ON token_revocations(token_id);

    -- 3. Add Foreign-Key Linkage to Blood Issues Table
    ALTER TABLE blood_issues
      ADD COLUMN IF NOT EXISTS issued_by_user_id UUID REFERENCES staff_accounts(id),
      ADD COLUMN IF NOT EXISTS emergency_authorized_by_doctor_id UUID REFERENCES doctors(id);

    -- 4. Add Audit Trail Identity Columns to blood_inventory_audit_logs
    ALTER TABLE blood_inventory_audit_logs
      ADD COLUMN IF NOT EXISTS actor_user_id UUID REFERENCES staff_accounts(id),
      ADD COLUMN IF NOT EXISTS actor_role VARCHAR(30),
      ADD COLUMN IF NOT EXISTS client_ip VARCHAR(45);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    -- Revert audit and issue extensions
    ALTER TABLE blood_inventory_audit_logs
      DROP COLUMN IF EXISTS client_ip,
      DROP COLUMN IF EXISTS actor_role,
      DROP COLUMN IF EXISTS actor_user_id;

    ALTER TABLE blood_issues
      DROP COLUMN IF EXISTS emergency_authorized_by_doctor_id,
      DROP COLUMN IF EXISTS issued_by_user_id;

    -- Drop security tables
    DROP TABLE IF EXISTS token_revocations CASCADE;
    DROP TABLE IF EXISTS staff_accounts CASCADE;
  `);
};
