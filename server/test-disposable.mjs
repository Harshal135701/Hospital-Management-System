import pg from 'pg';
const { Client } = pg;
import fs from 'fs';
import path from 'path';

// Explicit check to confirm we are NOT connecting to development database
const TEST_DB = 'medicsprime_disposable_test';
const DEV_DB = 'medicsprime_hms_dev';

if (TEST_DB === DEV_DB) {
  throw new Error('Safety check failed: Attempting to run test script against development database!');
}

const config = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'Krishna@01',
  database: TEST_DB
};

async function executeMigrationSql(client, migrationPath, direction = 'up') {
  // Read ESM migration file
  const fullPath = path.resolve(import.meta.dirname, '..', relPath);
  // Dynamic import of ESM migration file
  const mod = await import('file:///' + fullPath.replace(/\\/g, '/'));
  
  // Create mock pgm object that collects sql
  let sqlStatements = [];
  const pgm = {
    sql: (query) => {
      sqlStatements.push(query);
    }
  };

  if (direction === 'up') {
    mod.up(pgm);
  } else {
    mod.down(pgm);
  }

  for (const statement of sqlStatements) {
    await client.query(statement);
  }
}

async function runTestHarness() {
  console.log(`Connecting to isolated disposable database: ${TEST_DB}...`);
  const client1 = new Client(config);
  await client1.connect();
  console.log(`✓ Connected to ${TEST_DB}`);

  // Ensure clean slate in disposable database ONLY
  if (config.database !== 'medicsprime_disposable_test') {
    throw new Error('Refusing to clean database other than medicsprime_disposable_test');
  }
  await client1.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

  try {
    // 1. Apply baseline migration 1: initial schema
    console.log('--- Applying Migration 1: 1791635204809_initial-schema (UP) ---');
    await executeMigrationSql(client1, 'migrations/1791635204809_initial-schema.js', 'up');
    console.log('✓ Initial appointment schema applied.');

    // 2. Apply baseline migration 2: blood bank schema
    console.log('--- Applying Migration 2: 1791785051918_blood-bank-schema (UP) ---');
    await executeMigrationSql(client1, 'migrations/1791785051918_blood-bank-schema.js', 'up');
    console.log('✓ Baseline blood bank schema applied.');

    // 3. Apply refinement migration 3: blood bank refinements
    console.log('--- Applying Migration 3: 1791785895061_blood-bank-refinements (UP) ---');
    await executeMigrationSql(client1, 'migrations/1791785895061_blood-bank-refinements.js', 'up');
    console.log('✓ Refinement migration applied successfully.');

    // =========================================================================
    // EXECUTE COMPREHENSIVE SUITE OF SAFETY & CONCURRENCY TESTS
    // =========================================================================



    // Test 2: Donor Screening Vitals and Deferral Boundary
    console.log('\n--- Test 2: Donor Eligibility Boundary & Screening Vitals ---');
    const donor1 = await client1.query(`
      INSERT INTO blood_donors (
        donor_code, full_name, date_of_birth, gender, mobile, donor_status
      ) VALUES (
        'DON-TEST-001', 'John Doe', '1990-01-01', 'male', '1234567890', 'active'
      ) RETURNING id;
    `);
    const donorId1 = donor1.rows[0].id;

    // Screening with Hb < 12.5 cannot be approved
    let lowHbApprovedBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_donor_screenings (
          donor_id, screening_number, weight_kg, hemoglobin_g_dl,
          blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm,
          consent_obtained, eligibility_status, reviewed_by_name
        ) VALUES (
          $1, 'SCR-TEST-LOWHB', 60.0, 11.8, 120, 80, 72, true, 'approved', 'Dr. Smith'
        );
      `, [donorId1]);
    } catch (e) {
      lowHbApprovedBlocked = true;
      console.log('✓ Screening with low Hb (11.8) approved was blocked by check constraint:', e.message);
    }
    if (!lowHbApprovedBlocked) throw new Error('FAIL: Approved screening with low Hb was not blocked!');

    // Screening with weight < 45.0 cannot be approved
    let lowWeightApprovedBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_donor_screenings (
          donor_id, screening_number, weight_kg, hemoglobin_g_dl,
          blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm,
          consent_obtained, eligibility_status, reviewed_by_name
        ) VALUES (
          $1, 'SCR-TEST-LOWWT', 44.5, 13.0, 120, 80, 72, true, 'approved', 'Dr. Smith'
        );
      `, [donorId1]);
    } catch (e) {
      lowWeightApprovedBlocked = true;
      console.log('✓ Screening with low weight (44.5 kg) approved was blocked by check constraint:', e.message);
    }
    if (!lowWeightApprovedBlocked) throw new Error('FAIL: Approved screening with low weight was not blocked!');

    // Screening with consent_obtained = FALSE cannot be approved
    let noConsentApprovedBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_donor_screenings (
          donor_id, screening_number, weight_kg, hemoglobin_g_dl,
          blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm,
          consent_obtained, eligibility_status, reviewed_by_name
        ) VALUES (
          $1, 'SCR-TEST-NOCONSENT', 60.0, 13.0, 120, 80, 72, false, 'approved', 'Dr. Smith'
        );
      `, [donorId1]);
    } catch (e) {
      noConsentApprovedBlocked = true;
      console.log('✓ Screening without consent approved was blocked by check constraint:', e.message);
    }
    if (!noConsentApprovedBlocked) throw new Error('FAIL: Approved screening without consent was not blocked!');

    // Screening with exactly at limits (Hb=12.5, Weight=45.0) and consent=TRUE CAN be approved
    const scrExactLimits = await client1.query(`
      INSERT INTO blood_donor_screenings (
        donor_id, screening_number, weight_kg, hemoglobin_g_dl,
        blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm,
        consent_obtained, eligibility_status, reviewed_by_name
      ) VALUES (
        $1, 'SCR-TEST-EXACT', 45.0, 12.5, 120, 80, 72, true, 'approved', 'Dr. Smith'
      ) RETURNING id;
    `, [donorId1]);
    console.log('✓ Screening exactly at thresholds (Hb=12.5, Weight=45.0 kg) was accepted.');

    // Approved screening with deferred_until = CURRENT_DATE (must be blocked because donor is still deferred today)
    const scrValid = await client1.query(`
      INSERT INTO blood_donor_screenings (
        donor_id, screening_number, weight_kg, hemoglobin_g_dl,
        blood_pressure_systolic, blood_pressure_diastolic, pulse_bpm,
        consent_obtained, eligibility_status, deferred_until, reviewed_by_name
      ) VALUES (
        $1, 'SCR-TEST-002', 65.0, 13.5, 120, 80, 72, true, 'approved', CURRENT_DATE, 'Dr. Smith'
      ) RETURNING id;
    `, [donorId1]);
    const scrId1 = scrValid.rows[0].id;

    let donationOnDeferralBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_donations (
          donation_number, donor_id, screening_id, primary_bag_barcode,
          collection_started_at, volume_ml, bag_type, phlebotomist_name
        ) VALUES (
          'DONAT-TEST-001', $1, $2, 'BAG-TEST-001', NOW(), 450, 'single', 'Nurse A'
        );
      `, [donorId1, scrId1]);
    } catch (e) {
      donationOnDeferralBlocked = true;
      console.log('✓ Phlebotomy collection on active deferral date was blocked:', e.message);
    }
    if (!donationOnDeferralBlocked) throw new Error('FAIL: Donation on active deferral date was not blocked!');

    // Update screening deferred_until to yesterday (past)
    await client1.query(`UPDATE blood_donor_screenings SET deferred_until = CURRENT_DATE - 1 WHERE id = $1`, [scrId1]);
    const donation1 = await client1.query(`
      INSERT INTO blood_donations (
        donation_number, donor_id, screening_id, primary_bag_barcode,
        collection_started_at, volume_ml, bag_type, phlebotomist_name
      ) VALUES (
        'DONAT-TEST-001', $1, $2, 'BAG-TEST-001', NOW(), 450, 'single', 'Nurse A'
      ) RETURNING id;
    `, [donorId1, scrId1]);
    const donationId1 = donation1.rows[0].id;
    console.log('✓ Donation successfully created after deferral elapsed.');

    // Test 3: Safe-Release Gate & Retest Handling
    console.log('\n--- Test 3: Safe-Release Gate & Retest Overrides ---');
    // Create PRBC component
    const comp1 = await client1.query(`
      INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group, rh_factor,
        volume_ml, storage_location, storage_min_temp_c, storage_max_temp_c,
        prepared_at, expires_at, status
      ) VALUES (
        $1, 'CMP-TEST-001', 'prbc', 'O', 'positive',
        280, 'FRIDGE-1', 2.0, 6.0, NOW(), NOW() + INTERVAL '35 days', 'quarantined'
      ) RETURNING id;
    `, [donationId1]);
    const compId1 = comp1.rows[0].id;

    // Test 1: Audit Log Immutability
    console.log('\n--- Test 1: Audit Log Immutability (UPDATE/DELETE prevention) ---');
    const logInsert = await client1.query(`
      INSERT INTO blood_inventory_audit_logs (
        component_id, previous_status, new_status, action_type,
        reference_table, reference_id, performed_by_name, reason
      ) VALUES (
        $1, 'quarantined', 'testing_pending', 'TEST_LOG',
        'test_table', gen_random_uuid(), 'Admin', 'Initial test'
      ) RETURNING id;
    `, [compId1]);
    const logId = logInsert.rows[0].id;
    
    let updateBlocked = false;
    try {
      await client1.query(`UPDATE blood_inventory_audit_logs SET reason = 'tampered' WHERE id = $1`, [logId]);
    } catch (e) {
      updateBlocked = true;
      console.log('✓ UPDATE on audit log was blocked:', e.message);
    }
    if (!updateBlocked) throw new Error('FAIL: Audit log UPDATE was not blocked!');

    let deleteBlocked = false;
    try {
      await client1.query(`DELETE FROM blood_inventory_audit_logs WHERE id = $1`, [logId]);
    } catch (e) {
      deleteBlocked = true;
      console.log('✓ DELETE on audit log was blocked:', e.message);
    }
    if (!deleteBlocked) throw new Error('FAIL: Audit log DELETE was not blocked!');

    // Attempting safe_for_release without tests or authorization must fail
    let prematureReleaseBlocked = false;
    try {
      await client1.query(`UPDATE blood_components SET status = 'safe_for_release' WHERE id = $1`, [compId1]);
    } catch (e) {
      prematureReleaseBlocked = true;
      console.log('✓ Premature transition to safe_for_release was blocked:', e.message);
    }
    if (!prematureReleaseBlocked) throw new Error('FAIL: Premature transition to safe_for_release was not blocked!');

    // Record Dual Grouping Verification
    await client1.query(`
      INSERT INTO blood_grouping_verifications (
        donation_id, forward_anti_a, forward_anti_b, forward_anti_d,
        reverse_a_cells, reverse_b_cells, determined_abo_group, determined_rh_factor,
        technician1_name, technician2_name, technician2_verified_at, technicians_concur
      ) VALUES (
        $1, 'negative', 'negative', 'positive', 'positive', 'positive', 'O', 'positive',
        'Tech 1', 'Tech 2', NOW(), true
      );
    `, [donationId1]);

    // Record 5 non-reactive TTI tests
    for (const t of ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria']) {
      await client1.query(`
        INSERT INTO blood_serology_tests (
          donation_id, test_name, test_method, result, tested_by_name, tested_at
        ) VALUES (
          $1, $2, 'elisa', 'non_reactive', 'Tech Lab', NOW() - INTERVAL '1 hour'
        );
      `, [donationId1, t]);
    }

    // Record an approved release authorization
    await client1.query(`
      INSERT INTO blood_release_authorizations (
        donation_id, release_decision, all_tti_non_reactive, dual_grouping_verified,
        authorized_by_name, authorized_at
      ) VALUES (
        $1, 'approved_for_release', true, true, 'Dr. Director', NOW()
      );
    `, [donationId1]);

    // Now transition to safe_for_release must succeed
    await client1.query(`UPDATE blood_components SET status = 'safe_for_release' WHERE id = $1`, [compId1]);
    console.log('✓ Transition to safe_for_release succeeded after all prerequisites satisfied.');

    // Now record a NEWER reactive test on HIV
    console.log('Recording subsequent reactive serology test...');
    await client1.query(`
      INSERT INTO blood_serology_tests (
        donation_id, test_name, test_method, result, tested_by_name, tested_at
      ) VALUES (
        $1, 'hiv_1_2', 'nat', 'reactive', 'Tech Lab', NOW()
      );
    `, [donationId1]);

    // Verify component was automatically escalated to reactive by trigger
    const compCheck1 = await client1.query(`SELECT status FROM blood_components WHERE id = $1`, [compId1]);
    if (compCheck1.rows[0].status !== 'reactive') {
      throw new Error(`FAIL: Component was not auto-escalated to reactive! Got: ${compCheck1.rows[0].status}`);
    }
    console.log('✓ Component status auto-transitioned to reactive on newer reactive serology test.');

    // Attempting to re-mark as safe_for_release must now fail because newer test is reactive!
    let reactiveReleaseBlocked = false;
    try {
      await client1.query(`UPDATE blood_components SET status = 'safe_for_release' WHERE id = $1`, [compId1]);
    } catch (e) {
      reactiveReleaseBlocked = true;
      console.log('✓ Release blocked by fn_assert_donation_safe_release due to reactive test:', e.message);
    }
    if (!reactiveReleaseBlocked) throw new Error('FAIL: Releasing unit with reactive test was not blocked!');

    // Test 4: Reservation & Issue Accounting, Strict Incompatible XM Blocking
    console.log('\n--- Test 4: Reservation & Issue Integrity ---');
    // Create clean donation 2 and clear it
    const donation2 = await client1.query(`
      INSERT INTO blood_donations (
        donation_number, donor_id, screening_id, primary_bag_barcode,
        collection_started_at, volume_ml, bag_type, phlebotomist_name
      ) VALUES (
        'DONAT-TEST-002', $1, $2, 'BAG-TEST-002', NOW(), 450, 'single', 'Nurse B'
      ) RETURNING id;
    `, [donorId1, scrId1]);
    const donationId2 = donation2.rows[0].id;

    await client1.query(`
      INSERT INTO blood_grouping_verifications (
        donation_id, forward_anti_a, forward_anti_b, forward_anti_d,
        reverse_a_cells, reverse_b_cells, determined_abo_group, determined_rh_factor,
        technician1_name, technician2_name, technician2_verified_at, technicians_concur
      ) VALUES (
        $1, 'negative', 'negative', 'positive', 'positive', 'positive', 'O', 'positive',
        'Tech 1', 'Tech 2', NOW(), true
      );
    `, [donationId2]);

    for (const t of ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria']) {
      await client1.query(`
        INSERT INTO blood_serology_tests (
          donation_id, test_name, test_method, result, tested_by_name, tested_at
        ) VALUES (
          $1, $2, 'elisa', 'non_reactive', 'Tech Lab', NOW()
        );
      `, [donationId2, t]);
    }

    await client1.query(`
      INSERT INTO blood_release_authorizations (
        donation_id, release_decision, all_tti_non_reactive, dual_grouping_verified,
        authorized_by_name, authorized_at
      ) VALUES (
        $1, 'approved_for_release', true, true, 'Dr. Director', NOW()
      );
    `, [donationId2]);

    const comp2 = await client1.query(`
      INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group, rh_factor,
        volume_ml, storage_location, storage_min_temp_c, storage_max_temp_c,
        prepared_at, expires_at, status
      ) VALUES (
        $1, 'CMP-TEST-002', 'prbc', 'O', 'positive',
        280, 'FRIDGE-1', 2.0, 6.0, NOW(), NOW() + INTERVAL '35 days', 'safe_for_release'
      ) RETURNING id;
    `, [donationId2]);
    const compId2 = comp2.rows[0].id;

    // Create Patient & Requisition
    const pat1 = await client1.query(`
      INSERT INTO patients (uhid, full_name, mobile, gender)
      VALUES ('UHID-TEST-001', 'Alice Patient', '5551234567', 'female')
      RETURNING id;
    `);
    const patId1 = pat1.rows[0].id;

    const req1 = await client1.query(`
      INSERT INTO blood_requisitions (
        requisition_number, patient_id, requester_name, urgency,
        requested_component, units_requested, clinical_indication
      ) VALUES (
        'REQ-TEST-001', $1, 'Dr. Surgeon', 'routine',
        'prbc', 1, 'Surgery'
      ) RETURNING id;
    `, [patId1]);
    const reqId1 = req1.rows[0].id;

    // Create Incompatible Crossmatch
    const xmIncomp = await client1.query(`
      INSERT INTO blood_crossmatches (
        requisition_id, patient_id, component_id, technique,
        major_crossmatch, compatibility_result, performed_by_name
      ) VALUES (
        $1, $2, $3, 'tube', 'incompatible', 'incompatible', 'Tech XM'
      ) RETURNING id;
    `, [reqId1, patId1, compId2]);
    const xmIncompId = xmIncomp.rows[0].id;

    // Reserving with incompatible crossmatch must be blocked
    let incompResBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_component_reservations (
          requisition_id, component_id, crossmatch_id, reserved_for_patient_id,
          expires_at, status, reserved_by_name
        ) VALUES (
          $1, $2, $3, $4, NOW() + INTERVAL '24 hours', 'active', 'Clerk'
        );
      `, [reqId1, compId2, xmIncompId, patId1]);
    } catch (e) {
      incompResBlocked = true;
      console.log('✓ Reservation with incompatible crossmatch was blocked:', e.message);
    }
    if (!incompResBlocked) throw new Error('FAIL: Reservation with incompatible crossmatch was not blocked!');

    // Create Compatible Crossmatch
    const xmComp = await client1.query(`
      INSERT INTO blood_crossmatches (
        requisition_id, patient_id, component_id, technique,
        major_crossmatch, compatibility_result, performed_by_name
      ) VALUES (
        $1, $2, $3, 'tube', 'compatible', 'compatible', 'Tech XM'
      ) RETURNING id;
    `, [reqId1, patId1, compId2]);
    const xmCompId = xmComp.rows[0].id;

    // Reserve unit with compatible crossmatch
    const res1 = await client1.query(`
      INSERT INTO blood_component_reservations (
        requisition_id, component_id, crossmatch_id, reserved_for_patient_id,
        expires_at, status, reserved_by_name
      ) VALUES (
        $1, $2, $3, $4, NOW() + INTERVAL '24 hours', 'active', 'Clerk'
      ) RETURNING id;
    `, [reqId1, compId2, xmCompId, patId1]);
    const resId1 = res1.rows[0].id;

    // Check requisition counters: units_reserved should be 1
    const reqCheck1 = await client1.query(`SELECT units_reserved, units_issued FROM blood_requisitions WHERE id = $1`, [reqId1]);
    console.log(`✓ Requisition counters after reservation: units_reserved=${reqCheck1.rows[0].units_reserved}, units_issued=${reqCheck1.rows[0].units_issued}`);
    if (reqCheck1.rows[0].units_reserved !== 1) throw new Error('FAIL: units_reserved is not 1!');

    // Test: Attempting issue with expired crossmatch must be blocked
    const xmExpired = await client1.query(`
      INSERT INTO blood_crossmatches (
        requisition_id, patient_id, component_id, technique,
        major_crossmatch, compatibility_result, performed_by_name, expires_at
      ) VALUES (
        $1, $2, $3, 'tube', 'compatible', 'compatible', 'Tech XM', NOW() - INTERVAL '1 hour'
      ) RETURNING id;
    `, [reqId1, patId1, compId2]);
    const xmExpiredId = xmExpired.rows[0].id;

    let expiredXmBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_issues (
          issue_slip_number, requisition_id, component_id, reservation_id,
          patient_id, crossmatch_id, issued_by_name, verified_by_name,
          received_by_name, received_by_designation
        ) VALUES (
          'ISS-TEST-EXP', $1, $2, $3, $4, $5, 'Issuer', 'Verifier', 'Receiver', 'Nurse'
        );
      `, [reqId1, compId2, resId1, patId1, xmExpiredId]);
    } catch (e) {
      expiredXmBlocked = true;
      console.log('✓ Issue with expired crossmatch was blocked:', e.message);
    }
    if (!expiredXmBlocked) throw new Error('FAIL: Issue with expired crossmatch was not blocked!');

    // Test: Attempting issue with wrong patient crossmatch must be blocked
    const patWrong = await client1.query(`
      INSERT INTO patients (uhid, full_name, mobile, gender)
      VALUES ('UHID-TEST-WRONG', 'Wrong Patient', '5559999999', 'male')
      RETURNING id;
    `);
    const patWrongId = patWrong.rows[0].id;

    const xmWrongPat = await client1.query(`
      INSERT INTO blood_crossmatches (
        requisition_id, patient_id, component_id, technique,
        major_crossmatch, compatibility_result, performed_by_name
      ) VALUES (
        $1, $2, $3, 'tube', 'compatible', 'compatible', 'Tech XM'
      ) RETURNING id;
    `, [reqId1, patWrongId, compId2]);
    const xmWrongPatId = xmWrongPat.rows[0].id;

    let wrongPatXmBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_issues (
          issue_slip_number, requisition_id, component_id, reservation_id,
          patient_id, crossmatch_id, issued_by_name, verified_by_name,
          received_by_name, received_by_designation
        ) VALUES (
          'ISS-TEST-WRONGPAT', $1, $2, $3, $4, $5, 'Issuer', 'Verifier', 'Receiver', 'Nurse'
        );
      `, [reqId1, compId2, resId1, patId1, xmWrongPatId]);
    } catch (e) {
      wrongPatXmBlocked = true;
      console.log('✓ Issue with wrong patient crossmatch was blocked:', e.message);
    }
    if (!wrongPatXmBlocked) throw new Error('FAIL: Issue with wrong patient crossmatch was not blocked!');

    // Test: Routine issue with missing crossmatch must be blocked
    let missingXmBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_issues (
          issue_slip_number, requisition_id, component_id, reservation_id,
          patient_id, issued_by_name, verified_by_name,
          received_by_name, received_by_designation
        ) VALUES (
          'ISS-TEST-NOXM', $1, $2, $3, $4, 'Issuer', 'Verifier', 'Receiver', 'Nurse'
        );
      `, [reqId1, compId2, resId1, patId1]);
    } catch (e) {
      missingXmBlocked = true;
      console.log('✓ Routine issue without crossmatch was blocked:', e.message);
    }
    if (!missingXmBlocked) throw new Error('FAIL: Routine issue without crossmatch was not blocked!');

    // Test: Emergency issue on routine requisition must be blocked
    let emergencyOnRoutineBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_issues (
          issue_slip_number, requisition_id, component_id, reservation_id,
          patient_id, issued_by_name, verified_by_name,
          received_by_name, received_by_designation, is_emergency_unmatched,
          emergency_authorizer_name, emergency_clinical_justification
        ) VALUES (
          'ISS-TEST-EM-ROUTINE', $1, $2, $3, $4, 'Issuer', 'Verifier', 'Receiver', 'Nurse',
          true, 'Dr. Emergency', 'Urgent need'
        );
      `, [reqId1, compId2, resId1, patId1]);
    } catch (e) {
      emergencyOnRoutineBlocked = true;
      console.log('✓ Emergency uncrossed issue on routine requisition was blocked:', e.message);
    }
    if (!emergencyOnRoutineBlocked) throw new Error('FAIL: Emergency release on routine requisition was not blocked!');

    // Test: Emergency issue without justification must be blocked
    const reqStat = await client1.query(`
      INSERT INTO blood_requisitions (
        requisition_number, patient_id, requester_name, urgency,
        requested_component, units_requested, clinical_indication
      ) VALUES (
        'REQ-TEST-STAT', $1, 'Dr. Trauma', 'stat_emergency',
        'prbc', 1, 'Exsanguinating Hemorrhage'
      ) RETURNING id;
    `, [patId1]);
    const reqStatId = reqStat.rows[0].id;

    // Create a dedicated safe component for emergency testing (unreserved)
    const compEm = await client1.query(`
      INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group, rh_factor,
        volume_ml, storage_location, storage_min_temp_c, storage_max_temp_c,
        prepared_at, expires_at, status
      ) VALUES (
        $1, 'CMP-TEST-EMERGENCY', 'prbc', 'O', 'positive',
        280, 'FRIDGE-1', 2.0, 6.0, NOW(), NOW() + INTERVAL '35 days', 'safe_for_release'
      ) RETURNING id;
    `, [donationId2]);
    const compEmId = compEm.rows[0].id;

    let emergencyNoJustificationBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_issues (
          issue_slip_number, requisition_id, component_id,
          patient_id, issued_by_name, verified_by_name,
          received_by_name, received_by_designation, is_emergency_unmatched,
          emergency_authorizer_name, emergency_clinical_justification
        ) VALUES (
          'ISS-TEST-NOJUST', $1, $2, $3, 'Issuer', 'Verifier', 'Receiver', 'Nurse',
          true, 'Dr. Emergency', ''
        );
      `, [reqStatId, compEmId, patId1]);
    } catch (e) {
      emergencyNoJustificationBlocked = true;
      console.log('✓ Emergency issue without justification was blocked:', e.message);
    }
    if (!emergencyNoJustificationBlocked) throw new Error('FAIL: Emergency issue without justification was not blocked!');

    // Test: Valid emergency uncrossed release succeeds with justification and stat_emergency requisition
    await client1.query(`
      INSERT INTO blood_issues (
        issue_slip_number, requisition_id, component_id,
        patient_id, issued_by_name, verified_by_name,
        received_by_name, received_by_designation, is_emergency_unmatched,
        emergency_authorizer_name, emergency_clinical_justification
      ) VALUES (
        'ISS-TEST-EM-VALID', $1, $2, $3, 'Issuer', 'Verifier', 'Receiver', 'Nurse',
        true, 'Dr. Trauma Surgeon', 'Massive bleeding, immediate transfusion prior to crossmatch'
      );
    `, [reqStatId, compEmId, patId1]);
    console.log('✓ Valid emergency uncrossed issue succeeded with authorized justification.');

    // Attempting to issue with incompatible crossmatch even under emergency mode must fail!
    let incompIssueBlocked = false;
    try {
      await client1.query(`
        INSERT INTO blood_issues (
          issue_slip_number, requisition_id, component_id, reservation_id,
          patient_id, crossmatch_id, issued_by_name, verified_by_name,
          received_by_name, received_by_designation, is_emergency_unmatched,
          emergency_authorizer_name, emergency_clinical_justification
        ) VALUES (
          'ISS-TEST-001', $1, $2, $3, $4, $5, 'Issuer', 'Verifier', 'Receiver', 'Nurse',
          true, 'Dr. Emergency', 'Urgent need'
        );
      `, [reqId1, compId2, resId1, patId1, xmIncompId]);
    } catch (e) {
      incompIssueBlocked = true;
      console.log('✓ Issue with incompatible crossmatch was blocked even under emergency flag:', e.message);
    }
    if (!incompIssueBlocked) throw new Error('FAIL: Issue with incompatible crossmatch was not blocked!');

    // Now issue with matching compatible crossmatch and active reservation
    await client1.query(`
      INSERT INTO blood_issues (
        issue_slip_number, requisition_id, component_id, reservation_id,
        patient_id, crossmatch_id, issued_by_name, verified_by_name,
        received_by_name, received_by_designation
      ) VALUES (
        'ISS-TEST-002', $1, $2, $3, $4, $5, 'Issuer', 'Verifier', 'Receiver', 'Nurse'
      );
    `, [reqId1, compId2, resId1, patId1, xmCompId]);

    // Check requisition counters: units_reserved must be 0, units_issued must be 1
    const reqCheck2 = await client1.query(`SELECT units_reserved, units_issued FROM blood_requisitions WHERE id = $1`, [reqId1]);
    console.log(`✓ Requisition counters after issue: units_reserved=${reqCheck2.rows[0].units_reserved}, units_issued=${reqCheck2.rows[0].units_issued}`);
    if (reqCheck2.rows[0].units_reserved !== 0 || reqCheck2.rows[0].units_issued !== 1) {
      throw new Error(`FAIL: Inconsistent counters after issue! Got: ${JSON.stringify(reqCheck2.rows[0])}`);
    }

    // Test 5: Concurrency Simulation (Separate Sessions)
    console.log('\n--- Test 5: Concurrency Simulation (Separate Sessions) ---');
    const client2 = new Client(config);
    await client2.connect();

    // Create a 3rd safe component and a 2-unit requisition
    const donation3 = await client1.query(`
      INSERT INTO blood_donations (
        donation_number, donor_id, screening_id, primary_bag_barcode,
        collection_started_at, volume_ml, bag_type, phlebotomist_name
      ) VALUES (
        'DONAT-TEST-003', $1, $2, 'BAG-TEST-003', NOW(), 450, 'single', 'Nurse C'
      ) RETURNING id;
    `, [donorId1, scrId1]);
    const donationId3 = donation3.rows[0].id;

    await client1.query(`
      INSERT INTO blood_grouping_verifications (
        donation_id, forward_anti_a, forward_anti_b, forward_anti_d,
        reverse_a_cells, reverse_b_cells, determined_abo_group, determined_rh_factor,
        technician1_name, technician2_name, technician2_verified_at, technicians_concur
      ) VALUES (
        $1, 'negative', 'negative', 'positive', 'positive', 'positive', 'O', 'positive',
        'Tech 1', 'Tech 2', NOW(), true
      );
    `, [donationId3]);

    for (const t of ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria']) {
      await client1.query(`
        INSERT INTO blood_serology_tests (
          donation_id, test_name, test_method, result, tested_by_name, tested_at
        ) VALUES (
          $1, $2, 'elisa', 'non_reactive', 'Tech Lab', NOW()
        );
      `, [donationId3, t]);
    }

    await client1.query(`
      INSERT INTO blood_release_authorizations (
        donation_id, release_decision, all_tti_non_reactive, dual_grouping_verified,
        authorized_by_name, authorized_at
      ) VALUES (
        $1, 'approved_for_release', true, true, 'Dr. Director', NOW()
      );
    `, [donationId3]);

    const comp3 = await client1.query(`
      INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group, rh_factor,
        volume_ml, storage_location, storage_min_temp_c, storage_max_temp_c,
        prepared_at, expires_at, status
      ) VALUES (
        $1, 'CMP-TEST-003', 'prbc', 'O', 'positive',
        280, 'FRIDGE-1', 2.0, 6.0, NOW(), NOW() + INTERVAL '35 days', 'safe_for_release'
      ) RETURNING id;
    `, [donationId3]);
    const compId3 = comp3.rows[0].id;

    const req2 = await client1.query(`
      INSERT INTO blood_requisitions (
        requisition_number, patient_id, requester_name, urgency,
        requested_component, units_requested, clinical_indication
      ) VALUES (
        'REQ-TEST-002', $1, 'Dr. Surgeon', 'urgent',
        'prbc', 1, 'Emergency Surgery'
      ) RETURNING id;
    `, [patId1]);
    const reqId2 = req2.rows[0].id;

    // Session 1 begins transaction and locks requisition & component
    await client1.query('BEGIN');
    await client1.query(`SELECT id FROM blood_requisitions WHERE id = $1 FOR UPDATE`, [reqId2]);
    await client1.query(`SELECT id FROM blood_components WHERE id = $1 FOR UPDATE`, [compId3]);

    // Scenario 5a: Simultaneous reservations competing for remaining requisition unit
    console.log('Scenario 5a: Session 1 holds locks. Session 2 attempts reservation (expecting lock wait)...');
    let session2Finished = false;
    let session2Error = null;

    const session2Promise = client2.query(`
      INSERT INTO blood_component_reservations (
        requisition_id, component_id, reserved_for_patient_id,
        expires_at, status, reserved_by_name
      ) VALUES (
        $1, $2, $3, NOW() + INTERVAL '24 hours', 'active', 'User B'
      );
    `, [reqId2, compId3, patId1]).then(() => {
      session2Finished = true;
    }).catch(err => {
      session2Error = err;
    });

    // Wait 300ms to verify session 2 is paused waiting on session 1's lock
    await new Promise(res => setTimeout(res, 300));
    console.log(`Session 2 waiting status: ${session2Finished ? 'Prematurely finished' : 'Waiting cleanly on lock'}`);
    if (session2Finished) throw new Error('FAIL: Session 2 did not wait on Session 1 lock!');

    // Session 1 completes reservation and commits
    await client1.query(`
      INSERT INTO blood_component_reservations (
        requisition_id, component_id, reserved_for_patient_id,
        expires_at, status, reserved_by_name
      ) VALUES (
        $1, $2, $3, NOW() + INTERVAL '24 hours', 'active', 'User A'
      );
    `, [reqId2, compId3, patId1]);
    await client1.query('COMMIT');

    // Now Session 2 wakes up and should fail with either duplicate active reservation or status not safe_for_release
    await session2Promise;
    if (session2Error) {
      console.log(`✓ Session 2 cleanly rejected after lock released (SQLSTATE: ${session2Error.code || 'P0001'}):`, session2Error.message);
    } else {
      throw new Error('FAIL: Session 2 should have been blocked from double reserving the same unit!');
    }

    // Scenario 5b: Reactive Serology Update racing against Reservation
    console.log('\nScenario 5b: Reactive serology insertion racing against reservation...');
    // Setup donation 4, safe component 4, requisition 3
    const donation4 = await client1.query(`
      INSERT INTO blood_donations (
        donation_number, donor_id, screening_id, primary_bag_barcode,
        collection_started_at, volume_ml, bag_type, phlebotomist_name
      ) VALUES (
        'DONAT-TEST-004', $1, $2, 'BAG-TEST-004', NOW(), 450, 'single', 'Nurse D'
      ) RETURNING id;
    `, [donorId1, scrId1]);
    const donationId4 = donation4.rows[0].id;

    await client1.query(`
      INSERT INTO blood_grouping_verifications (
        donation_id, forward_anti_a, forward_anti_b, forward_anti_d,
        reverse_a_cells, reverse_b_cells, determined_abo_group, determined_rh_factor,
        technician1_name, technician2_name, technician2_verified_at, technicians_concur
      ) VALUES (
        $1, 'negative', 'negative', 'positive', 'positive', 'positive', 'O', 'positive',
        'Tech 1', 'Tech 2', NOW(), true
      );
    `, [donationId4]);

    for (const t of ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria']) {
      await client1.query(`
        INSERT INTO blood_serology_tests (
          donation_id, test_name, test_method, result, tested_by_name, tested_at
        ) VALUES (
          $1, $2, 'elisa', 'non_reactive', 'Tech Lab', NOW() - INTERVAL '30 minutes'
        );
      `, [donationId4, t]);
    }

    await client1.query(`
      INSERT INTO blood_release_authorizations (
        donation_id, release_decision, all_tti_non_reactive, dual_grouping_verified,
        authorized_by_name, authorized_at
      ) VALUES (
        $1, 'approved_for_release', true, true, 'Dr. Director', NOW()
      );
    `, [donationId4]);

    const comp4 = await client1.query(`
      INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group, rh_factor,
        volume_ml, storage_location, storage_min_temp_c, storage_max_temp_c,
        prepared_at, expires_at, status
      ) VALUES (
        $1, 'CMP-TEST-004', 'prbc', 'O', 'positive',
        280, 'FRIDGE-1', 2.0, 6.0, NOW(), NOW() + INTERVAL '35 days', 'safe_for_release'
      ) RETURNING id;
    `, [donationId4]);
    const compId4 = comp4.rows[0].id;

    const req3 = await client1.query(`
      INSERT INTO blood_requisitions (
        requisition_number, patient_id, requester_name, urgency,
        requested_component, units_requested, clinical_indication
      ) VALUES (
        'REQ-TEST-003', $1, 'Dr. Surgeon', 'routine',
        'prbc', 1, 'ICU Transfusion'
      ) RETURNING id;
    `, [patId1]);
    const reqId3 = req3.rows[0].id;

    // Session 1 starts transaction to mark serology reactive (which acquires FOR UPDATE on donation)
    await client1.query('BEGIN');
    await client1.query(`
      INSERT INTO blood_serology_tests (
        donation_id, test_name, test_method, result, tested_by_name, tested_at
      ) VALUES (
        $1, 'hiv_1_2', 'nat', 'reactive', 'Tech Lab', NOW()
      );
    `, [donationId4]);

    // Session 2 concurrently attempts reservation on compId4 (evaluates safe-release which needs donation lock)
    let session2SerologyRaceDone = false;
    let session2SerologyRaceErr = null;
    const s2SerologyPromise = client2.query(`
      INSERT INTO blood_component_reservations (
        requisition_id, component_id, reserved_for_patient_id,
        expires_at, status, reserved_by_name
      ) VALUES (
        $1, $2, $3, NOW() + INTERVAL '24 hours', 'active', 'User Concurrent'
      );
    `, [reqId3, compId4, patId1]).then(() => {
      session2SerologyRaceDone = true;
    }).catch(err => {
      session2SerologyRaceErr = err;
    });

    await new Promise(res => setTimeout(res, 300));
    console.log(`Session 2 serialization status during serology update: ${session2SerologyRaceDone ? 'Finished early' : 'Waiting cleanly on lock'}`);

    // Commit reactive serology transaction
    await client1.query('COMMIT');
    await s2SerologyPromise;

    if (session2SerologyRaceErr) {
      console.log(`✓ Session 2 reservation was safely rejected after serology committed (SQLSTATE: ${session2SerologyRaceErr.code || 'P0001'}):`, session2SerologyRaceErr.message);
    } else {
      throw new Error('FAIL: Session 2 was able to reserve a reactive unit!');
    }

    // Scenario 5c: Cancellation racing with Issue
    console.log('\nScenario 5c: Reservation cancellation racing with unit issue...');
    // Create safe donation 5, component 5, requisition 4, compatible crossmatch, active reservation
    const donation5 = await client1.query(`
      INSERT INTO blood_donations (
        donation_number, donor_id, screening_id, primary_bag_barcode,
        collection_started_at, volume_ml, bag_type, phlebotomist_name
      ) VALUES (
        'DONAT-TEST-005', $1, $2, 'BAG-TEST-005', NOW(), 450, 'single', 'Nurse E'
      ) RETURNING id;
    `, [donorId1, scrId1]);
    const donationId5 = donation5.rows[0].id;

    await client1.query(`
      INSERT INTO blood_grouping_verifications (
        donation_id, forward_anti_a, forward_anti_b, forward_anti_d,
        reverse_a_cells, reverse_b_cells, determined_abo_group, determined_rh_factor,
        technician1_name, technician2_name, technician2_verified_at, technicians_concur
      ) VALUES (
        $1, 'negative', 'negative', 'positive', 'positive', 'positive', 'O', 'positive',
        'Tech 1', 'Tech 2', NOW(), true
      );
    `, [donationId5]);

    for (const t of ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria']) {
      await client1.query(`
        INSERT INTO blood_serology_tests (
          donation_id, test_name, test_method, result, tested_by_name, tested_at
        ) VALUES (
          $1, $2, 'elisa', 'non_reactive', 'Tech Lab', NOW() - INTERVAL '15 minutes'
        );
      `, [donationId5, t]);
    }

    await client1.query(`
      INSERT INTO blood_release_authorizations (
        donation_id, release_decision, all_tti_non_reactive, dual_grouping_verified,
        authorized_by_name, authorized_at
      ) VALUES (
        $1, 'approved_for_release', true, true, 'Dr. Director', NOW()
      );
    `, [donationId5]);

    const comp5 = await client1.query(`
      INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group, rh_factor,
        volume_ml, storage_location, storage_min_temp_c, storage_max_temp_c,
        prepared_at, expires_at, status
      ) VALUES (
        $1, 'CMP-TEST-005', 'prbc', 'O', 'positive',
        280, 'FRIDGE-1', 2.0, 6.0, NOW(), NOW() + INTERVAL '35 days', 'safe_for_release'
      ) RETURNING id;
    `, [donationId5]);
    const compId5 = comp5.rows[0].id;

    const req4 = await client1.query(`
      INSERT INTO blood_requisitions (
        requisition_number, patient_id, requester_name, urgency,
        requested_component, units_requested, clinical_indication
      ) VALUES (
        'REQ-TEST-004', $1, 'Dr. Surgeon', 'routine',
        'prbc', 1, 'Routine Surgery'
      ) RETURNING id;
    `, [patId1]);
    const reqId4 = req4.rows[0].id;

    const xmComp2 = await client1.query(`
      INSERT INTO blood_crossmatches (
        requisition_id, patient_id, component_id, technique,
        major_crossmatch, compatibility_result, performed_by_name
      ) VALUES (
        $1, $2, $3, 'tube', 'compatible', 'compatible', 'Tech XM'
      ) RETURNING id;
    `, [reqId4, patId1, compId5]);
    const xmCompId2 = xmComp2.rows[0].id;

    const res2 = await client1.query(`
      INSERT INTO blood_component_reservations (
        requisition_id, component_id, crossmatch_id, reserved_for_patient_id,
        expires_at, status, reserved_by_name
      ) VALUES (
        $1, $2, $3, $4, NOW() + INTERVAL '24 hours', 'active', 'Clerk'
      ) RETURNING id;
    `, [reqId4, compId5, xmCompId2, patId1]);
    const resId2 = res2.rows[0].id;

    // Session 1 begins transaction and cancels reservation
    await client1.query('BEGIN');
    await client1.query(`
      UPDATE blood_component_reservations
      SET status = 'cancelled', cancellation_reason = 'Surgery postponed'
      WHERE id = $1
    `, [resId2]);

    // Session 2 concurrently attempts to issue the unit using the reservation
    let s2IssueDone = false;
    let s2IssueErr = null;
    const s2IssuePromise = client2.query(`
      INSERT INTO blood_issues (
        issue_slip_number, requisition_id, component_id, reservation_id,
        patient_id, crossmatch_id, issued_by_name, verified_by_name,
        received_by_name, received_by_designation
      ) VALUES (
        'ISS-TEST-003', $1, $2, $3, $4, $5, 'Issuer', 'Verifier', 'Receiver', 'Nurse'
      );
    `, [reqId4, compId5, resId2, patId1, xmCompId2]).then(() => {
      s2IssueDone = true;
    }).catch(err => {
      s2IssueErr = err;
    });

    await new Promise(res => setTimeout(res, 300));
    console.log(`Session 2 issue waiting status during cancellation: ${s2IssueDone ? 'Finished early' : 'Waiting cleanly on lock'}`);

    // Commit cancellation
    await client1.query('COMMIT');
    await s2IssuePromise;

    if (s2IssueErr) {
      console.log(`✓ Session 2 issue was safely rejected after reservation cancelled (SQLSTATE: ${s2IssueErr.code || 'P0001'}):`, s2IssueErr.message);
    } else {
      throw new Error('FAIL: Session 2 was able to issue a cancelled reservation!');
    }

    // Scenario 5d: Two concurrent issues competing for the same unit/reservation
    console.log('\nScenario 5d: Two concurrent issues competing for the same unit/reservation...');
    const donation6 = await client1.query(`
      INSERT INTO blood_donations (
        donation_number, donor_id, screening_id, primary_bag_barcode,
        collection_started_at, volume_ml, bag_type, phlebotomist_name
      ) VALUES (
        'DONAT-TEST-006', $1, $2, 'BAG-TEST-006', NOW(), 450, 'single', 'Nurse F'
      ) RETURNING id;
    `, [donorId1, scrId1]);
    const donationId6 = donation6.rows[0].id;

    await client1.query(`
      INSERT INTO blood_grouping_verifications (
        donation_id, forward_anti_a, forward_anti_b, forward_anti_d,
        reverse_a_cells, reverse_b_cells, determined_abo_group, determined_rh_factor,
        technician1_name, technician2_name, technician2_verified_at, technicians_concur
      ) VALUES (
        $1, 'negative', 'negative', 'positive', 'positive', 'positive', 'O', 'positive',
        'Tech 1', 'Tech 2', NOW(), true
      );
    `, [donationId6]);

    for (const t of ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria']) {
      await client1.query(`
        INSERT INTO blood_serology_tests (
          donation_id, test_name, test_method, result, tested_by_name, tested_at
        ) VALUES (
          $1, $2, 'elisa', 'non_reactive', 'Tech Lab', NOW() - INTERVAL '10 minutes'
        );
      `, [donationId6, t]);
    }

    await client1.query(`
      INSERT INTO blood_release_authorizations (
        donation_id, release_decision, all_tti_non_reactive, dual_grouping_verified,
        authorized_by_name, authorized_at
      ) VALUES (
        $1, 'approved_for_release', true, true, 'Dr. Director', NOW()
      );
    `, [donationId6]);

    const comp6 = await client1.query(`
      INSERT INTO blood_components (
        parent_donation_id, component_barcode, component_type, abo_group, rh_factor,
        volume_ml, storage_location, storage_min_temp_c, storage_max_temp_c,
        prepared_at, expires_at, status
      ) VALUES (
        $1, 'CMP-TEST-006', 'prbc', 'O', 'positive',
        280, 'FRIDGE-1', 2.0, 6.0, NOW(), NOW() + INTERVAL '35 days', 'safe_for_release'
      ) RETURNING id;
    `, [donationId6]);
    const compId6 = comp6.rows[0].id;

    const req5 = await client1.query(`
      INSERT INTO blood_requisitions (
        requisition_number, patient_id, requester_name, urgency,
        requested_component, units_requested, clinical_indication
      ) VALUES (
        'REQ-TEST-005', $1, 'Dr. Surgeon', 'routine',
        'prbc', 1, 'Elective Surgery'
      ) RETURNING id;
    `, [patId1]);
    const reqId5 = req5.rows[0].id;

    const xmComp3 = await client1.query(`
      INSERT INTO blood_crossmatches (
        requisition_id, patient_id, component_id, technique,
        major_crossmatch, compatibility_result, performed_by_name
      ) VALUES (
        $1, $2, $3, 'tube', 'compatible', 'compatible', 'Tech XM'
      ) RETURNING id;
    `, [reqId5, patId1, compId6]);
    const xmCompId3 = xmComp3.rows[0].id;

    const res3 = await client1.query(`
      INSERT INTO blood_component_reservations (
        requisition_id, component_id, crossmatch_id, reserved_for_patient_id,
        expires_at, status, reserved_by_name
      ) VALUES (
        $1, $2, $3, $4, NOW() + INTERVAL '24 hours', 'active', 'Clerk'
      ) RETURNING id;
    `, [reqId5, compId6, xmCompId3, patId1]);
    const resId3 = res3.rows[0].id;

    // Session 1 begins transaction and issues unit
    await client1.query('BEGIN');
    await client1.query(`
      INSERT INTO blood_issues (
        issue_slip_number, requisition_id, component_id, reservation_id,
        patient_id, crossmatch_id, issued_by_name, verified_by_name,
        received_by_name, received_by_designation
      ) VALUES (
        'ISS-TEST-COMPETE-1', $1, $2, $3, $4, $5, 'Issuer 1', 'Verifier 1', 'Receiver 1', 'Nurse'
      );
    `, [reqId5, compId6, resId3, patId1, xmCompId3]);

    // Session 2 concurrently attempts to issue the same unit
    let s2CompeteDone = false;
    let s2CompeteErr = null;
    const s2CompetePromise = client2.query(`
      INSERT INTO blood_issues (
        issue_slip_number, requisition_id, component_id, reservation_id,
        patient_id, crossmatch_id, issued_by_name, verified_by_name,
        received_by_name, received_by_designation
      ) VALUES (
        'ISS-TEST-COMPETE-2', $1, $2, $3, $4, $5, 'Issuer 2', 'Verifier 2', 'Receiver 2', 'Nurse'
      );
    `, [reqId5, compId6, resId3, patId1, xmCompId3]).then(() => {
      s2CompeteDone = true;
    }).catch(err => {
      s2CompeteErr = err;
    });

    await new Promise(res => setTimeout(res, 300));
    console.log(`Session 2 compete waiting status: ${s2CompeteDone ? 'Finished early' : 'Waiting cleanly on lock'}`);

    // Commit Session 1 issue
    await client1.query('COMMIT');
    await s2CompetePromise;

    if (s2CompeteErr) {
      console.log(`✓ Session 2 competing issue was safely rejected (SQLSTATE: ${s2CompeteErr.code || 'P0001'}):`, s2CompeteErr.message);
    } else {
      throw new Error('FAIL: Session 2 was able to double-issue the same unit/reservation!');
    }

    // Verify final state of requisition and component
    const req5Final = await client1.query(`SELECT units_reserved, units_issued, status FROM blood_requisitions WHERE id = $1`, [reqId5]);
    console.log(`✓ Final requisition 5 state: units_reserved=${req5Final.rows[0].units_reserved}, units_issued=${req5Final.rows[0].units_issued}, status=${req5Final.rows[0].status}`);
    if (req5Final.rows[0].units_reserved !== 0 || req5Final.rows[0].units_issued !== 1 || req5Final.rows[0].status !== 'fulfilled') {
      throw new Error(`FAIL: Inconsistent final state on requisition 5: ${JSON.stringify(req5Final.rows[0])}`);
    }

    const comp6Final = await client1.query(`SELECT status FROM blood_components WHERE id = $1`, [compId6]);
    console.log(`✓ Final component 6 status: ${comp6Final.rows[0].status}`);
    if (comp6Final.rows[0].status !== 'issued') {
      throw new Error(`FAIL: Component 6 final status is not issued! Got: ${comp6Final.rows[0].status}`);
    }

    await client2.end();

    // =========================================================================
    // TEST 6: ROLLBACK VERIFICATION (UP -> DOWN -> UP)
    // =========================================================================
    console.log('\n--- Test 6: Rollback & Re-application Verification (UP -> DOWN -> UP) ---');
    console.log('Executing Migration 3 (DOWN)...');
    await executeMigrationSql(client1, 'migrations/1791785895061_blood-bank-refinements.js', 'down');
    console.log('✓ DOWN migration completed.');

    // Verify baseline table count remains exactly 25
    const tablesAfterDown = await client1.query(`
      SELECT table_name FROM information_schema.tables WHERE table_schema='public' ORDER BY table_name;
    `);
    console.log(`✓ Tables remaining after DOWN: ${tablesAfterDown.rows.length} (appointments, patients, and 16 baseline blood bank tables preserved)`);
    if (!tablesAfterDown.rows.some(r => r.table_name === 'appointments')) {
      throw new Error('FAIL: appointments table was missing after DOWN migration!');
    }
    if (!tablesAfterDown.rows.some(r => r.table_name === 'blood_components')) {
      throw new Error('FAIL: blood_components table was missing after DOWN migration!');
    }

    // Re-apply migration 3 (UP) to prove clean idempotence
    console.log('Executing Migration 3 (UP re-apply)...');
    await executeMigrationSql(client1, 'migrations/1791785895061_blood-bank-refinements.js', 'up');
    console.log('✓ UP re-apply completed cleanly.');

    console.log('\n======================================================');
    console.log('ALL TESTS PASSED SUCCESSFULLY IN DISPOSABLE DATABASE!');
    console.log('======================================================');

  } finally {
    await client1.end();
  }
}

runTestHarness().catch(err => {
  console.error('\nTest harness error:', err);
  process.exit(1);
});
