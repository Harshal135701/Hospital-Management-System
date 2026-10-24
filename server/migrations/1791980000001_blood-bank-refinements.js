/**
 * Additive Safety Refinement Migration for MedicsPrime Blood Bank.
 * Migration: 1791785895061_blood-bank-refinements.js
 *
 * Implements targeted database-level safeguards based on comprehensive safety review:
 * 1. Safe-Release Verification: Reusable fn_assert_donation_safe_release() evaluating:
 *    - Shelf-life validity
 *    - Approved release authorization with both all_tti_non_reactive=TRUE and dual_grouping_verified=TRUE,
 *      ensuring no subsequent rejection/quarantine authorization supersedes it
 *    - Row-level share locking on blood_donations to serialize concurrent serology inserts against release checks
 *    - Latest-test resolution logic: for all 5 mandatory TTI pathogens (HIV 1/2, HBV, HCV, Syphilis, Malaria),
 *      the latest test result for the donation must be non_reactive; any latest or unreversed reactive,
 *      indeterminate, or invalid test strictly blocks release unless covered by a formal supervisor disposition
 *    - Dual-technician ABO/Rh verification with technicians_concur=TRUE and technician2_verified_at IS NOT NULL,
 *      matching the component ABO/Rh group
 * 2. Active Safe-Release Enforcement: Applied uniformly on component insertion, transition to safe_for_release,
 *    reservation creation, and unit issue.
 * 3. Issue Integrity & Incompatible Crossmatch Protection:
 *    - Routine issues strictly require an unexpired crossmatch with compatibility_result = 'compatible'
 *      matching the exact patient and component. Crossmatches with 'incompatible', 'indeterminate',
 *      or missing values are strictly rejected.
 *    - Emergency uncrossed release strictly limited to stat_emergency requisitions with named authorizer and justification.
 *    - Issuing a reserved unit strictly requires its matching active reservation.
 * 4. Exact Requisition Accounting & Concurrency:
 *    - Replaces silent GREATEST(0, units_reserved - 1) with explicit positive count verification and idempotent checks
 *    - Requisition counters adjusted exactly once across reservation, cancellation, expiry, and issue
 *    - Synchronizes requisition status ('pending' <-> 'partially_fulfilled' <-> 'fulfilled') with exact unit counts
 *    - Predictable lock ordering (requisitions -> components -> reservations) documented with cross-table limits
 * 5. Audit Trail Fidelity & Context Architecture:
 *    - Immutable audit logs via trg_prevent_audit_log_tampering
 *    - Unified single-entry audit trail using explicit audit context attributes on blood_components,
 *      capturing true OLD.status, NEW.status, originating record, actor, and reason without stale leakage
 * 6. Concurrently Safe Donor Eligibility: Row locks on screenings and donors enforcing consent, approval, Hb >= 12.5,
 *    weight >= 45 kg, active/deferred donor statuses, and strict deferred_until >= CURRENT_DATE boundary.
 * 7. Transit & Storage Validation:
 *    - Automated transit delay calculation with strict non-negative chronology (received >= transferred)
 *    - Storage temperature policy documented with clinical standard covering PRBC, Platelets, FFP,
 *      and whole_blood / cryoprecipitate / cryo_poor_plasma
 * 8. Exact Baseline Rollback: down() restores original trigger and function definitions verbatim without touching appointment schemas.
 */

export const shorthands = undefined;

