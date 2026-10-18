/**
 * Migration: 1793000000000_modules-8-to-15-schema.js
 * Comprehensive Schema for Modules 8.1 through 15.5
 */

exports.up = (pgm) => {
  // ==========================================
  // MODULE 8: Day Care / Ambulatory Surgery
  // ==========================================
  pgm.sql(`
    CREATE TABLE IF NOT EXISTS daycare_chairs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(100) NOT NULL,
      type VARCHAR(20) NOT NULL DEFAULT 'bed',
      zone VARCHAR(50) NOT NULL DEFAULT 'Main Bay',
      status VARCHAR(30) NOT NULL DEFAULT 'available',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS daycare_admissions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      admission_number VARCHAR(50) UNIQUE NOT NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      chair_id UUID REFERENCES daycare_chairs(id) ON DELETE SET NULL,
      procedure_name VARCHAR(255) NOT NULL,
      procedure_date DATE NOT NULL DEFAULT CURRENT_DATE,
      planned_duration_minutes INT DEFAULT 120,
      pre_op_instructions TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'booked',
      admitted_at TIMESTAMPTZ,
      discharged_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS daycare_procedure_monitors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      daycare_admission_id UUID NOT NULL REFERENCES daycare_admissions(id) ON DELETE CASCADE,
      monitored_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      pulse_rate INT,
      systolic_bp INT,
      diastolic_bp INT,
      oxygen_saturation NUMERIC(5,2),
      respiratory_rate INT,
      anesthesia_type VARCHAR(50),
      sedation_score VARCHAR(50),
      adverse_events TEXT,
      surgical_checklist_signed BOOLEAN DEFAULT false,
      notes TEXT,
      recorded_by UUID REFERENCES doctors(id) ON DELETE SET NULL
    );

    CREATE TABLE IF NOT EXISTS daycare_discharge_summaries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      daycare_admission_id UUID UNIQUE NOT NULL REFERENCES daycare_admissions(id) ON DELETE CASCADE,
      aldrete_score INT,
      padss_score INT,
      vitals_stable BOOLEAN DEFAULT true,
      post_op_instructions TEXT,
      medications_prescribed JSONB DEFAULT '[]'::jsonb,
      follow_up_date DATE,
      emergency_contact_advice TEXT,
      authorized_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
      discharged_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ==========================================
    -- MODULE 9: Dietary & Kitchen Management
    -- ==========================================
    CREATE TABLE IF NOT EXISTS dietary_assessments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      bmi NUMERIC(5,2),
      height_cm NUMERIC(5,2),
      weight_kg NUMERIC(5,2),
      dietary_restrictions TEXT,
      food_allergies TEXT,
      calorie_target_kcal INT,
      diet_type VARCHAR(50) NOT NULL DEFAULT 'regular',
      clinical_notes TEXT,
      assessed_by VARCHAR(100),
      assessment_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dietary_meal_orders (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_number VARCHAR(50) UNIQUE NOT NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      ward_bed VARCHAR(100),
      meal_type VARCHAR(50) NOT NULL,
      meal_date DATE NOT NULL DEFAULT CURRENT_DATE,
      diet_category VARCHAR(50) NOT NULL DEFAULT 'regular',
      special_instructions TEXT,
      status VARCHAR(30) NOT NULL DEFAULT 'ordered',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dietary_batch_productions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      batch_number VARCHAR(50) UNIQUE NOT NULL,
      production_date DATE NOT NULL DEFAULT CURRENT_DATE,
      meal_type VARCHAR(50) NOT NULL,
      total_portions INT NOT NULL DEFAULT 1,
      diet_categories JSONB DEFAULT '[]'::jsonb,
      kitchen_shift VARCHAR(50) DEFAULT 'morning',
      status VARCHAR(30) NOT NULL DEFAULT 'planned',
      quality_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS dietary_meal_deliveries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      order_id UUID NOT NULL REFERENCES dietary_meal_orders(id) ON DELETE CASCADE,
      batch_id UUID REFERENCES dietary_batch_productions(id) ON DELETE SET NULL,
      dispatched_at TIMESTAMPTZ,
      delivered_at TIMESTAMPTZ,
      delivered_by VARCHAR(100),
      received_by VARCHAR(100),
      meal_temperature_c NUMERIC(4,1),
      delivery_status VARCHAR(30) NOT NULL DEFAULT 'dispatched',
      remarks TEXT
    );

    -- ==========================================
    -- MODULE 10: IVF / ART (Assisted Reproductive Technology)
    -- ==========================================
    CREATE TABLE IF NOT EXISTS ivf_cycles (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cycle_number VARCHAR(50) UNIQUE NOT NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      partner_name VARCHAR(100),
      cycle_type VARCHAR(50) NOT NULL DEFAULT 'self',
      start_date DATE NOT NULL DEFAULT CURRENT_DATE,
      status VARCHAR(30) NOT NULL DEFAULT 'in_progress',
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ivf_oocyte_retrievals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cycle_id UUID NOT NULL REFERENCES ivf_cycles(id) ON DELETE CASCADE,
      retrieval_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      follicles_aspirated INT DEFAULT 0,
      oocytes_retrieved INT DEFAULT 0,
      mii_count INT DEFAULT 0,
      mi_count INT DEFAULT 0,
      gv_count INT DEFAULT 0,
      degenerated_count INT DEFAULT 0,
      physician_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      embryologist_name VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ivf_fertilization_records (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cycle_id UUID NOT NULL REFERENCES ivf_cycles(id) ON DELETE CASCADE,
      fertilization_method VARCHAR(50) NOT NULL,
      sperm_sample_id VARCHAR(50),
      insemination_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      oocytes_inseminated INT NOT NULL DEFAULT 0,
      normal_2pn_count INT DEFAULT 0,
      abnormal_1pn_count INT DEFAULT 0,
      abnormal_multipn_count INT DEFAULT 0,
      unfertilized_count INT DEFAULT 0,
      embryologist_name VARCHAR(100),
      remarks TEXT
    );

    CREATE TABLE IF NOT EXISTS ivf_embryos (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cycle_id UUID NOT NULL REFERENCES ivf_cycles(id) ON DELETE CASCADE,
      embryo_code VARCHAR(50) NOT NULL,
      day_number INT NOT NULL DEFAULT 3,
      cell_count INT,
      fragmentation_percent NUMERIC(5,2),
      gardner_grade VARCHAR(20),
      status VARCHAR(30) NOT NULL DEFAULT 'viable',
      biopsy_taken BOOLEAN DEFAULT false,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS ivf_embryo_transfers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      cycle_id UUID NOT NULL REFERENCES ivf_cycles(id) ON DELETE CASCADE,
      transfer_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      transfer_type VARCHAR(20) NOT NULL DEFAULT 'fresh',
      embryos_transferred_count INT NOT NULL DEFAULT 1,
      catheter_type VARCHAR(100),
      ultrasound_guided BOOLEAN DEFAULT true,
      endometrium_thickness_mm NUMERIC(4,2),
      physician_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      embryologist_name VARCHAR(100),
      luteal_phase_regimen TEXT,
      pregnancy_test_date DATE,
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS ivf_cryostorages (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      embryo_id UUID NOT NULL REFERENCES ivf_embryos(id) ON DELETE CASCADE,
      tank_id VARCHAR(50) NOT NULL,
      canister_id VARCHAR(50) NOT NULL,
      goblet_color VARCHAR(50),
      cane_number VARCHAR(50),
      straw_number VARCHAR(50) NOT NULL,
      media_used VARCHAR(100),
      freeze_date DATE NOT NULL DEFAULT CURRENT_DATE,
      consent_expiry_date DATE,
      thaw_date DATE,
      disposition VARCHAR(30) NOT NULL DEFAULT 'stored',
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ==========================================
    -- MODULE 11: Emergency Department & Trauma
    -- ==========================================
    CREATE TABLE IF NOT EXISTS emergency_triage (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      triage_number VARCHAR(50) UNIQUE NOT NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      triage_level INT NOT NULL,
      chief_complaint TEXT NOT NULL,
      arrival_mode VARCHAR(50) NOT NULL DEFAULT 'walk_in',
      gcs_score INT,
      pulse_rate INT,
      systolic_bp INT,
      diastolic_bp INT,
      respiratory_rate INT,
      oxygen_saturation NUMERIC(5,2),
      temperature_c NUMERIC(4,1),
      pain_score INT,
      triaged_by VARCHAR(100),
      triaged_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS emergency_mlc_registry (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      mlc_number VARCHAR(50) UNIQUE NOT NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      police_station VARCHAR(100) NOT NULL,
      officer_name VARCHAR(100),
      officer_badge_no VARCHAR(50),
      case_type VARCHAR(50) NOT NULL,
      incident_date_time TIMESTAMPTZ,
      injury_details TEXT NOT NULL,
      alcohol_suspected BOOLEAN DEFAULT false,
      fit_for_statement BOOLEAN DEFAULT true,
      certificate_issued BOOLEAN DEFAULT false,
      registered_by VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS emergency_bays (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) UNIQUE NOT NULL,
      zone VARCHAR(30) NOT NULL,
      bay_number VARCHAR(50) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'available',
      is_active BOOLEAN NOT NULL DEFAULT true
    );

    CREATE TABLE IF NOT EXISTS emergency_bay_allocations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      triage_id UUID NOT NULL REFERENCES emergency_triage(id) ON DELETE CASCADE,
      bay_id UUID NOT NULL REFERENCES emergency_bays(id) ON DELETE RESTRICT,
      allocated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      vacated_at TIMESTAMPTZ,
      allocated_by VARCHAR(100)
    );

    CREATE TABLE IF NOT EXISTS emergency_trauma_charts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      triage_id UUID NOT NULL REFERENCES emergency_triage(id) ON DELETE CASCADE,
      airway_status VARCHAR(100) NOT NULL,
      breathing_status VARCHAR(100) NOT NULL,
      circulation_status VARCHAR(100) NOT NULL,
      disability_neuro VARCHAR(100) NOT NULL,
      exposure_findings TEXT,
      fast_scan_findings TEXT,
      revised_trauma_score NUMERIC(5,2),
      attending_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      notes TEXT
    );

    CREATE TABLE IF NOT EXISTS emergency_dispositions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      triage_id UUID NOT NULL REFERENCES emergency_triage(id) ON DELETE CASCADE,
      disposition_type VARCHAR(50) NOT NULL,
      target_unit VARCHAR(100),
      disposition_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      clinician_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      handover_summary TEXT NOT NULL,
      follow_up_instructions TEXT
    );

    -- ==========================================
    -- MODULE 12: EMR & Longitudinal Clinical Records
    -- ==========================================
    CREATE TABLE IF NOT EXISTS emr_eprescriptions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      rx_number VARCHAR(50) UNIQUE NOT NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      encounter_id UUID REFERENCES consultation_encounters(id) ON DELETE SET NULL,
      diagnosis_summary TEXT,
      notes TEXT,
      is_dispensed BOOLEAN DEFAULT false,
      prescribed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS emr_prescription_items (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      prescription_id UUID NOT NULL REFERENCES emr_eprescriptions(id) ON DELETE CASCADE,
      medication_name VARCHAR(200) NOT NULL,
      generic_name VARCHAR(200),
      dosage VARCHAR(50) NOT NULL,
      route VARCHAR(50) DEFAULT 'Oral',
      frequency VARCHAR(50) NOT NULL,
      duration_days INT NOT NULL DEFAULT 5,
      food_relation VARCHAR(50) DEFAULT 'After Food',
      instructions TEXT,
      quantity INT DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS emr_diagnoses (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      encounter_id UUID REFERENCES consultation_encounters(id) ON DELETE SET NULL,
      icd10_code VARCHAR(50) NOT NULL,
      icd10_description VARCHAR(255) NOT NULL,
      snomed_code VARCHAR(50),
      snomed_term VARCHAR(255),
      diagnosis_type VARCHAR(30) DEFAULT 'provisional',
      onset_date DATE DEFAULT CURRENT_DATE,
      status VARCHAR(30) DEFAULT 'active',
      recorded_by UUID REFERENCES doctors(id) ON DELETE SET NULL,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS emr_document_attachments (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      document_title VARCHAR(200) NOT NULL,
      document_category VARCHAR(50) NOT NULL,
      file_name VARCHAR(255) NOT NULL,
      file_url TEXT NOT NULL,
      file_size_bytes INT,
      mime_type VARCHAR(100),
      uploaded_by VARCHAR(100),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ==========================================
    -- MODULE 13: Hospital Financials & Accounts
    -- ==========================================
    CREATE TABLE IF NOT EXISTS finance_chart_of_accounts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      account_code VARCHAR(50) UNIQUE NOT NULL,
      account_name VARCHAR(200) NOT NULL,
      account_type VARCHAR(30) NOT NULL,
      parent_id UUID REFERENCES finance_chart_of_accounts(id) ON DELETE SET NULL,
      currency VARCHAR(10) DEFAULT 'INR',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS finance_journal_entries (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      entry_number VARCHAR(50) UNIQUE NOT NULL,
      entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
      reference_number VARCHAR(100),
      narration TEXT,
      total_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      status VARCHAR(20) NOT NULL DEFAULT 'posted',
      created_by VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS finance_journal_lines (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      journal_entry_id UUID NOT NULL REFERENCES finance_journal_entries(id) ON DELETE CASCADE,
      account_id UUID NOT NULL REFERENCES finance_chart_of_accounts(id) ON DELETE RESTRICT,
      debit NUMERIC(14,2) NOT NULL DEFAULT 0,
      credit NUMERIC(14,2) NOT NULL DEFAULT 0,
      line_narration TEXT
    );

    CREATE TABLE IF NOT EXISTS finance_payment_vouchers (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      voucher_number VARCHAR(50) UNIQUE NOT NULL,
      voucher_type VARCHAR(30) NOT NULL,
      voucher_date DATE NOT NULL DEFAULT CURRENT_DATE,
      payee_name VARCHAR(200) NOT NULL,
      payment_mode VARCHAR(50) NOT NULL DEFAULT 'bank',
      amount NUMERIC(14,2) NOT NULL,
      account_id UUID REFERENCES finance_chart_of_accounts(id) ON DELETE SET NULL,
      reference_document VARCHAR(100),
      status VARCHAR(20) NOT NULL DEFAULT 'approved',
      approved_by VARCHAR(100),
      remarks TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS finance_doctor_payouts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      payout_batch_number VARCHAR(50) UNIQUE NOT NULL,
      doctor_id UUID NOT NULL REFERENCES doctors(id) ON DELETE RESTRICT,
      period_start DATE NOT NULL,
      period_end DATE NOT NULL,
      opd_consultation_revenue NUMERIC(12,2) DEFAULT 0,
      opd_share_percent NUMERIC(5,2) DEFAULT 70,
      ipd_surgery_revenue NUMERIC(12,2) DEFAULT 0,
      ipd_share_percent NUMERIC(5,2) DEFAULT 60,
      diagnostic_revenue NUMERIC(12,2) DEFAULT 0,
      diagnostic_share_percent NUMERIC(5,2) DEFAULT 10,
      gross_payable NUMERIC(12,2) NOT NULL,
      tds_deduction NUMERIC(12,2) DEFAULT 0,
      other_deductions NUMERIC(12,2) DEFAULT 0,
      net_payout NUMERIC(12,2) NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'calculated',
      paid_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS finance_bank_reconciliations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      reconciliation_number VARCHAR(50) UNIQUE NOT NULL,
      bank_account_id UUID NOT NULL REFERENCES finance_chart_of_accounts(id) ON DELETE RESTRICT,
      statement_date DATE NOT NULL,
      statement_balance NUMERIC(14,2) NOT NULL,
      ledger_balance NUMERIC(14,2) NOT NULL,
      difference_amount NUMERIC(14,2) NOT NULL DEFAULT 0,
      matched_items_count INT DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'unreconciled',
      reconciled_by VARCHAR(100),
      reconciled_at TIMESTAMPTZ,
      remarks TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ==========================================
    -- MODULE 14: Biomedical & Hospital Asset Management
    -- ==========================================
    CREATE TABLE IF NOT EXISTS asset_masters (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_tag VARCHAR(50) UNIQUE NOT NULL,
      serial_number VARCHAR(100) NOT NULL,
      asset_name VARCHAR(200) NOT NULL,
      category VARCHAR(100) NOT NULL,
      department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
      location_room VARCHAR(100),
      manufacturer VARCHAR(150),
      model_number VARCHAR(100),
      purchase_date DATE NOT NULL,
      purchase_cost NUMERIC(12,2) NOT NULL,
      warranty_expiry_date DATE,
      status VARCHAR(30) NOT NULL DEFAULT 'in_service',
      barcode_data VARCHAR(100),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS asset_service_contracts (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES asset_masters(id) ON DELETE CASCADE,
      contract_type VARCHAR(50) NOT NULL,
      vendor_name VARCHAR(200) NOT NULL,
      vendor_contact VARCHAR(100),
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      contract_value NUMERIC(12,2) NOT NULL,
      coverage_details TEXT,
      renewal_alert_days INT DEFAULT 30,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS asset_preventive_maintenances (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES asset_masters(id) ON DELETE CASCADE,
      task_title VARCHAR(200) NOT NULL,
      frequency VARCHAR(30) NOT NULL DEFAULT 'quarterly',
      next_due_date DATE NOT NULL,
      last_completed_date DATE,
      checklist_criteria JSONB DEFAULT '[]'::jsonb,
      assigned_engineer VARCHAR(100),
      status VARCHAR(30) NOT NULL DEFAULT 'scheduled',
      completion_notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS asset_breakdown_tickets (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      ticket_number VARCHAR(50) UNIQUE NOT NULL,
      asset_id UUID NOT NULL REFERENCES asset_masters(id) ON DELETE CASCADE,
      reported_by VARCHAR(100) NOT NULL,
      priority VARCHAR(20) NOT NULL DEFAULT 'medium',
      issue_description TEXT NOT NULL,
      reported_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      downtime_start TIMESTAMPTZ,
      downtime_end TIMESTAMPTZ,
      root_cause TEXT,
      action_taken TEXT,
      repair_cost NUMERIC(12,2) DEFAULT 0,
      status VARCHAR(30) NOT NULL DEFAULT 'open',
      closed_at TIMESTAMPTZ
    );

    CREATE TABLE IF NOT EXISTS asset_depreciations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      asset_id UUID NOT NULL REFERENCES asset_masters(id) ON DELETE CASCADE,
      method VARCHAR(30) NOT NULL DEFAULT 'SLM',
      useful_life_years INT NOT NULL DEFAULT 7,
      salvage_value NUMERIC(12,2) DEFAULT 0,
      annual_depreciation_rate NUMERIC(5,2),
      current_book_value NUMERIC(12,2) NOT NULL,
      accumulated_depreciation NUMERIC(12,2) NOT NULL DEFAULT 0,
      calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- ==========================================
    -- MODULE 15: Hospital Enterprise Master Data
    -- ==========================================
    CREATE TABLE IF NOT EXISTS enterprise_hospitals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      code VARCHAR(50) UNIQUE NOT NULL,
      name VARCHAR(200) NOT NULL,
      registration_number VARCHAR(100),
      gstin VARCHAR(50),
      pan_number VARCHAR(50),
      phone VARCHAR(50),
      email VARCHAR(100),
      address TEXT,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enterprise_branches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      hospital_id UUID NOT NULL REFERENCES enterprise_hospitals(id) ON DELETE CASCADE,
      branch_code VARCHAR(50) UNIQUE NOT NULL,
      branch_name VARCHAR(200) NOT NULL,
      city VARCHAR(100),
      state VARCHAR(100),
      address TEXT,
      contact_number VARCHAR(50),
      is_headquarters BOOLEAN NOT NULL DEFAULT false,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enterprise_clinics (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      branch_id UUID REFERENCES enterprise_branches(id) ON DELETE SET NULL,
      department_id UUID NOT NULL REFERENCES departments(id) ON DELETE RESTRICT,
      clinic_name VARCHAR(150) NOT NULL,
      floor_wing VARCHAR(100),
      head_doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      clinic_type VARCHAR(50) NOT NULL DEFAULT 'OPD',
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enterprise_services (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      service_code VARCHAR(50) UNIQUE NOT NULL,
      service_name VARCHAR(255) NOT NULL,
      category VARCHAR(100) NOT NULL,
      standard_rate NUMERIC(12,2) NOT NULL,
      tax_percent NUMERIC(5,2) DEFAULT 0,
      is_package BOOLEAN NOT NULL DEFAULT false,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE TABLE IF NOT EXISTS enterprise_corporate_tariffs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      corporate_name VARCHAR(200) NOT NULL,
      policy_code VARCHAR(100),
      service_id UUID NOT NULL REFERENCES enterprise_services(id) ON DELETE CASCADE,
      agreed_rate NUMERIC(12,2) NOT NULL,
      discount_percent NUMERIC(5,2) DEFAULT 0,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      is_active BOOLEAN NOT NULL DEFAULT true,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    -- Common Indexes for Performance
    CREATE INDEX IF NOT EXISTS idx_daycare_admissions_patient ON daycare_admissions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_daycare_admissions_status ON daycare_admissions(status);
    CREATE INDEX IF NOT EXISTS idx_dietary_orders_patient ON dietary_meal_orders(patient_id);
    CREATE INDEX IF NOT EXISTS idx_ivf_cycles_patient ON ivf_cycles(patient_id);
    CREATE INDEX IF NOT EXISTS idx_emergency_triage_patient ON emergency_triage(patient_id);
    CREATE INDEX IF NOT EXISTS idx_emergency_mlc_patient ON emergency_mlc_registry(patient_id);
    CREATE INDEX IF NOT EXISTS idx_emr_eprescriptions_patient ON emr_eprescriptions(patient_id);
    CREATE INDEX IF NOT EXISTS idx_emr_diagnoses_patient ON emr_diagnoses(patient_id);
    CREATE INDEX IF NOT EXISTS idx_asset_masters_tag ON asset_masters(asset_tag);
  `);
};

