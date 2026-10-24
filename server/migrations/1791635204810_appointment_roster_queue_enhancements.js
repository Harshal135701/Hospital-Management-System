/**
 * Migration: Enhance appointments, doctor_schedules and add sample rooms.
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- Add optional notes, cancellation_reason, and is_priority to appointments
    ALTER TABLE appointments
      ADD COLUMN IF NOT EXISTS notes TEXT,
      ADD COLUMN IF NOT EXISTS cancellation_reason TEXT,
      ADD COLUMN IF NOT EXISTS is_priority BOOLEAN NOT NULL DEFAULT FALSE;

    -- Add optional room_id to doctor_schedules
    ALTER TABLE doctor_schedules
      ADD COLUMN IF NOT EXISTS room_id UUID REFERENCES rooms(id);

    -- Ensure helpful index for waiting room & token queue displays
    CREATE INDEX IF NOT EXISTS idx_appointments_date_status_token
      ON appointments (appointment_date, status, token_number);

    CREATE INDEX IF NOT EXISTS idx_rosters_doctor_date_published
      ON doctor_rosters (doctor_id, roster_date, status);

    CREATE INDEX IF NOT EXISTS idx_leaves_doctor_range_status
      ON doctor_leaves (doctor_id, start_date, end_date, status);

    -- Seed rooms if none exist
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
    DROP INDEX IF EXISTS idx_leaves_doctor_range_status;
    DROP INDEX IF EXISTS idx_rosters_doctor_date_published;
    DROP INDEX IF EXISTS idx_appointments_date_status_token;
    ALTER TABLE doctor_schedules DROP COLUMN IF EXISTS room_id;
    ALTER TABLE appointments DROP COLUMN IF EXISTS is_priority;
    ALTER TABLE appointments DROP COLUMN IF EXISTS cancellation_reason;
    ALTER TABLE appointments DROP COLUMN IF EXISTS notes;
  `);
};
