/**
 * Migration: 1793000000002_core-hms-workflows-enhancements.js
 *
 * Core Hospital Management System schema enhancements:
 * - Full patient demographics (address, emergency contact, email, pin_code, city, state, blood group, allergies)
 * - Department activation, descriptions, and uniqueness
 * - Room configuration (room_type, department linkage, capacity, daily_tariff)
 * - Doctor configuration (specialty, consultation_fee, experience, qualifications)
 * - Appointment consultation_fee snapshot and duplicate booking prevention
 * - Notifications table for immediate confirmations and manual one-day-before reminders
 * - Donor compensations ledger for non-revenue IVF/Andrology compensation disbursements
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- 1. Patients Demographics & Contact Enhancements
    ALTER TABLE patients
      ADD COLUMN IF NOT EXISTS alt_mobile VARCHAR(20),
      ADD COLUMN IF NOT EXISTS email VARCHAR(150),
      ADD COLUMN IF NOT EXISTS address TEXT,
      ADD COLUMN IF NOT EXISTS city VARCHAR(100),
      ADD COLUMN IF NOT EXISTS district VARCHAR(100),
      ADD COLUMN IF NOT EXISTS state VARCHAR(100),
      ADD COLUMN IF NOT EXISTS pin_code VARCHAR(20),
      ADD COLUMN IF NOT EXISTS emergency_name VARCHAR(150),
      ADD COLUMN IF NOT EXISTS emergency_relationship VARCHAR(50),
      ADD COLUMN IF NOT EXISTS emergency_phone VARCHAR(20),
      ADD COLUMN IF NOT EXISTS blood_group VARCHAR(10),
      ADD COLUMN IF NOT EXISTS rh_factor VARCHAR(20),
      ADD COLUMN IF NOT EXISTS allergies TEXT,
      ADD COLUMN IF NOT EXISTS high_risk BOOLEAN DEFAULT FALSE;

    CREATE INDEX IF NOT EXISTS idx_patients_uhid_trgm ON patients (uhid);
    CREATE INDEX IF NOT EXISTS idx_patients_name ON patients (full_name);

    -- 2. Department Management Enhancements
    ALTER TABLE departments
      ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT TRUE,
      ADD COLUMN IF NOT EXISTS description TEXT;

    -- 3. Room Management Enhancements
    ALTER TABLE rooms
      ADD COLUMN IF NOT EXISTS room_type VARCHAR(50) DEFAULT 'general',
      ADD COLUMN IF NOT EXISTS department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
      ADD COLUMN IF NOT EXISTS capacity INT NOT NULL DEFAULT 1,
      ADD COLUMN IF NOT EXISTS daily_tariff NUMERIC NOT NULL DEFAULT 0;

    -- 4. Doctor Management & Consultation Fees
    ALTER TABLE doctors
      ADD COLUMN IF NOT EXISTS specialty VARCHAR(150),
      ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC NOT NULL DEFAULT 500,
      ADD COLUMN IF NOT EXISTS experience_years INT DEFAULT 0,
      ADD COLUMN IF NOT EXISTS qualifications VARCHAR(255);

    -- 5. Appointment Consultation Fee Snapshot & Conflict Safeguards
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS consultation_fee NUMERIC NOT NULL DEFAULT 500;

    -- Concurrency duplicate appointment protection
    CREATE UNIQUE INDEX IF NOT EXISTS uq_patient_doctor_slot
      ON appointments (patient_id, doctor_id, appointment_date, start_time)
      WHERE status NOT IN ('cancelled', 'no_show');

    -- 6. Notifications Table (Immediate Booking Confirmations & Date Reminders)
    CREATE TABLE IF NOT EXISTS notifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id UUID REFERENCES appointments(id) ON DELETE CASCADE,
      patient_id UUID REFERENCES patients(id) ON DELETE SET NULL,
      channel VARCHAR(20) NOT NULL DEFAULT 'sms',
      event_type VARCHAR(50) NOT NULL,
      recipient VARCHAR(50) NOT NULL,
      message TEXT NOT NULL,
      scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sent', 'delivered', 'failed', 'simulated', 'cancelled')),
      sent_at TIMESTAMPTZ,
      provider_message_id VARCHAR(100),
      error_message TEXT,
      attempts INT NOT NULL DEFAULT 0,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_notifications_appointment
      ON notifications (appointment_id, channel, event_type);

    CREATE INDEX IF NOT EXISTS idx_notifications_status_scheduled
      ON notifications (status, scheduled_at);

    -- 7. IVF & Andrology Donor Compensations Disbursement Ledger
    CREATE TABLE IF NOT EXISTS donor_compensations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      compensation_number VARCHAR(50) UNIQUE NOT NULL,
      donor_id VARCHAR(50) NOT NULL,
      donor_code VARCHAR(50) NOT NULL,
      donor_category VARCHAR(50) NOT NULL DEFAULT 'Sperm Donor',
      amount NUMERIC NOT NULL CHECK (amount > 0),
      payment_method VARCHAR(30) NOT NULL DEFAULT 'neft'
        CHECK (payment_method IN ('cash', 'upi', 'neft', 'card', 'bank_transfer')),
      transaction_reference VARCHAR(100),
      status VARCHAR(30) NOT NULL DEFAULT 'processed'
        CHECK (status IN ('pending', 'approved', 'processed', 'rejected')),
      notes TEXT,
      approved_by VARCHAR(100) DEFAULT 'Chief Medical Officer',
      processed_by VARCHAR(100) DEFAULT 'Accounts Cashier',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_donor_compensations_donor
      ON donor_compensations (donor_code);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS donor_compensations CASCADE;
    DROP TABLE IF EXISTS notifications CASCADE;
    DROP INDEX IF EXISTS uq_patient_doctor_slot;
    ALTER TABLE appointments DROP COLUMN IF EXISTS consultation_fee;
    ALTER TABLE doctors DROP COLUMN IF EXISTS qualifications;
    ALTER TABLE doctors DROP COLUMN IF EXISTS experience_years;
    ALTER TABLE doctors DROP COLUMN IF EXISTS consultation_fee;
    ALTER TABLE doctors DROP COLUMN IF EXISTS specialty;
    ALTER TABLE rooms DROP COLUMN IF EXISTS daily_tariff;
    ALTER TABLE rooms DROP COLUMN IF EXISTS capacity;
    ALTER TABLE rooms DROP COLUMN IF EXISTS department_id;
    ALTER TABLE rooms DROP COLUMN IF EXISTS room_type;
    ALTER TABLE departments DROP COLUMN IF EXISTS description;
    ALTER TABLE departments DROP COLUMN IF EXISTS is_active;
    ALTER TABLE patients DROP COLUMN IF EXISTS high_risk;
    ALTER TABLE patients DROP COLUMN IF EXISTS allergies;
    ALTER TABLE patients DROP COLUMN IF EXISTS rh_factor;
    ALTER TABLE patients DROP COLUMN IF EXISTS blood_group;
    ALTER TABLE patients DROP COLUMN IF EXISTS emergency_phone;
    ALTER TABLE patients DROP COLUMN IF EXISTS emergency_relationship;
    ALTER TABLE patients DROP COLUMN IF EXISTS emergency_name;
    ALTER TABLE patients DROP COLUMN IF EXISTS pin_code;
    ALTER TABLE patients DROP COLUMN IF EXISTS state;
    ALTER TABLE patients DROP COLUMN IF EXISTS district;
    ALTER TABLE patients DROP COLUMN IF EXISTS city;
    ALTER TABLE patients DROP COLUMN IF EXISTS address;
    ALTER TABLE patients DROP COLUMN IF EXISTS email;
    ALTER TABLE patients DROP COLUMN IF EXISTS alt_mobile;
  `);
};
