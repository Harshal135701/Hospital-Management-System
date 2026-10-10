
/**
 * Initial Hospital Management System schema.
 * Creates the eight existing appointment-module tables.
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE departments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL UNIQUE,
      code VARCHAR(20) NOT NULL UNIQUE,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE rooms (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      room_number VARCHAR(20) NOT NULL UNIQUE,
      name VARCHAR(100),
      floor VARCHAR(20),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE patients (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      uhid VARCHAR(30) NOT NULL UNIQUE,
      full_name VARCHAR(150) NOT NULL,
      mobile VARCHAR(15) NOT NULL,
      date_of_birth DATE,
      gender VARCHAR(20),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_patients_mobile ON patients (mobile);

    CREATE TABLE doctors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      employee_code VARCHAR(30) NOT NULL UNIQUE,
      full_name VARCHAR(150) NOT NULL,
      mobile VARCHAR(15),
      department_id UUID NOT NULL REFERENCES departments(id),
      room_id UUID REFERENCES rooms(id),
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE doctor_schedules (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doctor_id UUID NOT NULL REFERENCES doctors(id),
      day_of_week SMALLINT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6),
      shift_type VARCHAR(20) NOT NULL
        CHECK (shift_type IN ('morning', 'evening')),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      max_patients INTEGER NOT NULL DEFAULT 30 CHECK (max_patients > 0),
      effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
      effective_until DATE,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (end_time > start_time),
      CHECK (effective_until IS NULL OR effective_until >= effective_from),
      UNIQUE (doctor_id, day_of_week, shift_type, effective_from)
    );

    CREATE TABLE doctor_leaves (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doctor_id UUID NOT NULL REFERENCES doctors(id),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'approved', 'rejected')),
      reviewed_by UUID REFERENCES doctors(id),
      reviewed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (end_date >= start_date)
    );

    CREATE TABLE doctor_rosters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      doctor_id UUID NOT NULL REFERENCES doctors(id),
      roster_date DATE NOT NULL,
      shift_type VARCHAR(20) NOT NULL
        CHECK (shift_type IN ('morning', 'evening', 'on_call')),
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      room_id UUID REFERENCES rooms(id),
      max_patients INTEGER NOT NULL DEFAULT 30 CHECK (max_patients > 0),
      status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'published')),
      published_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (end_time > start_time)
    );

    CREATE INDEX idx_doctor_rosters_date
      ON doctor_rosters (roster_date, doctor_id);

    CREATE TABLE appointments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id),
      doctor_id UUID NOT NULL REFERENCES doctors(id),
      department_id UUID NOT NULL REFERENCES departments(id),
      roster_id UUID REFERENCES doctor_rosters(id),
      room_id UUID REFERENCES rooms(id),
      appointment_date DATE NOT NULL,
      start_time TIME NOT NULL,
      end_time TIME NOT NULL,
      visit_type VARCHAR(20) NOT NULL
        CHECK (visit_type IN ('first_visit', 'follow_up')),
      token_number INTEGER NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'booked'
        CHECK (status IN (
          'booked', 'arrived', 'waiting', 'in_consultation',
          'completed', 'cancelled', 'no_show'
        )),
      rescheduled_from_id UUID REFERENCES appointments(id),
      arrived_at TIMESTAMPTZ,
      called_at TIMESTAMPTZ,
      consultation_started_at TIMESTAMPTZ,
      consultation_ended_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (end_time > start_time),
      CHECK (start_time < TIME '24:00')
    );

    CREATE INDEX idx_appointments_date_doctor
      ON appointments (appointment_date, doctor_id);

    CREATE INDEX idx_appointments_patient
      ON appointments (patient_id, appointment_date DESC);

    CREATE INDEX idx_appointments_queue
      ON appointments (appointment_date, doctor_id, status);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS appointments;
    DROP TABLE IF EXISTS doctor_rosters;
    DROP TABLE IF EXISTS doctor_leaves;
    DROP TABLE IF EXISTS doctor_schedules;
    DROP TABLE IF EXISTS doctors;
    DROP TABLE IF EXISTS patients;
    DROP TABLE IF EXISTS rooms;
    DROP TABLE IF EXISTS departments;
  `);
};