export const up = (pgm) => {
  pgm.sql(`
    -- =========================================================================
    -- 1. AUDIT LOG IMMUTABILITY & EXPLICIT CONTEXT ARCHITECTURE
    -- =========================================================================

    -- Audit log immutability trigger:
    -- Prevents row-level UPDATE and DELETE operations on blood_inventory_audit_logs.
    -- Note on privilege boundaries: PostgreSQL row triggers prevent UPDATE/DELETE by standard application roles.
    -- Table-level TRUNCATE or superuser DDL bypasses row triggers; production deployment should REVOKE TRUNCATE,
    -- UPDATE, and DELETE ON blood_inventory_audit_logs FROM public and standard app roles.
    CREATE OR REPLACE FUNCTION trg_prevent_audit_log_tampering()
    RETURNS TRIGGER AS $$
    BEGIN
      RAISE EXCEPTION 'blood_inventory_audit_logs records are immutable and cannot be updated or deleted.';
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_audit_log_immutability ON blood_inventory_audit_logs;
    CREATE TRIGGER trg_audit_log_immutability
    BEFORE UPDATE OR DELETE ON blood_inventory_audit_logs
    FOR EACH ROW
    EXECUTE FUNCTION trg_prevent_audit_log_tampering();

    -- Add explicit audit context columns to blood_components to capture originating context
    -- and prevent stale action leakage across multi-step transactions
    ALTER TABLE blood_components
    ADD COLUMN IF NOT EXISTS audit_action_context VARCHAR(50),
    ADD COLUMN IF NOT EXISTS audit_ref_table VARCHAR(50),
    ADD COLUMN IF NOT EXISTS audit_ref_id UUID,
    ADD COLUMN IF NOT EXISTS audit_actor_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS audit_actor_id UUID,
    ADD COLUMN IF NOT EXISTS audit_reason TEXT,
    ADD COLUMN IF NOT EXISTS audit_metadata JSONB;

    -- Unified status transition logger on blood_components
    -- Fires BEFORE UPDATE OF status so context is recorded and immediately cleared
    CREATE OR REPLACE FUNCTION trg_log_component_status_transition()
    RETURNS TRIGGER AS $$
    DECLARE
      v_action VARCHAR(50);
      v_ref_table VARCHAR(50);
      v_ref_id UUID;
      v_actor_name VARCHAR(150);
      v_actor_id UUID;
      v_reason TEXT;
      v_meta JSONB;
    BEGIN
      IF OLD.status IS DISTINCT FROM NEW.status THEN
        -- Read and consume audit context fields
        v_action     := COALESCE(NEW.audit_action_context, 'STATUS_TRANSITION_' || UPPER(NEW.status));
        v_ref_table  := COALESCE(NEW.audit_ref_table, 'blood_components');
        v_ref_id     := COALESCE(NEW.audit_ref_id, NEW.id);
        v_actor_name := COALESCE(NEW.audit_actor_name, 'SYSTEM/AUDIT');
        v_actor_id   := NEW.audit_actor_id;
        v_reason     := COALESCE(NEW.audit_reason, 'Component status transitioned from ' || OLD.status || ' to ' || NEW.status);
        v_meta       := COALESCE(NEW.audit_metadata, '{}'::jsonb) || jsonb_build_object(
          'component_barcode', NEW.component_barcode,
          'previous_status', OLD.status,
          'new_status', NEW.status
        );

        INSERT INTO blood_inventory_audit_logs (
          component_id, previous_status, new_status, action_type,
          reference_table, reference_id, performed_by_name, performed_by_id,
          reason, metadata
        )
        VALUES (
          NEW.id, OLD.status, NEW.status, v_action,
          v_ref_table, v_ref_id, v_actor_name, v_actor_id,
          v_reason, v_meta
        );
      END IF;

      -- Always clear audit context attributes immediately so subsequent updates on the same row cannot reuse stale values
      NEW.audit_action_context := NULL;
      NEW.audit_ref_table      := NULL;
      NEW.audit_ref_id         := NULL;
      NEW.audit_actor_name     := NULL;
      NEW.audit_actor_id       := NULL;
      NEW.audit_reason         := NULL;
      NEW.audit_metadata       := NULL;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_component_status_audit ON blood_components;
    CREATE TRIGGER trg_component_status_audit
    BEFORE UPDATE ON blood_components
    FOR EACH ROW
    EXECUTE FUNCTION trg_log_component_status_transition();

    -- =========================================================================
    -- 2. REUSABLE SAFE-RELEASE ASSERTION FUNCTION
    -- =========================================================================

    CREATE OR REPLACE FUNCTION fn_assert_donation_safe_release(
      p_component_id UUID,
      p_donation_id UUID,
      p_abo VARCHAR,
      p_rh VARCHAR,
      p_expires_at TIMESTAMPTZ,
      p_barcode VARCHAR
    )
    RETURNS VOID AS $$
    DECLARE
      v_auth RECORD;
      v_grouping RECORD;
      v_tested_count INTEGER;
      v_non_reactive_count INTEGER;
      v_bad_latest_count INTEGER;
      v_any_reactive_count INTEGER;
      v_disposition_count INTEGER;
    BEGIN
      -- 1. Shelf-life check
      IF p_expires_at <= NOW() THEN
        RAISE EXCEPTION 'Component % has expired at % and cannot be released or utilized',
          COALESCE(p_barcode, p_component_id::text), p_expires_at;
      END IF;

      -- 2. Lock parent donation FOR SHARE to serialize against concurrent serology insertions
      PERFORM id FROM blood_donations WHERE id = p_donation_id FOR SHARE;

      -- 3. Verify approved release authorization with both flags confirmed
      SELECT id, release_decision, all_tti_non_reactive, dual_grouping_verified, authorized_at
      INTO v_auth
      FROM blood_release_authorizations
      WHERE donation_id = p_donation_id
        AND release_decision = 'approved_for_release'
        AND all_tti_non_reactive = TRUE
        AND dual_grouping_verified = TRUE
      ORDER BY authorized_at DESC, created_at DESC, id DESC
      LIMIT 1;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Component % lacks an approved release authorization with all_tti_non_reactive=TRUE and dual_grouping_verified=TRUE',
          COALESCE(p_barcode, p_component_id::text);
      END IF;

      -- 4. Verify no subsequent rejection/quarantine authorization supersedes it
      PERFORM id
      FROM blood_release_authorizations
      WHERE donation_id = p_donation_id
        AND release_decision IN ('rejected', 'quarantined_for_retest', 'escalated_supervisor')
        AND (authorized_at > v_auth.authorized_at OR (authorized_at = v_auth.authorized_at AND id <> v_auth.id));

      IF FOUND THEN
        RAISE EXCEPTION 'Component % release authorization has been superseded by a subsequent rejection or quarantine decision',
          COALESCE(p_barcode, p_component_id::text);
      END IF;

      -- 5. Latest-test evaluation for all 5 mandatory TTI pathogens:
      -- (hiv_1_2, hepatitis_b, hepatitis_c, syphilis, malaria)
      WITH latest_tests AS (
        SELECT DISTINCT ON (test_name)
          test_name, result, tested_at
        FROM blood_serology_tests
        WHERE donation_id = p_donation_id
          AND test_name IN ('hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria')
        ORDER BY test_name, tested_at DESC, created_at DESC, id DESC
      )
      SELECT
        COUNT(*),
        COUNT(*) FILTER (WHERE result = 'non_reactive'),
        COUNT(*) FILTER (WHERE result IN ('reactive', 'indeterminate', 'invalid'))
      INTO v_tested_count, v_non_reactive_count, v_bad_latest_count
      FROM latest_tests;

      IF v_tested_count < 5 THEN
        RAISE EXCEPTION 'Component % parent donation is missing tests for all 5 mandatory TTI pathogens (tested % of 5)',
          COALESCE(p_barcode, p_component_id::text), v_tested_count;
      END IF;

      IF v_non_reactive_count < 5 OR v_bad_latest_count > 0 THEN
        RAISE EXCEPTION 'Component % parent donation does not have non_reactive latest results for all 5 mandatory TTI tests',
          COALESCE(p_barcode, p_component_id::text);
      END IF;

      -- Reject if ANY historical reactive test exists, unless formally resolved by supervisor authorization
      SELECT COUNT(*) INTO v_any_reactive_count
      FROM blood_serology_tests
      WHERE donation_id = p_donation_id
        AND result = 'reactive';

      IF v_any_reactive_count > 0 THEN
        -- Check if an explicit supervisor release authorization specifically cleared the discrepancy
        SELECT COUNT(*) INTO v_disposition_count
        FROM blood_release_authorizations
        WHERE donation_id = p_donation_id
          AND release_decision = 'approved_for_release'
          AND notes ILIKE '%discrepancy_resolved%'
          AND authorized_at >= (
            SELECT MAX(tested_at) FROM blood_serology_tests WHERE donation_id = p_donation_id AND result = 'reactive'
          );

        IF v_disposition_count = 0 THEN
          RAISE EXCEPTION 'Component % parent donation has an active reactive test record without formal supervisor discrepancy resolution; release forbidden',
            COALESCE(p_barcode, p_component_id::text);
        END IF;
      END IF;

      -- 6. Dual-technician grouping verification
      SELECT id, determined_abo_group, determined_rh_factor, technicians_concur, technician2_verified_at, is_resolved
      INTO v_grouping
      FROM blood_grouping_verifications
      WHERE donation_id = p_donation_id
        AND technicians_concur = TRUE
        AND technician2_verified_at IS NOT NULL
      ORDER BY technician2_verified_at DESC, created_at DESC, id DESC
      LIMIT 1;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Component % lacks dual-technician verified ABO/Rh grouping for parent donation',
          COALESCE(p_barcode, p_component_id::text);
      END IF;

      IF p_abo IS DISTINCT FROM v_grouping.determined_abo_group OR
         p_rh IS DISTINCT FROM v_grouping.determined_rh_factor THEN
        RAISE EXCEPTION 'Component blood group (% %) does not match verified donation grouping (% %)',
          p_abo, p_rh, v_grouping.determined_abo_group, v_grouping.determined_rh_factor;
      END IF;
    END;
    $$ LANGUAGE plpgsql;

    -- Gate component transition to safe_for_release
    CREATE OR REPLACE FUNCTION trg_validate_component_safe_release()
    RETURNS TRIGGER AS $$
    DECLARE
      v_bad_tests INTEGER;
    BEGIN
      IF TG_OP = 'UPDATE' THEN
        -- On update transitioning to safe_for_release, run complete safe release assertion
        IF NEW.status = 'safe_for_release' AND (OLD.status IS NULL OR OLD.status <> 'safe_for_release') THEN
          PERFORM fn_assert_donation_safe_release(
            NEW.id, NEW.parent_donation_id, NEW.abo_group, NEW.rh_factor, NEW.expires_at, NEW.component_barcode
          );
        END IF;
      ELSIF TG_OP = 'INSERT' THEN
        -- On insertion, prevent setting safe_for_release if parent has any non-negative test
        IF NEW.status = 'safe_for_release' THEN
          PERFORM fn_assert_donation_safe_release(
            NEW.id, NEW.parent_donation_id, NEW.abo_group, NEW.rh_factor, NEW.expires_at, NEW.component_barcode
          );
        END IF;

        -- If parent donation already had reactive serology, force component to reactive on insert
        SELECT COUNT(*) INTO v_bad_tests
        FROM blood_serology_tests
        WHERE donation_id = NEW.parent_donation_id
          AND result = 'reactive';

        IF v_bad_tests > 0 AND NEW.status <> 'reactive' THEN
          NEW.status := 'reactive';
          NEW.audit_action_context := 'TEST_REACTIVE_ESCALATION';
          NEW.notes := COALESCE(NEW.notes, '') || ' [TRIGGER] Created as reactive due to existing reactive serology on parent donation.';
        END IF;
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_component_safe_release_gate ON blood_components;
    CREATE TRIGGER trg_component_safe_release_gate
    BEFORE INSERT OR UPDATE ON blood_components
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_component_safe_release();

    -- Upgraded reactive serology trigger setting audit context for unified single logging
    CREATE OR REPLACE FUNCTION trg_handle_reactive_serology()
    RETURNS TRIGGER AS $$
    BEGIN
      -- Acquire row lock on parent donation to serialize concurrent release validations
      PERFORM id FROM blood_donations WHERE id = NEW.donation_id FOR UPDATE;

      IF NEW.result = 'reactive' THEN
        UPDATE blood_components
        SET status               = 'reactive',
            audit_action_context = 'TEST_REACTIVE_ESCALATION',
            audit_ref_table      = 'blood_serology_tests',
            audit_ref_id         = NEW.id,
            audit_actor_name     = NEW.tested_by_name,
            audit_actor_id       = NEW.tested_by_id,
            audit_reason         = 'Reactive result on test: ' || NEW.test_name,
            audit_metadata       = jsonb_build_object('test_name', NEW.test_name, 'observed_value', NEW.observed_value),
            updated_at           = NOW(),
            notes                = COALESCE(notes, '') || ' [TRIGGER] Marked reactive due to reactive ' || NEW.test_name || ' test.'
        WHERE parent_donation_id = NEW.donation_id
          AND status NOT IN ('reactive', 'disposed');

      ELSIF NEW.result IN ('indeterminate', 'invalid') THEN
        UPDATE blood_components
        SET status               = 'quarantined',
            audit_action_context = 'TEST_' || UPPER(NEW.result) || '_HOLD',
            audit_ref_table      = 'blood_serology_tests',
            audit_ref_id         = NEW.id,
            audit_actor_name     = NEW.tested_by_name,
            audit_actor_id       = NEW.tested_by_id,
            audit_reason         = NEW.result || ' result on test: ' || NEW.test_name,
            audit_metadata       = jsonb_build_object('test_name', NEW.test_name, 'result', NEW.result),
            updated_at           = NOW(),
            notes                = COALESCE(notes, '') || ' [TRIGGER] Quarantined due to ' || NEW.result || ' ' || NEW.test_name || ' test.'
        WHERE parent_donation_id = NEW.donation_id
          AND status IN ('safe_for_release', 'testing_pending', 'reserved');
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_serology_reactive_block ON blood_serology_tests;
    CREATE TRIGGER trg_serology_reactive_block
    AFTER INSERT OR UPDATE ON blood_serology_tests
    FOR EACH ROW
    EXECUTE FUNCTION trg_handle_reactive_serology();

    -- =========================================================================
    -- 3. DONOR SCREENING & ELIGIBILITY ENFORCEMENT
    -- =========================================================================

    ALTER TABLE blood_donor_screenings
    DROP CONSTRAINT IF EXISTS chk_approved_screening_eligibility;

    ALTER TABLE blood_donor_screenings
    ADD CONSTRAINT chk_approved_screening_eligibility
    CHECK (
      eligibility_status <> 'approved' OR
      (
        consent_obtained = TRUE AND
        hemoglobin_g_dl IS NOT NULL AND hemoglobin_g_dl >= 12.5 AND
        weight_kg IS NOT NULL AND weight_kg >= 45.0
      )
    );

    CREATE OR REPLACE FUNCTION trg_validate_donation_eligibility()
    RETURNS TRIGGER AS $$
    DECLARE
      v_scr RECORD;
      v_donor RECORD;
    BEGIN
      -- Row-level locks prevent concurrent modifications from bypassing eligibility checks
      SELECT donor_id, consent_obtained, eligibility_status, weight_kg, hemoglobin_g_dl, deferred_until
      INTO v_scr
      FROM blood_donor_screenings
      WHERE id = NEW.screening_id
      FOR SHARE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Referenced screening % not found', NEW.screening_id;
      END IF;

      IF v_scr.donor_id <> NEW.donor_id THEN
        RAISE EXCEPTION 'Donation donor_id % does not match screening donor_id %', NEW.donor_id, v_scr.donor_id;
      END IF;

      IF v_scr.consent_obtained IS NOT TRUE THEN
        RAISE EXCEPTION 'Cannot record donation: donor consent was not obtained on screening %', NEW.screening_id;
      END IF;

      IF v_scr.eligibility_status <> 'approved' THEN
        RAISE EXCEPTION 'Cannot record donation: screening status is % (must be approved)', v_scr.eligibility_status;
      END IF;

      IF v_scr.hemoglobin_g_dl < 12.5 THEN
        RAISE EXCEPTION 'Cannot record donation: hemoglobin % g/dL is below required 12.5 g/dL threshold', v_scr.hemoglobin_g_dl;
      END IF;

      IF v_scr.weight_kg < 45.0 THEN
        RAISE EXCEPTION 'Cannot record donation: weight % kg is below required 45.0 kg threshold', v_scr.weight_kg;
      END IF;

      -- Strict deferral boundary: donor is eligible only when deferred_until is strictly in the past
      IF v_scr.deferred_until IS NOT NULL AND v_scr.deferred_until >= CURRENT_DATE THEN
        RAISE EXCEPTION 'Cannot record donation: donor is temporarily deferred until %', v_scr.deferred_until;
      END IF;

      SELECT donor_status, permanent_deferral_reason
      INTO v_donor
      FROM blood_donors
      WHERE id = NEW.donor_id
      FOR SHARE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Donor % not found', NEW.donor_id;
      END IF;

      IF v_donor.donor_status IN ('permanently_deferred', 'temporarily_deferred', 'inactive') THEN
        RAISE EXCEPTION 'Cannot record donation: donor status is % (Reason: %)',
          v_donor.donor_status, COALESCE(v_donor.permanent_deferral_reason, 'None specified');
      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_donation_eligibility_check ON blood_donations;
    CREATE TRIGGER trg_donation_eligibility_check
    BEFORE INSERT ON blood_donations
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_donation_eligibility();

    -- =========================================================================
    -- 4. RESERVATION LIFECYCLE & CONCURRENCY SYNCHRONIZATION
    -- =========================================================================

    -- Standardized Lock Order: Requisitions -> Components -> Reservations
    CREATE OR REPLACE FUNCTION trg_handle_reservation_lifecycle()
    RETURNS TRIGGER AS $$
    DECLARE
      v_req RECORD;
      v_comp RECORD;
      v_can_release BOOLEAN := FALSE;
      v_release_err TEXT;
      v_new_reserved INTEGER;
    BEGIN
      -- When an active reservation transitions to cancelled or expired
      IF OLD.status = 'active' AND NEW.status IN ('cancelled', 'expired') THEN

        -- 1. Lock Requisition (Lock Order 1) and verify counter consistency
        SELECT units_reserved, units_issued, units_requested INTO v_req
        FROM blood_requisitions
        WHERE id = NEW.requisition_id
        FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Requisition % not found during reservation status update', NEW.requisition_id;
        END IF;

        IF v_req.units_reserved <= 0 THEN
          RAISE EXCEPTION 'Cannot decrement units_reserved for requisition %: count is already 0', NEW.requisition_id;
        END IF;

        v_new_reserved := v_req.units_reserved - 1;

        UPDATE blood_requisitions
        SET units_reserved = v_new_reserved,
            status = CASE
              WHEN (v_new_reserved + v_req.units_issued) = 0 THEN 'pending'
              WHEN (v_new_reserved + v_req.units_issued) < v_req.units_requested THEN 'partially_fulfilled'
              ELSE status
            END,
            updated_at = NOW()
        WHERE id = NEW.requisition_id;

        -- 2. Lock Component (Lock Order 2)
        SELECT id, status, expires_at, parent_donation_id, abo_group, rh_factor, component_barcode
        INTO v_comp
        FROM blood_components
        WHERE id = NEW.component_id
        FOR UPDATE;

        IF FOUND AND v_comp.status = 'reserved' THEN
          -- Check shelf-life
          IF v_comp.expires_at <= NOW() THEN
            UPDATE blood_components
            SET status               = 'expired',
                audit_action_context = 'RESERVATION_' || UPPER(NEW.status) || '_EXPIRED',
                audit_ref_table      = 'blood_component_reservations',
                audit_ref_id         = NEW.id,
                audit_actor_name     = COALESCE(NEW.cancelled_by_name, 'SYSTEM'),
                audit_reason         = 'Reservation ' || NEW.status || ' but component expired on hold',
                updated_at           = NOW()
            WHERE id = NEW.component_id;
          ELSE
            -- Check safe-release prerequisites via reusable assertion function
            BEGIN
              PERFORM fn_assert_donation_safe_release(
                v_comp.id, v_comp.parent_donation_id, v_comp.abo_group, v_comp.rh_factor, v_comp.expires_at, v_comp.component_barcode
              );
              v_can_release := TRUE;
            EXCEPTION WHEN OTHERS THEN
              v_can_release := FALSE;
              v_release_err := SQLERRM;
            END;

            IF v_can_release THEN
              UPDATE blood_components
              SET status               = 'safe_for_release',
                  audit_action_context = 'RESERVATION_' || UPPER(NEW.status) || '_RELEASED',
                  audit_ref_table      = 'blood_component_reservations',
                  audit_ref_id         = NEW.id,
                  audit_actor_name     = COALESCE(NEW.cancelled_by_name, 'SYSTEM'),
                  audit_reason         = 'Reservation ' || NEW.status || '; unit restored to available inventory',
                  audit_metadata       = jsonb_build_object('cancellation_reason', NEW.cancellation_reason),
                  updated_at           = NOW()
              WHERE id = NEW.component_id;
            ELSE
              UPDATE blood_components
              SET status               = 'quarantined',
                  audit_action_context = 'RESERVATION_' || UPPER(NEW.status) || '_QUARANTINED',
                  audit_ref_table      = 'blood_component_reservations',
                  audit_ref_id         = NEW.id,
                  audit_actor_name     = COALESCE(NEW.cancelled_by_name, 'SYSTEM'),
                  audit_reason         = 'Reservation ' || NEW.status || '; unit returned to quarantine (' || v_release_err || ')',
                  audit_metadata       = jsonb_build_object('validation_failure', v_release_err),
                  updated_at           = NOW()
              WHERE id = NEW.component_id;
            END IF;
          END IF;
        END IF;

      END IF;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_reservation_status_sync ON blood_component_reservations;
    CREATE TRIGGER trg_reservation_status_sync
    AFTER UPDATE OF status ON blood_component_reservations
    FOR EACH ROW
    EXECUTE FUNCTION trg_handle_reservation_lifecycle();

    -- Upgraded reservation safety gate with consistent lock order and safe-release verification
    -- Lock Order: Requisitions -> Components -> Reservations
    CREATE OR REPLACE FUNCTION trg_validate_blood_reservation()
    RETURNS TRIGGER AS $$
    DECLARE
      v_req RECORD;
      v_comp RECORD;
      v_xm RECORD;
    BEGIN
      IF NEW.status = 'active' THEN

        -- 1. Lock Requisition (Lock Order 1)
        SELECT patient_id, units_requested, units_reserved, units_issued INTO v_req
        FROM blood_requisitions
        WHERE id = NEW.requisition_id
        FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Requisition % not found', NEW.requisition_id;
        END IF;

        IF v_req.patient_id <> NEW.reserved_for_patient_id THEN
          RAISE EXCEPTION 'Reservation patient_id % does not match requisition patient_id %',
            NEW.reserved_for_patient_id, v_req.patient_id;
        END IF;

        IF (v_req.units_reserved + v_req.units_issued) >= v_req.units_requested THEN
          RAISE EXCEPTION 'Cannot reserve: requisition % is already fully reserved/issued (% reserved + % issued of % requested)',
            NEW.requisition_id, v_req.units_reserved, v_req.units_issued, v_req.units_requested;
        END IF;

        -- 2. Lock Component (Lock Order 2)
        SELECT id, status, expires_at, parent_donation_id, abo_group, rh_factor, component_barcode INTO v_comp
        FROM blood_components
        WHERE id = NEW.component_id
        FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Component % not found', NEW.component_id;
        END IF;

        IF v_comp.status <> 'safe_for_release' THEN
          RAISE EXCEPTION 'Blood component % cannot be reserved because it is not safe_for_release (current status: %)',
            v_comp.component_barcode, v_comp.status;
        END IF;

        -- Run full reusable safe release assertion
        PERFORM fn_assert_donation_safe_release(
          v_comp.id, v_comp.parent_donation_id, v_comp.abo_group, v_comp.rh_factor, v_comp.expires_at, v_comp.component_barcode
        );

        -- 3. Validate crossmatch relationship if supplied
        IF NEW.crossmatch_id IS NOT NULL THEN
          SELECT compatibility_result, patient_id, component_id, expires_at INTO v_xm
          FROM blood_crossmatches
          WHERE id = NEW.crossmatch_id;

          IF NOT FOUND THEN
            RAISE EXCEPTION 'Crossmatch % not found', NEW.crossmatch_id;
          END IF;

          IF v_xm.compatibility_result <> 'compatible' THEN
            RAISE EXCEPTION 'Crossmatch % is %; incompatible units cannot be reserved',
              NEW.crossmatch_id, v_xm.compatibility_result;
          END IF;

          IF v_xm.expires_at IS NOT NULL AND v_xm.expires_at <= NOW() THEN
            RAISE EXCEPTION 'Crossmatch % expired at % and cannot be used for reservation',
              NEW.crossmatch_id, v_xm.expires_at;
          END IF;

          IF v_xm.patient_id <> NEW.reserved_for_patient_id THEN
            RAISE EXCEPTION 'Crossmatch patient % does not match reservation patient %',
              v_xm.patient_id, NEW.reserved_for_patient_id;
          END IF;

          IF v_xm.component_id <> NEW.component_id THEN
            RAISE EXCEPTION 'Crossmatch component % does not match reservation component %',
              v_xm.component_id, NEW.component_id;
          END IF;
        END IF;

        -- 4. Transition component status to reserved (trigger trg_component_status_audit writes audit log)
        UPDATE blood_components
        SET status               = 'reserved',
            audit_action_context = 'COMPONENT_RESERVED',
            audit_ref_table      = 'blood_component_reservations',
            audit_ref_id         = NEW.id,
            audit_actor_name     = NEW.reserved_by_name,
            audit_reason         = 'Unit reserved for patient',
            audit_metadata       = jsonb_build_object('requisition_id', NEW.requisition_id, 'expires_at', NEW.expires_at),
            updated_at           = NOW()
        WHERE id = NEW.component_id;

        -- 5. Increment units_reserved on requisition and update status
        UPDATE blood_requisitions
        SET units_reserved = units_reserved + 1,
            status = CASE
              WHEN (units_reserved + 1 + units_issued) >= units_requested THEN 'fulfilled'
              ELSE 'partially_fulfilled'
            END,
            updated_at = NOW()
        WHERE id = NEW.requisition_id;

      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_blood_reservation_safety ON blood_component_reservations;
    CREATE TRIGGER trg_blood_reservation_safety
    BEFORE INSERT ON blood_component_reservations
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_blood_reservation();

    -- =========================================================================
    -- 5. ISSUE SAFETY & CROSSMATCH INTEGRITY
    -- =========================================================================

    ALTER TABLE blood_crossmatches
    ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '72 hours');

    ALTER TABLE blood_issues
    ADD COLUMN IF NOT EXISTS is_emergency_unmatched BOOLEAN NOT NULL DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS emergency_authorizer_name VARCHAR(150),
    ADD COLUMN IF NOT EXISTS emergency_clinical_justification TEXT;

    -- Lock Order: Requisitions -> Components -> Reservations
    CREATE OR REPLACE FUNCTION trg_validate_blood_issue()
    RETURNS TRIGGER AS $$
    DECLARE
      v_req RECORD;
      v_comp RECORD;
      v_res RECORD;
      v_xm RECORD;
    BEGIN
      -- 1. Lock Requisition (Lock Order 1)
      SELECT patient_id, urgency, units_requested, units_reserved, units_issued INTO v_req
      FROM blood_requisitions
      WHERE id = NEW.requisition_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Requisition % not found', NEW.requisition_id;
      END IF;

      IF v_req.patient_id <> NEW.patient_id THEN
        RAISE EXCEPTION 'Issue patient_id % does not match requisition patient_id %',
          NEW.patient_id, v_req.patient_id;
      END IF;

      IF v_req.units_issued >= v_req.units_requested THEN
        RAISE EXCEPTION 'Requisition % has already fulfilled all % requested units',
          NEW.requisition_id, v_req.units_requested;
      END IF;

      -- 2. Lock Component (Lock Order 2)
      SELECT id, status, expires_at, parent_donation_id, abo_group, rh_factor, component_barcode INTO v_comp
      FROM blood_components
      WHERE id = NEW.component_id
      FOR UPDATE;

      IF NOT FOUND THEN
        RAISE EXCEPTION 'Component % not found', NEW.component_id;
      END IF;

      IF v_comp.status NOT IN ('safe_for_release', 'reserved') THEN
        RAISE EXCEPTION 'Blood component % cannot be issued because its current status is %',
          v_comp.component_barcode, v_comp.status;
      END IF;

      -- Run complete safe-release assertion
      PERFORM fn_assert_donation_safe_release(
        v_comp.id, v_comp.parent_donation_id, v_comp.abo_group, v_comp.rh_factor, v_comp.expires_at, v_comp.component_barcode
      );

      -- 3. Lock and validate Reservation (Lock Order 3) if component is reserved or reservation_id provided
      IF v_comp.status = 'reserved' AND NEW.reservation_id IS NULL THEN
        RAISE EXCEPTION 'Component % is currently reserved; issuing it requires the active reservation_id',
          v_comp.component_barcode;
      END IF;

      IF NEW.reservation_id IS NOT NULL THEN
        SELECT id, requisition_id, component_id, reserved_for_patient_id, status
        INTO v_res
        FROM blood_component_reservations
        WHERE id = NEW.reservation_id
        FOR UPDATE;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Referenced reservation % not found', NEW.reservation_id;
        END IF;

        IF v_res.component_id <> NEW.component_id THEN
          RAISE EXCEPTION 'Reservation component % does not match issue component %',
            v_res.component_id, NEW.component_id;
        END IF;

        IF v_res.reserved_for_patient_id <> NEW.patient_id THEN
          RAISE EXCEPTION 'Reservation patient % does not match issue patient %',
            v_res.reserved_for_patient_id, NEW.patient_id;
        END IF;

        IF v_res.requisition_id <> NEW.requisition_id THEN
          RAISE EXCEPTION 'Reservation requisition % does not match issue requisition %',
            v_res.requisition_id, NEW.requisition_id;
        END IF;

        IF v_res.status <> 'active' THEN
          RAISE EXCEPTION 'Referenced reservation % is not active (status: %)',
            NEW.reservation_id, v_res.status;
        END IF;
      END IF;

      -- 4. Crossmatch validation: incompatible, indeterminate, or non-matching units are NEVER permitted for issue
      IF NEW.crossmatch_id IS NOT NULL THEN
        SELECT compatibility_result, patient_id, component_id, expires_at INTO v_xm
        FROM blood_crossmatches
        WHERE id = NEW.crossmatch_id;

        IF NOT FOUND THEN
          RAISE EXCEPTION 'Referenced crossmatch % not found', NEW.crossmatch_id;
        END IF;

        IF v_xm.compatibility_result <> 'compatible' THEN
          RAISE EXCEPTION 'Crossmatch % result is %; incompatible or non-compatible units cannot be issued under any circumstance',
            NEW.crossmatch_id, v_xm.compatibility_result;
        END IF;

        IF v_xm.expires_at IS NOT NULL AND v_xm.expires_at <= NOW() THEN
          RAISE EXCEPTION 'Crossmatch % expired at % and cannot be used for issue',
            NEW.crossmatch_id, v_xm.expires_at;
        END IF;

        IF v_xm.patient_id <> NEW.patient_id THEN
          RAISE EXCEPTION 'Crossmatch patient % does not match issue patient %',
            v_xm.patient_id, NEW.patient_id;
        END IF;

        IF v_xm.component_id <> NEW.component_id THEN
          RAISE EXCEPTION 'Crossmatch component % does not match issue component %',
            v_xm.component_id, NEW.component_id;
        END IF;
      END IF;

      -- 5. Emergency vs routine requirements
      IF NEW.is_emergency_unmatched IS TRUE THEN
        IF NEW.emergency_authorizer_name IS NULL OR TRIM(NEW.emergency_authorizer_name) = '' THEN
          RAISE EXCEPTION 'Emergency uncrossed blood release requires a non-empty emergency_authorizer_name';
        END IF;

        IF NEW.emergency_clinical_justification IS NULL OR TRIM(NEW.emergency_clinical_justification) = '' THEN
          RAISE EXCEPTION 'Emergency uncrossed blood release requires non-empty emergency_clinical_justification';
        END IF;

        IF v_req.urgency <> 'stat_emergency' THEN
          RAISE EXCEPTION 'Emergency uncrossed release is strictly permitted only for stat_emergency requisitions (current: %)',
            v_req.urgency;
        END IF;
      ELSE
        IF NEW.crossmatch_id IS NULL THEN
          RAISE EXCEPTION 'A compatible crossmatch is required for routine blood issue. Emergency uncrossed release must be explicitly declared with justification for stat_emergency requisitions.';
        END IF;
      END IF;

      -- 6. Transition component status to issued (trg_component_status_audit writes audit log)
      UPDATE blood_components
      SET status               = 'issued',
          audit_action_context = 'COMPONENT_ISSUED',
          audit_ref_table      = 'blood_issues',
          audit_ref_id         = NEW.id,
          audit_actor_name     = NEW.issued_by_name,
          audit_actor_id       = NEW.issued_by_id,
          audit_reason         = 'Unit issued for requisition ' || NEW.requisition_id ||
            CASE WHEN NEW.is_emergency_unmatched THEN ' [EMERGENCY UNCROSSED]' ELSE ' [COMPATIBLE]' END,
          audit_metadata       = jsonb_build_object(
            'issue_slip_number', NEW.issue_slip_number,
            'requisition_id', NEW.requisition_id,
            'component_id', NEW.component_id,
            'patient_id', NEW.patient_id,
            'cold_chain', NEW.cold_chain_maintained,
            'emergency_release', NEW.is_emergency_unmatched,
            'authorizer', NEW.emergency_authorizer_name,
            'justification', NEW.emergency_clinical_justification
          ),
          updated_at           = NOW()
      WHERE id = NEW.component_id;

      -- 7. Mark reservation as issued and decrement requisition.units_reserved
      IF NEW.reservation_id IS NOT NULL THEN
        UPDATE blood_component_reservations
        SET status = 'issued'
        WHERE id = NEW.reservation_id AND status = 'active';

        IF v_req.units_reserved <= 0 THEN
          RAISE EXCEPTION 'Cannot decrement units_reserved for requisition %: count is already 0', NEW.requisition_id;
        END IF;

        UPDATE blood_requisitions
        SET units_reserved = units_reserved - 1
        WHERE id = NEW.requisition_id;
      END IF;

      -- 8. Increment units_issued on requisition and update status
      UPDATE blood_requisitions
      SET units_issued = units_issued + 1,
          status = CASE
            WHEN (units_issued + 1) >= units_requested THEN 'fulfilled'
            ELSE 'partially_fulfilled'
          END,
          updated_at = NOW()
      WHERE id = NEW.requisition_id;

      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_blood_issue_safety ON blood_issues;
    CREATE TRIGGER trg_blood_issue_safety
    BEFORE INSERT ON blood_issues
    FOR EACH ROW
    EXECUTE FUNCTION trg_validate_blood_issue();

    -- =========================================================================
    -- 6. COMPONENT PROCESSING TRANSIT & STORAGE POLICY VALIDATION
    -- =========================================================================

    CREATE OR REPLACE FUNCTION trg_calc_component_transit()
    RETURNS TRIGGER AS $$
    BEGIN
      IF NEW.transferred_to_lab_at IS NOT NULL AND NEW.received_in_lab_at IS NOT NULL THEN
        IF NEW.received_in_lab_at < NEW.transferred_to_lab_at THEN
          RAISE EXCEPTION 'received_in_lab_at (%) cannot be earlier than transferred_to_lab_at (%)',
            NEW.received_in_lab_at, NEW.transferred_to_lab_at;
        END IF;
        NEW.transfer_delay_hours := ROUND(EXTRACT(EPOCH FROM (NEW.received_in_lab_at - NEW.transferred_to_lab_at)) / 3600.0, 2);
        NEW.is_within_six_hours := (NEW.transfer_delay_hours <= 6.0);
      ELSE
        NEW.transfer_delay_hours := NULL;
        NEW.is_within_six_hours := FALSE;
      END IF;
      RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;

    DROP TRIGGER IF EXISTS trg_component_processing_transit_calc ON blood_component_processing;
    CREATE TRIGGER trg_component_processing_transit_calc
    BEFORE INSERT OR UPDATE ON blood_component_processing
    FOR EACH ROW
    EXECUTE FUNCTION trg_calc_component_transit();

    -- Storage policy constraints matching specifications exactly:
    -- PRBC: 2.0 to 6.0°C
    -- FFP: -40.0 to -30.0°C (specification states -30°C; maximum storage threshold is -30.0°C; flagged for clinical review)
    -- Platelets: 20.0 to 24.0°C on an agitator
    -- Whole Blood: 2.0 to 6.0°C
    -- Cryoprecipitate / Cryo-poor Plasma: -40.0 to -30.0°C
    ALTER TABLE blood_components
    DROP CONSTRAINT IF EXISTS chk_component_storage_policy;

    ALTER TABLE blood_components
    ADD CONSTRAINT chk_component_storage_policy
    CHECK (
      storage_min_temp_c IS NOT NULL AND
      storage_max_temp_c IS NOT NULL AND
      (
        (component_type = 'prbc' AND storage_min_temp_c >= 2.0 AND storage_max_temp_c <= 6.0) OR
        (component_type = 'ffp' AND storage_min_temp_c >= -40.0 AND storage_max_temp_c <= -30.0) OR
        (component_type = 'platelets' AND storage_min_temp_c >= 20.0 AND storage_max_temp_c <= 24.0 AND requires_agitator = TRUE) OR
        (component_type = 'whole_blood' AND storage_min_temp_c >= 2.0 AND storage_max_temp_c <= 6.0) OR
        (component_type IN ('cryoprecipitate', 'cryo_poor_plasma') AND storage_min_temp_c >= -40.0 AND storage_max_temp_c <= -30.0)
      )
    );
  `);
};

