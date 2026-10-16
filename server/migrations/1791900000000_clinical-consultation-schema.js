/**
 * Migration: 1791900000000_clinical-consultation-schema.js
 *
 * Clinical Consultation Schema:
 * 1. consultation_encounters: Core consultation encounter lifecycle bridging appointments, patients, and doctors.
 * 2. vitals_records: Patient vitals and physiological observations.
 * 3. clinical_histories: Longitudinal and acute clinical history (chief complaint, HPI, past, medication, allergy, family).
 * 4. provider_orders: Computerized Provider Order Entry (CPOE) for laboratory, imaging, medication, and procedures.
 * 5. clinical_progress_notes: Structured SOAP clinical documentation authored by attending clinicians.
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    -- 1. Consultation Encounters
    CREATE TABLE IF NOT EXISTS consultation_encounters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      appointment_id UUID NOT NULL UNIQUE REFERENCES appointments(id) ON DELETE RESTRICT,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
      status VARCHAR(20) NOT NULL DEFAULT 'in_progress',
      started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      completed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT consultation_status_check CHECK (status IN ('in_progress', 'completed', 'cancelled')),
      CONSTRAINT consultation_completion_check CHECK (
        (status = 'completed' AND completed_at IS NOT NULL) OR
        (status <> 'completed' AND completed_at IS NULL)
      )
    );

    CREATE INDEX IF NOT EXISTS idx_encounters_patient_id ON consultation_encounters(patient_id);
    CREATE INDEX IF NOT EXISTS idx_encounters_doctor_id ON consultation_encounters(doctor_id);
    CREATE INDEX IF NOT EXISTS idx_encounters_status ON consultation_encounters(status);
    CREATE INDEX IF NOT EXISTS idx_encounters_appointment_id ON consultation_encounters(appointment_id);

    -- 2. Vitals Records
    CREATE TABLE IF NOT EXISTS vitals_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      encounter_id UUID NOT NULL REFERENCES consultation_encounters(id) ON DELETE RESTRICT,
      systolic_bp INTEGER,
      diastolic_bp INTEGER,
      pulse_rate INTEGER,
      temperature_c NUMERIC(4,1),
      respiratory_rate INTEGER,
      oxygen_saturation NUMERIC(5,2),
      height_cm NUMERIC(6,2),
      weight_kg NUMERIC(6,2),
      examination_findings TEXT,
      recorded_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT vitals_bp_check CHECK ((systolic_bp IS NULL OR systolic_bp > 0) AND (diastolic_bp IS NULL OR diastolic_bp > 0)),
      CONSTRAINT vitals_pulse_check CHECK (pulse_rate IS NULL OR pulse_rate > 0),
      CONSTRAINT vitals_temperature_check CHECK (temperature_c IS NULL OR temperature_c > 0),
      CONSTRAINT vitals_respiration_check CHECK (respiratory_rate IS NULL OR respiratory_rate > 0),
      CONSTRAINT vitals_oxygen_check CHECK (oxygen_saturation IS NULL OR (oxygen_saturation >= 0 AND oxygen_saturation <= 100)),
      CONSTRAINT vitals_height_check CHECK (height_cm IS NULL OR height_cm > 0),
      CONSTRAINT vitals_weight_check CHECK (weight_kg IS NULL OR weight_kg > 0)
    );

    CREATE INDEX IF NOT EXISTS idx_vitals_encounter_recorded ON vitals_records(encounter_id, recorded_at);

    -- 3. Clinical Histories
    CREATE TABLE IF NOT EXISTS clinical_histories (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      encounter_id UUID NOT NULL UNIQUE REFERENCES consultation_encounters(id) ON DELETE RESTRICT,
      chief_complaints TEXT NOT NULL,
      history_of_present_illness TEXT,
      past_medical_history TEXT,
      medication_history TEXT,
      allergy_history TEXT,
      family_history TEXT,
      social_history TEXT,
      review_of_systems TEXT,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_clinical_history_encounter ON clinical_histories(encounter_id);

    -- 4. Computerized Provider Order Entry (CPOE)
    CREATE TABLE IF NOT EXISTS provider_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      encounter_id UUID NOT NULL REFERENCES consultation_encounters(id) ON DELETE RESTRICT,
      order_type VARCHAR(20) NOT NULL,
      order_name VARCHAR(200) NOT NULL,
      instructions TEXT,
      priority VARCHAR(20) NOT NULL DEFAULT 'routine',
      status VARCHAR(20) NOT NULL DEFAULT 'draft',
      order_details JSONB,
      ordered_by UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT provider_order_type_check CHECK (order_type IN ('medication', 'laboratory', 'imaging', 'procedure')),
      CONSTRAINT provider_order_priority_check CHECK (priority IN ('routine', 'urgent', 'stat')),
      CONSTRAINT provider_order_status_check CHECK (status IN ('draft', 'placed', 'in_progress', 'completed', 'cancelled'))
    );

    CREATE INDEX IF NOT EXISTS idx_provider_orders_encounter ON provider_orders(encounter_id, created_at);
    CREATE INDEX IF NOT EXISTS idx_provider_orders_status ON provider_orders(status);

    -- 5. Clinical Progress Notes (SOAP)
    CREATE TABLE IF NOT EXISTS clinical_progress_notes (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      encounter_id UUID NOT NULL REFERENCES consultation_encounters(id) ON DELETE RESTRICT,
      note_type VARCHAR(20) NOT NULL DEFAULT 'progress',
      subjective TEXT,
      objective TEXT,
      assessment TEXT NOT NULL,
      plan TEXT NOT NULL,
      follow_up_instructions TEXT,
      author_doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CONSTRAINT progress_note_type_check CHECK (note_type IN ('initial', 'progress', 'follow_up'))
    );

    CREATE INDEX IF NOT EXISTS idx_progress_notes_encounter ON clinical_progress_notes(encounter_id, created_at);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS clinical_progress_notes CASCADE;
    DROP TABLE IF EXISTS provider_orders CASCADE;
    DROP TABLE IF EXISTS clinical_histories CASCADE;
    DROP TABLE IF EXISTS vitals_records CASCADE;
    DROP TABLE IF EXISTS consultation_encounters CASCADE;
  `);
};
