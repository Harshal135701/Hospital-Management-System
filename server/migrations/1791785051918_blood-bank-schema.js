/**
 * Complete Blood Bank Database Schema Migration for MedicsPrime HMS.
 * Implements database support for all five Blood Bank submodules:
 * 5.1 Donor Registration & Screening
 * 5.2 Bag Collection & Phlebotomy Barcoding
 * 5.3 Component Separation & Temperature Monitoring
 * 5.4 Serology Testing, Safe Release & Biological Disposal
 * 5.5 Cross Matching, Requisitions, Reservations, Issue Handover & Auditable Movements
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    -- =========================================================================
    -- SUBMODULE 5.1: DONOR REGISTRATION & SCREENING
    -- =========================================================================

    CREATE TABLE blood_donors (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donor_code VARCHAR(30) NOT NULL UNIQUE,
      full_name VARCHAR(150) NOT NULL,
      date_of_birth DATE NOT NULL,
      gender VARCHAR(20) NOT NULL CHECK (gender IN ('male', 'female', 'other')),
      blood_group VARCHAR(10) CHECK (blood_group IN ('A', 'B', 'AB', 'O')),
      rh_factor VARCHAR(10) CHECK (rh_factor IN ('positive', 'negative')),
      mobile VARCHAR(20) NOT NULL,
      email VARCHAR(150),
      national_id VARCHAR(50),
      address TEXT,
      emergency_contact_name VARCHAR(150),
      emergency_contact_phone VARCHAR(20),
      donor_status VARCHAR(30) NOT NULL DEFAULT 'active'
        CHECK (donor_status IN ('active', 'temporarily_deferred', 'permanently_deferred', 'inactive')),
      permanent_deferral_reason TEXT,
      permanent_deferral_date DATE,
      total_donations INTEGER NOT NULL DEFAULT 0 CHECK (total_donations >= 0),
      last_donation_date DATE,
      tenant_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_blood_donors_mobile ON blood_donors (mobile);
    CREATE INDEX idx_blood_donors_group ON blood_donors (blood_group, rh_factor);
    CREATE INDEX idx_blood_donors_status ON blood_donors (donor_status);

    CREATE TABLE blood_donor_screenings (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donor_id UUID NOT NULL REFERENCES blood_donors(id) ON DELETE RESTRICT,
      screening_number VARCHAR(30) NOT NULL UNIQUE,
      screening_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      weight_kg NUMERIC(5,2) NOT NULL CHECK (weight_kg > 0),
      height_cm NUMERIC(5,2) CHECK (height_cm > 0),
      hemoglobin_g_dl NUMERIC(4,1) NOT NULL CHECK (hemoglobin_g_dl > 0),
      blood_pressure_systolic INTEGER NOT NULL CHECK (blood_pressure_systolic BETWEEN 60 AND 250),
      blood_pressure_diastolic INTEGER NOT NULL CHECK (blood_pressure_diastolic BETWEEN 40 AND 160),
      pulse_bpm INTEGER NOT NULL CHECK (pulse_bpm BETWEEN 40 AND 200),
      temperature_c NUMERIC(4,1) CHECK (temperature_c BETWEEN 35.0 AND 42.0),
      consent_obtained BOOLEAN NOT NULL DEFAULT FALSE,
      questionnaire_answers JSONB NOT NULL DEFAULT '{}'::jsonb,
      medical_history_notes TEXT,
      eligibility_status VARCHAR(30) NOT NULL
        CHECK (eligibility_status IN ('approved', 'temporarily_deferred', 'permanently_deferred', 'rejected')),
      deferral_reason TEXT,
      deferred_until DATE,
      reviewed_by_name VARCHAR(150) NOT NULL,
      reviewed_by_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_screenings_donor_date ON blood_donor_screenings (donor_id, screening_date DESC);
    CREATE INDEX idx_screenings_status ON blood_donor_screenings (eligibility_status);

    -- =========================================================================
    -- SUBMODULE 5.2: BAG COLLECTION & PHLEBOTOMY BARCODING
    -- =========================================================================

    CREATE TABLE blood_donations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donation_number VARCHAR(30) NOT NULL UNIQUE,
      donor_id UUID NOT NULL REFERENCES blood_donors(id) ON DELETE RESTRICT,
      screening_id UUID NOT NULL REFERENCES blood_donor_screenings(id) ON DELETE RESTRICT,
      primary_bag_barcode VARCHAR(50) NOT NULL UNIQUE,
      collection_started_at TIMESTAMPTZ NOT NULL,
      collection_ended_at TIMESTAMPTZ,
      volume_ml INTEGER NOT NULL CHECK (volume_ml > 0),
      bag_type VARCHAR(20) NOT NULL
        CHECK (bag_type IN ('single', 'double', 'triple', 'quadruple')),
      collection_type VARCHAR(20) NOT NULL DEFAULT 'voluntary'
        CHECK (collection_type IN ('voluntary', 'replacement', 'autologous', 'directed')),
      collection_status VARCHAR(30) NOT NULL DEFAULT 'completed'
        CHECK (collection_status IN ('in_progress', 'completed', 'partial', 'failed', 'adverse_event')),
      adverse_event_details TEXT,
      phlebotomist_name VARCHAR(150) NOT NULL,
      phlebotomist_id UUID,
      donation_notes TEXT,
      tenant_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_donations_donor ON blood_donations (donor_id);
    CREATE INDEX idx_donations_screening ON blood_donations (screening_id);
    CREATE INDEX idx_donations_bag_barcode ON blood_donations (primary_bag_barcode);
    CREATE INDEX idx_donations_collection_date ON blood_donations (collection_started_at DESC);

    CREATE TABLE blood_samples (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donation_id UUID NOT NULL REFERENCES blood_donations(id) ON DELETE RESTRICT,
      sample_barcode VARCHAR(50) NOT NULL UNIQUE,
      tube_type VARCHAR(30) NOT NULL
        CHECK (tube_type IN ('edta', 'plain_clot', 'nat', 'citrate', 'other')),
      collected_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      status VARCHAR(20) NOT NULL DEFAULT 'collected'
        CHECK (status IN ('collected', 'received_in_lab', 'testing', 'completed', 'rejected')),
      rejection_reason TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_blood_samples_donation ON blood_samples (donation_id);
    CREATE INDEX idx_blood_samples_barcode ON blood_samples (sample_barcode);

    -- =========================================================================
    -- SUBMODULE 5.3: COMPONENT SEPARATION & INVENTORY
    -- =========================================================================

    CREATE TABLE blood_components (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      parent_donation_id UUID NOT NULL REFERENCES blood_donations(id) ON DELETE RESTRICT,
      component_barcode VARCHAR(50) NOT NULL UNIQUE,
      component_type VARCHAR(30) NOT NULL
        CHECK (component_type IN ('prbc', 'ffp', 'platelets', 'cryoprecipitate', 'whole_blood', 'cryo_poor_plasma')),
      abo_group VARCHAR(10) CHECK (abo_group IN ('A', 'B', 'AB', 'O')),
      rh_factor VARCHAR(10) CHECK (rh_factor IN ('positive', 'negative')),
      volume_ml INTEGER NOT NULL CHECK (volume_ml > 0),
      storage_location VARCHAR(100),
      storage_min_temp_c NUMERIC(4,1) NOT NULL,
      storage_max_temp_c NUMERIC(4,1) NOT NULL,
      requires_agitator BOOLEAN NOT NULL DEFAULT FALSE,
      prepared_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      status VARCHAR(30) NOT NULL DEFAULT 'quarantined'
        CHECK (status IN ('quarantined', 'testing_pending', 'safe_for_release', 'reserved', 'issued', 'reactive', 'rejected', 'expired', 'disposed')),
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (expires_at > prepared_at),
      CHECK (storage_max_temp_c >= storage_min_temp_c)
    );

    CREATE INDEX idx_components_donation ON blood_components (parent_donation_id);
    CREATE INDEX idx_components_barcode ON blood_components (component_barcode);
    CREATE INDEX idx_components_status ON blood_components (status);
    CREATE INDEX idx_components_type_group_status ON blood_components (component_type, abo_group, rh_factor, status);
    CREATE INDEX idx_components_expiry ON blood_components (expires_at);

    CREATE TABLE blood_component_processing (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donation_id UUID NOT NULL REFERENCES blood_donations(id) ON DELETE RESTRICT,
      transferred_to_lab_at TIMESTAMPTZ NOT NULL,
      received_in_lab_at TIMESTAMPTZ NOT NULL,
      transfer_delay_hours NUMERIC(5,2),
      is_within_six_hours BOOLEAN NOT NULL DEFAULT TRUE,
      centrifuge_id VARCHAR(50),
      centrifuge_rpm INTEGER CHECK (centrifuge_rpm > 0),
      centrifuge_time_minutes INTEGER CHECK (centrifuge_time_minutes > 0),
      centrifuge_temperature_c NUMERIC(4,1),
      separation_started_at TIMESTAMPTZ,
      separation_completed_at TIMESTAMPTZ,
      processed_by_name VARCHAR(150) NOT NULL,
      processed_by_id UUID,
      components_produced JSONB DEFAULT '[]'::jsonb,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (received_in_lab_at >= transferred_to_lab_at)
    );

    CREATE INDEX idx_processing_donation ON blood_component_processing (donation_id);

    CREATE TABLE blood_storage_temperature_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      storage_unit_code VARCHAR(50) NOT NULL,
      storage_unit_type VARCHAR(30) NOT NULL
        CHECK (storage_unit_type IN ('prbc_refrigerator', 'ffp_freezer', 'platelet_agitator', 'quarantine_refrigerator', 'ambient_room')),
      recorded_temperature_c NUMERIC(4,1) NOT NULL,
      target_min_temp_c NUMERIC(4,1) NOT NULL,
      target_max_temp_c NUMERIC(4,1) NOT NULL,
      agitator_operational BOOLEAN,
      recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      recorded_by_name VARCHAR(150) NOT NULL,
      alert_raised BOOLEAN NOT NULL DEFAULT FALSE,
      corrective_action TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_temp_logs_storage_time ON blood_storage_temperature_logs (storage_unit_code, recorded_at DESC);

    -- =========================================================================
    -- SUBMODULE 5.4: SEROLOGY TESTING & SAFE RELEASE
    -- =========================================================================

    CREATE TABLE blood_grouping_verifications (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donation_id UUID NOT NULL REFERENCES blood_donations(id) ON DELETE RESTRICT,
      sample_id UUID REFERENCES blood_samples(id) ON DELETE SET NULL,
      forward_anti_a VARCHAR(20) NOT NULL,
      forward_anti_b VARCHAR(20) NOT NULL,
      forward_anti_ab VARCHAR(20),
      forward_anti_d VARCHAR(20) NOT NULL,
      reverse_a_cells VARCHAR(20) NOT NULL,
      reverse_b_cells VARCHAR(20) NOT NULL,
      reverse_o_cells VARCHAR(20),
      determined_abo_group VARCHAR(10) NOT NULL CHECK (determined_abo_group IN ('A', 'B', 'AB', 'O')),
      determined_rh_factor VARCHAR(10) NOT NULL CHECK (determined_rh_factor IN ('positive', 'negative')),
      technician1_name VARCHAR(150) NOT NULL,
      technician1_id UUID,
      technician1_tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      technician2_name VARCHAR(150),
      technician2_id UUID,
      technician2_verified_at TIMESTAMPTZ,
      technicians_concur BOOLEAN NOT NULL DEFAULT FALSE,
      is_resolved BOOLEAN NOT NULL DEFAULT FALSE,
      resolution_notes TEXT,
      resolved_by_name VARCHAR(150),
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_grouping_donation ON blood_grouping_verifications (donation_id);

    CREATE TABLE blood_serology_tests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donation_id UUID NOT NULL REFERENCES blood_donations(id) ON DELETE RESTRICT,
      sample_id UUID REFERENCES blood_samples(id) ON DELETE SET NULL,
      test_name VARCHAR(50) NOT NULL
        CHECK (test_name IN ('hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria', 'other')),
      test_method VARCHAR(50) NOT NULL
        CHECK (test_method IN ('elisa', 'nat', 'rapid_card', 'chemiluminescence', 'microscopy', 'other')),
      result VARCHAR(20) NOT NULL
        CHECK (result IN ('non_reactive', 'reactive', 'indeterminate', 'invalid')),
      cutoff_value NUMERIC(10,4),
      observed_value NUMERIC(10,4),
      unit VARCHAR(30),
      tested_by_name VARCHAR(150) NOT NULL,
      tested_by_id UUID,
      tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verified_by_name VARCHAR(150),
      verified_by_id UUID,
      verified_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_serology_donation ON blood_serology_tests (donation_id);
    CREATE INDEX idx_serology_test_result ON blood_serology_tests (test_name, result);

    CREATE TABLE blood_release_authorizations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      donation_id UUID NOT NULL REFERENCES blood_donations(id) ON DELETE RESTRICT,
      release_decision VARCHAR(30) NOT NULL
        CHECK (release_decision IN ('approved_for_release', 'rejected', 'quarantined_for_retest', 'escalated_supervisor')),
      all_tti_non_reactive BOOLEAN NOT NULL DEFAULT FALSE,
      dual_grouping_verified BOOLEAN NOT NULL DEFAULT FALSE,
      authorized_by_name VARCHAR(150) NOT NULL,
      authorized_by_id UUID,
      authorized_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      escalation_reason TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_release_donation ON blood_release_authorizations (donation_id);

    CREATE TABLE blood_component_disposals (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      component_id UUID NOT NULL REFERENCES blood_components(id) ON DELETE RESTRICT,
      reason VARCHAR(50) NOT NULL
        CHECK (reason IN ('reactive_tti', 'expired', 'damaged', 'hemolyzed', 'clotted', 'leakage', 'quality_failure', 'other')),
      disposal_method VARCHAR(50) NOT NULL
        CHECK (disposal_method IN ('incineration', 'autoclave_and_shred', 'biohazard_waste_contractor', 'chemical_disinfection')),
      authorized_by_name VARCHAR(150) NOT NULL,
      authorized_by_id UUID,
      disposed_by_name VARCHAR(150) NOT NULL,
      disposed_by_id UUID,
      disposed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      waste_manifest_number VARCHAR(100),
      certificate_url TEXT,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_disposals_component ON blood_component_disposals (component_id);

    -- =========================================================================
    -- SUBMODULE 5.5: CROSS MATCHING & PATIENT ISSUE
    -- =========================================================================

    CREATE TABLE blood_requisitions (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      requisition_number VARCHAR(50) NOT NULL UNIQUE,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
      room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
      doctor_id UUID REFERENCES doctors(id) ON DELETE SET NULL,
      requester_name VARCHAR(150) NOT NULL,
      urgency VARCHAR(20) NOT NULL DEFAULT 'routine'
        CHECK (urgency IN ('routine', 'urgent', 'stat_emergency')),
      requested_component VARCHAR(30) NOT NULL
        CHECK (requested_component IN ('prbc', 'ffp', 'platelets', 'cryoprecipitate', 'whole_blood', 'cryo_poor_plasma')),
      units_requested INTEGER NOT NULL CHECK (units_requested > 0),
      units_reserved INTEGER NOT NULL DEFAULT 0 CHECK (units_reserved >= 0),
      units_issued INTEGER NOT NULL DEFAULT 0 CHECK (units_issued >= 0),
      patient_blood_group VARCHAR(10) CHECK (patient_blood_group IN ('A', 'B', 'AB', 'O')),
      patient_rh_factor VARCHAR(10) CHECK (patient_rh_factor IN ('positive', 'negative')),
      clinical_indication TEXT NOT NULL,
      required_by TIMESTAMPTZ,
      status VARCHAR(30) NOT NULL DEFAULT 'pending'
        CHECK (status IN ('pending', 'sample_received', 'crossmatching', 'partially_fulfilled', 'fulfilled', 'cancelled')),
      tenant_id UUID,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (units_issued <= units_requested)
    );

    CREATE INDEX idx_requisitions_patient ON blood_requisitions (patient_id);
    CREATE INDEX idx_requisitions_department ON blood_requisitions (department_id);
    CREATE INDEX idx_requisitions_status ON blood_requisitions (status);
    CREATE INDEX idx_requisitions_urgency ON blood_requisitions (urgency);

    CREATE TABLE blood_crossmatches (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      requisition_id UUID NOT NULL REFERENCES blood_requisitions(id) ON DELETE RESTRICT,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      component_id UUID NOT NULL REFERENCES blood_components(id) ON DELETE RESTRICT,
      patient_sample_barcode VARCHAR(50),
      technique VARCHAR(30) NOT NULL
        CHECK (technique IN ('gel_card', 'tube', 'immediate_spin', 'anti_human_globulin_ahg', 'computerized')),
      major_crossmatch VARCHAR(20) NOT NULL CHECK (major_crossmatch IN ('compatible', 'incompatible')),
      minor_crossmatch VARCHAR(20) CHECK (minor_crossmatch IN ('compatible', 'incompatible')),
      compatibility_result VARCHAR(20) NOT NULL
        CHECK (compatibility_result IN ('compatible', 'incompatible', 'indeterminate')),
      performed_by_name VARCHAR(150) NOT NULL,
      performed_by_id UUID,
      tested_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      verified_by_name VARCHAR(150),
      verified_by_id UUID,
      verified_at TIMESTAMPTZ,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_crossmatches_req ON blood_crossmatches (requisition_id);
    CREATE INDEX idx_crossmatches_patient ON blood_crossmatches (patient_id);
    CREATE INDEX idx_crossmatches_component ON blood_crossmatches (component_id);

    CREATE TABLE blood_component_reservations (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      requisition_id UUID NOT NULL REFERENCES blood_requisitions(id) ON DELETE RESTRICT,
      component_id UUID NOT NULL REFERENCES blood_components(id) ON DELETE RESTRICT,
      crossmatch_id UUID REFERENCES blood_crossmatches(id) ON DELETE SET NULL,
      reserved_for_patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      reserved_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      expires_at TIMESTAMPTZ NOT NULL,
      status VARCHAR(20) NOT NULL DEFAULT 'active'
        CHECK (status IN ('active', 'issued', 'expired', 'cancelled')),
      reserved_by_name VARCHAR(150) NOT NULL,
      cancelled_at TIMESTAMPTZ,
      cancelled_by_name VARCHAR(150),
      cancellation_reason TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      CHECK (expires_at > reserved_at)
    );

    CREATE UNIQUE INDEX uq_active_component_reservation
      ON blood_component_reservations (component_id)
      WHERE status = 'active';

    CREATE INDEX idx_reservations_req ON blood_component_reservations (requisition_id);
    CREATE INDEX idx_reservations_patient ON blood_component_reservations (reserved_for_patient_id);
    CREATE INDEX idx_reservations_status_expires ON blood_component_reservations (status, expires_at);

    CREATE TABLE blood_issues (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      issue_slip_number VARCHAR(50) NOT NULL UNIQUE,
      requisition_id UUID NOT NULL REFERENCES blood_requisitions(id) ON DELETE RESTRICT,
      component_id UUID NOT NULL REFERENCES blood_components(id) ON DELETE RESTRICT,
      reservation_id UUID REFERENCES blood_component_reservations(id) ON DELETE SET NULL,
      patient_id UUID NOT NULL REFERENCES patients(id) ON DELETE RESTRICT,
      crossmatch_id UUID REFERENCES blood_crossmatches(id) ON DELETE SET NULL,
      issued_by_name VARCHAR(150) NOT NULL,
      issued_by_id UUID,
      verified_by_name VARCHAR(150) NOT NULL,
      verified_by_id UUID,
      received_by_name VARCHAR(150) NOT NULL,
      received_by_designation VARCHAR(100) NOT NULL,
      dispatch_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      transport_box_id VARCHAR(50),
      transport_temperature_c NUMERIC(4,1),
      cold_chain_maintained BOOLEAN NOT NULL DEFAULT TRUE,
      notes TEXT,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_issues_requisition ON blood_issues (requisition_id);
    CREATE INDEX idx_issues_component ON blood_issues (component_id);
    CREATE INDEX idx_issues_patient ON blood_issues (patient_id);
    CREATE INDEX idx_issues_dispatch ON blood_issues (dispatch_time DESC);

    -- =========================================================================
    -- AUDITABILITY & STOCK MOVEMENT TRACEABILITY
    -- =========================================================================

    CREATE TABLE blood_inventory_audit_logs (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      component_id UUID NOT NULL REFERENCES blood_components(id) ON DELETE RESTRICT,
      previous_status VARCHAR(30),
      new_status VARCHAR(30) NOT NULL,
      action_type VARCHAR(50) NOT NULL,
      reference_table VARCHAR(50),
      reference_id UUID,
      performed_by_name VARCHAR(150) NOT NULL,
      performed_by_id UUID,
      reason TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

    CREATE INDEX idx_audit_component_time ON blood_inventory_audit_logs (component_id, created_at DESC);
    CREATE INDEX idx_audit_action ON blood_inventory_audit_logs (action_type);

    -- =========================================================================
    -- BUSINESS LOGIC FUNCTIONS & TRIGGERS
    -- =========================================================================

    -- 1. Trigger function: Auto-escalate and quarantine/block components upon reactive serology test
    CREATE OR REPLACE FUNCTION trg_handle_reactive_serology()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.result = 'reactive' THEN
        -- Mark all derived components of this donation as reactive immediately
        UPDATE blood_components
        SET status = 'reactive',
            updated_at = NOW(),
            notes = COALESCE(notes, '') || ' [TRIGGER] Marked reactive due to reactive ' || NEW.test_name || ' test.'
        WHERE parent_donation_id = NEW.donation_id
          AND status NOT IN ('reactive', 'disposed');

        -- Log escalation in audit log for each component
        INSERT INTO blood_inventory_audit_logs (
          component_id, previous_status, new_status, action_type,
          reference_table, reference_id, performed_by_name, performed_by_id,
          reason, metadata
        )
        SELECT
          c.id, c.status, 'reactive', 'TEST_REACTIVE_ESCALATION',
          'blood_serology_tests', NEW.id, NEW.tested_by_name, NEW.tested_by_id,
          'Serology test ' || NEW.test_name || ' showed reactive result. Unit quarantined and blocked.',
          jsonb_build_object('test_name', NEW.test_name, 'test_method', NEW.test_method, 'observed_value', NEW.observed_value)
        FROM blood_components c
        WHERE c.parent_donation_id = NEW.donation_id;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_serology_reactive_block
    AFTER INSERT OR UPDATE ON blood_serology_tests
    FOR EACH ROW
    EXECUTE FUNCTION trg_handle_reactive_serology();

    -- 2. Trigger function: Validate component eligibility and update stock on issue
    CREATE OR REPLACE FUNCTION trg_validate_blood_issue()
    RETURNS TRIGGER AS $$
    DECLARE
      v_comp RECORD;
    BEGIN
      SELECT status, expires_at INTO v_comp
      FROM blood_components
      WHERE id = NEW.component_id;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Component % not found', NEW.component_id;
      END IF;

      -- A component cannot be issued if quarantined, reactive, rejected, expired, or already issued
      IF v_comp.status NOT IN ('safe_for_release', 'reserved') THEN
        RAISE EXCEPTION 'Blood component % cannot be issued because its current status is %', NEW.component_id, v_comp.status;
      END IF;

      IF v_comp.expires_at <= NOW() THEN
        RAISE EXCEPTION 'Blood component % has expired at % and cannot be issued', NEW.component_id, v_comp.expires_at;
      END IF;

      -- Transition component status to issued
      UPDATE blood_components
      SET status = 'issued',
          updated_at = NOW()
      WHERE id = NEW.component_id;

      -- If linked to an active reservation, mark reservation as issued
      IF NEW.reservation_id IS NOT NULL THEN
        UPDATE blood_component_reservations
        SET status = 'issued'
        WHERE id = NEW.reservation_id AND status = 'active';
      END IF;

      -- Increment units_issued on requisition
      UPDATE blood_requisitions
      SET units_issued = units_issued + 1,
          updated_at = NOW()
      WHERE id = NEW.requisition_id;

      -- Insert into inventory audit log
      INSERT INTO blood_inventory_audit_logs (
        component_id, previous_status, new_status, action_type,
        reference_table, reference_id, performed_by_name, performed_by_id,
        reason, metadata
      )
      VALUES (
        NEW.component_id, v_comp.status, 'issued', 'COMPONENT_ISSUED',
        'blood_issues', NEW.id, NEW.issued_by_name, NEW.issued_by_id,
        'Unit issued for requisition ' || NEW.requisition_id,
        jsonb_build_object('issue_slip_number', NEW.issue_slip_number, 'patient_id', NEW.patient_id, 'cold_chain', NEW.cold_chain_maintained)
      );

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_blood_issue_safety
    BEFORE INSERT ON blood_issues
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_blood_issue();

    -- 3. Trigger function: Validate reservation and transition status
    CREATE OR REPLACE FUNCTION trg_validate_blood_reservation()
    RETURNS TRIGGER AS $$
    DECLARE
      v_comp RECORD;
    BEGIN
      IF NEW.status = 'active' THEN
        SELECT status, expires_at INTO v_comp
        FROM blood_components
        WHERE id = NEW.component_id;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Component % not found', NEW.component_id;
        END IF;

        IF v_comp.status <> 'safe_for_release' THEN
          RAISE EXCEPTION 'Blood component % cannot be reserved because it is not safe_for_release (current status: %)',
            NEW.component_id, v_comp.status;
        END IF;

        IF v_comp.expires_at <= NOW() THEN
          RAISE EXCEPTION 'Blood component % has expired and cannot be reserved', NEW.component_id;
        END IF;

        -- Update component status to reserved
        UPDATE blood_components
        SET status = 'reserved',
            updated_at = NOW()
        WHERE id = NEW.component_id;

        -- Update requisition units_reserved
        UPDATE blood_requisitions
        SET units_reserved = units_reserved + 1,
            updated_at = NOW()
        WHERE id = NEW.requisition_id;

        -- Log movement
        INSERT INTO blood_inventory_audit_logs (
          component_id, previous_status, new_status, action_type,
          reference_table, reference_id, performed_by_name,
          reason, metadata
        )
        VALUES (
          NEW.component_id, 'safe_for_release', 'reserved', 'COMPONENT_RESERVED',
          'blood_component_reservations', NEW.id, NEW.reserved_by_name,
          'Unit reserved for patient',
          jsonb_build_object('requisition_id', NEW.requisition_id, 'expires_at', NEW.expires_at)
        );
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_blood_reservation_safety
    BEFORE INSERT ON blood_component_reservations
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_blood_reservation();

    -- 4. Trigger function: Handle disposal audit and component transition
    CREATE OR REPLACE FUNCTION trg_handle_component_disposal()
    RETURNS TRIGGER AS $$
    DECLARE
      v_old_status VARCHAR(30);
    BEGIN
      SELECT status INTO v_old_status
      FROM blood_components
      WHERE id = NEW.component_id;

      UPDATE blood_components
      SET status = 'disposed',
          updated_at = NOW()
      WHERE id = NEW.component_id;

      INSERT INTO blood_inventory_audit_logs (
        component_id, previous_status, new_status, action_type,
        reference_table, reference_id, performed_by_name, performed_by_id,
        reason, metadata
      )
      VALUES (
        NEW.component_id, v_old_status, 'disposed', 'COMPONENT_DISPOSED',
        'blood_component_disposals', NEW.id, NEW.disposed_by_name, NEW.disposed_by_id,
        'Unit biologically disposed: ' || NEW.reason,
        jsonb_build_object('method', NEW.disposal_method, 'manifest', NEW.waste_manifest_number)
      );

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    CREATE TRIGGER trg_blood_disposal_record
    AFTER INSERT ON blood_component_disposals
    FOR EACH ROW
    EXECUTE FUNCTION trg_handle_component_disposal();
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    -- Drop triggers
    DROP TRIGGER IF EXISTS trg_blood_disposal_record ON blood_component_disposals;
    DROP TRIGGER IF EXISTS trg_blood_reservation_safety ON blood_component_reservations;
    DROP TRIGGER IF EXISTS trg_blood_issue_safety ON blood_issues;
    DROP TRIGGER IF EXISTS trg_serology_reactive_block ON blood_serology_tests;

    -- Drop functions
    DROP FUNCTION IF EXISTS trg_handle_component_disposal();
    DROP FUNCTION IF EXISTS trg_validate_blood_reservation();
    DROP FUNCTION IF EXISTS trg_validate_blood_issue();
    DROP FUNCTION IF EXISTS trg_handle_reactive_serology();

    -- Drop tables in reverse order of dependency
    DROP TABLE IF EXISTS blood_inventory_audit_logs CASCADE;
    DROP TABLE IF EXISTS blood_issues CASCADE;
    DROP TABLE IF EXISTS blood_component_reservations CASCADE;
    DROP TABLE IF EXISTS blood_crossmatches CASCADE;
    DROP TABLE IF EXISTS blood_requisitions CASCADE;
    DROP TABLE IF EXISTS blood_component_disposals CASCADE;
    DROP TABLE IF EXISTS blood_release_authorizations CASCADE;
    DROP TABLE IF EXISTS blood_serology_tests CASCADE;
    DROP TABLE IF EXISTS blood_grouping_verifications CASCADE;
    DROP TABLE IF EXISTS blood_storage_temperature_logs CASCADE;
    DROP TABLE IF EXISTS blood_component_processing CASCADE;
    DROP TABLE IF EXISTS blood_components CASCADE;
    DROP TABLE IF EXISTS blood_samples CASCADE;
    DROP TABLE IF EXISTS blood_donations CASCADE;
    DROP TABLE IF EXISTS blood_donor_screenings CASCADE;
    DROP TABLE IF EXISTS blood_donors CASCADE;
  `);
};
