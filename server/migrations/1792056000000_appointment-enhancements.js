/**
 * Migration: 1792056000000_appointment-enhancements.js
 *
 * Adds appointment enhancements, doctor schedule room linkage,
 * blood requisition linkage to appointment blood requests,
 * performance indexes, and seeds standard reference rooms.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- Add optional appointment_number, notes, cancellation_reason, and is_priority to appointments
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS appointment_number VARCHAR(50),
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
      ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT FALSE;

    -- Backfill appointment_number for any existing rows
    UPDATE appointments
      SET appointment_number = 'APT-' || TO_CHAR(appointment_date, 'YYYY') || '-' || LPAD(token_number::text, 4, '0')
      WHERE appointment_number IS NULL;

    -- Add optional room_id to doctor_schedules
    ALTER TABLE doctor_schedules
      ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id) ON DELETE SET NULL;

    -- Add blood_requisition_id to appointment_blood_requests
    ALTER TABLE appointment_blood_requests
      ADD COLUMN IF NOT EXISTS blood_requisition_id UUID REFERENCES blood_requisitions(id) ON DELETE SET NULL;

    -- Ensure helpful indexes
    CREATE INDEX IF NOT EXISTS idx_appointments_date_status_token
      ON appointments (appointment_date, status, token_number);

    CREATE INDEX IF NOT EXISTS idx_rosters_doctor_date_published
      ON doctor_rosters (doctor_id, roster_date, status);

    CREATE INDEX IF NOT EXISTS idx_leaves_doctor_range_status
      ON doctor_leaves (doctor_id, start_date, end_date, status);

    CREATE INDEX IF NOT EXISTS idx_apt_blood_req_requisition
      ON appointment_blood_requests (blood_requisition_id);

    -- Seed reference consultation rooms if none exist
    INSERT INTO rooms (id, room_number, name, floor, is_active)
    VALUES 
      ('11111111-1111-1111-1111-111111111101', 'OPD-101', 'Cardiology Consultation Room 1', '1st Floor', TRUE),
      ('11111111-1111-1111-1111-111111111102', 'OPD-102', 'Cardiology Consultation Room 2', '1st Floor', TRUE),
      ('22222222-2222-2222-2222-222222222201', 'OPD-201', 'Pediatrics OPD Suite A', '2nd Floor', TRUE),
      ('22222222-2222-2222-2222-222222222202', 'OPD-202', 'General Medicine Consultation', '2nd Floor', TRUE)
    ON CONFLICT (room_number) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP INDEX IF EXISTS idx_apt_blood_req_requisition;
    DROP INDEX IF EXISTS idx_leaves_doctor_range_status;
    DROP INDEX IF EXISTS idx_rosters_doctor_date_published;
    DROP INDEX IF EXISTS idx_appointments_date_status_token;
    ALTER TABLE appointment_blood_requests DROP COLUMN IF EXISTS blood_requisition_id;
    ALTER TABLE doctor_schedules DROP COLUMN IF EXISTS room_id;
    ALTER TABLE appointments DROP COLUMN IF EXISTS appointment_number;
  `);
};
