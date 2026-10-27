/**
 * Migration: 1793000000003_radiology-pacs-schema.js
 *
 * Comprehensive Schema for Radiology & PACS Module:
 * - radiology_modalities (X-Ray, CT, MRI, Ultrasound, Mammography equipment)
 * - radiology_studies (scheduled/performed imaging studies linked to patients & doctors)
 * - radiology_reports (radiologist structured report authoring, verification, and distribution)
 * - pacs_nodes (DICOM archive nodes and honest connection telemetry)
 */

exports.shorthands = undefined;

exports.up = (pgm) => {
  pgm.sql(`
    -- 1. Radiology Modalities Master
    CREATE TABLE IF NOT EXISTS radiology_modalities (
      id VARCHAR(20) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      modality_type VARCHAR(20) NOT NULL,
      room_name VARCHAR(100) NOT NULL,
      ae_title VARCHAR(50) NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'available'
        CHECK (status IN ('available', 'busy', 'maintenance', 'offline')),
      daily_slot_capacity INT NOT NULL DEFAULT 24,
      slot_duration_minutes INT NOT NULL DEFAULT 30,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    INSERT INTO radiology_modalities (id, name, modality_type, room_name, ae_title, daily_slot_capacity, slot_duration_minutes)
    VALUES
      ('XR', 'Digital Radiography (X-Ray)', 'XR', 'Radio Suite 1 (Floor 1)', 'XR_RAD_01', 30, 20),
      ('CT', 'Computed Tomography (CT 128-Slice)', 'CT', 'CT Gantry Suite A (Ground Floor)', 'CT_SOMATOM_01', 20, 30),
      ('MRI', 'Magnetic Resonance Imaging (MRI 3.0 Tesla)', 'MRI', 'Supercon Suite B (Basement 1)', 'MRI_MAGNETOM_01', 14, 45),
      ('USG', 'Ultrasound & Color Doppler (USG)', 'US', 'USG Room 2 (Floor 1)', 'US_VOLUSON_01', 24, 25),
      ('MAMMO', 'Digital Full-Field Mammography', 'MG', 'Women Health Imaging Bay (Floor 2)', 'MAMMO_LOREX_01', 16, 30)
    ON CONFLICT (id) DO NOTHING;

    -- 2. Radiology Studies Table
    CREATE TABLE IF NOT EXISTS radiology_studies (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      accession_number VARCHAR(50) UNIQUE NOT NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      encounter_id UUID REFERENCES consultation_encounters(id) ON DELETE SET NULL,
      order_id UUID REFERENCES provider_orders(id) ON DELETE SET NULL,
      modality_id VARCHAR(20) NOT NULL REFERENCES radiology_modalities(id),
      study_description VARCHAR(255) NOT NULL,
      body_part VARCHAR(100) NOT NULL DEFAULT 'General',
      clinical_indication TEXT,
      ordering_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      scheduled_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      performed_at TIMESTAMPTZ,
      priority VARCHAR(20) NOT NULL DEFAULT 'routine'
        CHECK (priority IN ('routine', 'urgent', 'stat')),
      status VARCHAR(30) NOT NULL DEFAULT 'scheduled'
        CHECK (status IN ('scheduled', 'arrived', 'in_progress', 'completed', 'cancelled')),
      technologist_name VARCHAR(150),
      pacs_study_uid VARCHAR(120),
      series_count INT NOT NULL DEFAULT 1,
      instances_count INT NOT NULL DEFAULT 0,
      is_demo BOOLEAN NOT NULL DEFAULT FALSE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_radiology_studies_patient ON radiology_studies(patient_id);
    CREATE INDEX IF NOT EXISTS idx_radiology_studies_modality ON radiology_studies(modality_id);
    CREATE INDEX IF NOT EXISTS idx_radiology_studies_status ON radiology_studies(status);
    CREATE INDEX IF NOT EXISTS idx_radiology_studies_scheduled ON radiology_studies(scheduled_at);
    CREATE INDEX IF NOT EXISTS idx_radiology_studies_accession ON radiology_studies(accession_number);

    -- 3. Radiology Structured Reports Table
    CREATE TABLE IF NOT EXISTS radiology_reports (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      study_id UUID UNIQUE NOT NULL REFERENCES radiology_studies(id) ON DELETE CASCADE,
      radiologist_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      technique TEXT,
      findings TEXT NOT NULL DEFAULT '',
      impression TEXT NOT NULL DEFAULT '',
      recommendations TEXT,
      status VARCHAR(20) NOT NULL DEFAULT 'draft'
        CHECK (status IN ('draft', 'preliminary', 'verified', 'distributed')),
      verified_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
      verified_at TIMESTAMPTZ,
      distributed_at TIMESTAMPTZ,
      critical_alert BOOLEAN NOT NULL DEFAULT FALSE,
      critical_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX IF NOT EXISTS idx_radiology_reports_study ON radiology_reports(study_id);
    CREATE INDEX IF NOT EXISTS idx_radiology_reports_status ON radiology_reports(status);

    -- 4. PACS DICOM Nodes Configuration Table (honest connection state tracking)
    CREATE TABLE IF NOT EXISTS pacs_nodes (
      id VARCHAR(50) PRIMARY KEY,
      name VARCHAR(100) NOT NULL,
      ae_title VARCHAR(50) NOT NULL,
      host VARCHAR(150) NOT NULL,
      port INT NOT NULL DEFAULT 104,
      pacs_type VARCHAR(50) NOT NULL DEFAULT 'dcm4chee',
      status VARCHAR(20) NOT NULL DEFAULT 'disconnected'
        CHECK (status IN ('connected', 'disconnected', 'degraded', 'standby')),
      last_ping_at TIMESTAMPTZ,
      description TEXT,
      is_active BOOLEAN NOT NULL DEFAULT TRUE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    INSERT INTO pacs_nodes (id, name, ae_title, host, port, pacs_type, status, description)
    VALUES
      ('primary-pacs', 'Hospital Core DICOM Archive', 'ORTHANC_PACS_SCP', '127.0.0.1', 104, 'orthanc', 'disconnected', 'Central Hospital Orthanc / dcm4chee PACS archive node. Currently offline / not connected.')
    ON CONFLICT (id) DO NOTHING;
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS pacs_nodes CASCADE;
    DROP TABLE IF EXISTS radiology_reports CASCADE;
    DROP TABLE IF EXISTS radiology_studies CASCADE;
    DROP TABLE IF EXISTS radiology_modalities CASCADE;
  `);
};
