/**
 * Migration: 1791820000000_appointment-blood-requests.js
 *
 * Implements appointment_blood_requests table bridging outpatient consultation
 * and pre-op appointments directly with the Blood Bank requisition system.
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS appointment_blood_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      appointment_id UUID REFERENCES appointments(id) ON DELETE SET NULL,
      requested_by_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      blood_requisition_id UUID REFERENCES blood_requisitions(id) ON DELETE SET NULL,
      blood_group VARCHAR(5) NOT NULL CHECK (
        blood_group IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')
      ),
      component_type VARCHAR(30) NOT NULL DEFAULT 'whole_blood' CHECK (
        component_type IN (
          'whole_blood', 'red_cells', 'platelets', 'plasma', 'cryoprecipitate',
          'prbc', 'ffp', 'cryo_poor_plasma'
        )
      ),
      units_requested INTEGER NOT NULL DEFAULT 1 CHECK (units_requested > 0),
      urgency VARCHAR(20) NOT NULL DEFAULT 'routine' CHECK (
        urgency IN ('routine', 'urgent', 'emergency', 'stat_emergency')
      ),
      clinical_indication TEXT NOT NULL,
      required_by TIMESTAMPTZ,
      status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (
        status IN ('pending', 'under_review', 'approved', 'rejected', 'cancelled', 'fulfilled')
      ),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_apt_blood_req_patient ON appointment_blood_requests(patient_id);
    CREATE INDEX IF NOT EXISTS idx_apt_blood_req_appointment ON appointment_blood_requests(appointment_id);
    CREATE INDEX IF NOT EXISTS idx_apt_blood_req_doctor ON appointment_blood_requests(requested_by_doctor_id);
    CREATE INDEX IF NOT EXISTS idx_apt_blood_req_requisition ON appointment_blood_requests(blood_requisition_id);
    CREATE INDEX IF NOT EXISTS idx_apt_blood_req_status_created ON appointment_blood_requests(status, created_at);
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS appointment_blood_requests CASCADE;
  `);
};