exports.down = (pgm) => {
  pgm.sql(`
    DROP TABLE IF EXISTS enterprise_corporate_tariffs CASCADE;
    DROP TABLE IF EXISTS enterprise_services CASCADE;
    DROP TABLE IF EXISTS enterprise_clinics CASCADE;
    DROP TABLE IF EXISTS enterprise_branches CASCADE;
    DROP TABLE IF EXISTS enterprise_hospitals CASCADE;
    DROP TABLE IF EXISTS asset_depreciations CASCADE;
    DROP TABLE IF EXISTS asset_breakdown_tickets CASCADE;
    DROP TABLE IF EXISTS asset_preventive_maintenances CASCADE;
    DROP TABLE IF EXISTS asset_service_contracts CASCADE;
    DROP TABLE IF EXISTS asset_masters CASCADE;
    DROP TABLE IF EXISTS finance_bank_reconciliations CASCADE;
    DROP TABLE IF EXISTS finance_doctor_payouts CASCADE;
    DROP TABLE IF EXISTS finance_payment_vouchers CASCADE;
    DROP TABLE IF EXISTS finance_journal_lines CASCADE;
    DROP TABLE IF EXISTS finance_journal_entries CASCADE;
    DROP TABLE IF EXISTS finance_chart_of_accounts CASCADE;
    DROP TABLE IF EXISTS emr_document_attachments CASCADE;
    DROP TABLE IF EXISTS emr_diagnoses CASCADE;
    DROP TABLE IF EXISTS emr_prescription_items CASCADE;
    DROP TABLE IF EXISTS emr_eprescriptions CASCADE;
    DROP TABLE IF EXISTS emergency_dispositions CASCADE;
    DROP TABLE IF EXISTS emergency_trauma_charts CASCADE;
    DROP TABLE IF EXISTS emergency_bay_allocations CASCADE;
    DROP TABLE IF EXISTS emergency_bays CASCADE;
    DROP TABLE IF EXISTS emergency_mlc_registry CASCADE;
    DROP TABLE IF EXISTS emergency_triage CASCADE;
    DROP TABLE IF EXISTS ivf_cryostorages CASCADE;
    DROP TABLE IF EXISTS ivf_embryo_transfers CASCADE;
    DROP TABLE IF EXISTS ivf_embryos CASCADE;
    DROP TABLE IF EXISTS ivf_fertilization_records CASCADE;
    DROP TABLE IF EXISTS ivf_oocyte_retrievals CASCADE;
    DROP TABLE IF EXISTS ivf_cycles CASCADE;
    DROP TABLE IF EXISTS dietary_meal_deliveries CASCADE;
    DROP TABLE IF EXISTS dietary_batch_productions CASCADE;
    DROP TABLE IF EXISTS dietary_meal_orders CASCADE;
    DROP TABLE IF EXISTS dietary_assessments CASCADE;
    DROP TABLE IF EXISTS daycare_discharge_summaries CASCADE;
    DROP TABLE IF EXISTS daycare_procedure_monitors CASCADE;
    DROP TABLE IF EXISTS daycare_admissions CASCADE;
    DROP TABLE IF EXISTS daycare_chairs CASCADE;
  `);
};