export const down = (pgm) => {
  pgm.sql(`
    -- Drop constraints added in this refinement
    ALTER TABLE blood_components DROP CONSTRAINT IF EXISTS chk_component_storage_policy;
    ALTER TABLE blood_donor_screenings DROP CONSTRAINT IF EXISTS chk_approved_screening_eligibility;

    -- Drop columns added in this refinement
    ALTER TABLE blood_crossmatches DROP COLUMN IF EXISTS expires_at;
    ALTER TABLE blood_issues DROP COLUMN IF EXISTS emergency_clinical_justification;
    ALTER TABLE blood_issues DROP COLUMN IF EXISTS emergency_authorizer_name;
    ALTER TABLE blood_issues DROP COLUMN IF EXISTS is_emergency_unmatched;

    ALTER TABLE blood_components DROP COLUMN IF EXISTS audit_metadata;
    ALTER TABLE blood_components DROP COLUMN IF EXISTS audit_reason;
    ALTER TABLE blood_components DROP COLUMN IF EXISTS audit_actor_id;
    ALTER TABLE blood_components DROP COLUMN IF EXISTS audit_actor_name;
    ALTER TABLE blood_components DROP COLUMN IF EXISTS audit_ref_id;
    ALTER TABLE blood_components DROP COLUMN IF EXISTS audit_ref_table;
    ALTER TABLE blood_components DROP COLUMN IF EXISTS audit_action_context;

    -- Drop triggers added in this refinement
    DROP TRIGGER IF EXISTS trg_component_processing_transit_calc ON blood_component_processing;
    DROP TRIGGER IF EXISTS trg_reservation_status_sync ON blood_component_reservations;
    DROP TRIGGER IF EXISTS trg_donation_eligibility_check ON blood_donations;
    DROP TRIGGER IF EXISTS trg_component_safe_release_gate ON blood_components;
    DROP TRIGGER IF EXISTS trg_component_status_audit ON blood_components;
    DROP TRIGGER IF EXISTS trg_audit_log_immutability ON blood_inventory_audit_logs;

    -- Drop functions added in this refinement
    DROP FUNCTION IF EXISTS trg_calc_component_transit();
    DROP FUNCTION IF EXISTS trg_handle_reservation_lifecycle();
    DROP FUNCTION IF EXISTS trg_validate_donation_eligibility();
    DROP FUNCTION IF EXISTS trg_validate_component_safe_release();
    DROP FUNCTION IF EXISTS fn_assert_donation_safe_release();
    DROP FUNCTION IF EXISTS trg_log_component_status_transition();
    DROP FUNCTION IF EXISTS trg_prevent_audit_log_tampering();

    -- Restore baseline trg_handle_reactive_serology, trg_validate_blood_reservation, and trg_validate_blood_issue verbatim
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
  `);
};
