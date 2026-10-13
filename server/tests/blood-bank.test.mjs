import pg from 'pg';
const { Pool } = pg;
import path from 'path';
import http from 'http';

// ============================================================================
// STRICT SAFETY GUARD: ENSURE DISPOSABLE TEST DATABASE ONLY
// ============================================================================
const TEST_DB = 'medicsprime_disposable_test';
const DEV_DB = 'medicsprime_hms_dev';

if (TEST_DB === DEV_DB) {
  throw new Error('FATAL: TEST_DB cannot be the same as DEV_DB!');
}

process.env.DB_NAME = TEST_DB;
process.env.DB_HOST = process.env.DB_HOST || 'localhost';
process.env.DB_PORT = process.env.DB_PORT || '5432';
process.env.DB_USER = process.env.DB_USER || 'postgres';
process.env.DB_PASSWORD = process.env.DB_PASSWORD || 'Krishna@01';

console.log('------------------------------------------------------------');
console.log('SAFETY VERIFICATION: Automated Integration Test Suite');
console.log(`Active Target Database: ${process.env.DB_NAME}`);
console.log(`Explicitly Prohibited DB: ${DEV_DB}`);
console.log('------------------------------------------------------------');

if (process.env.DB_NAME !== TEST_DB) {
  throw new Error(`FATAL: DB_NAME is ${process.env.DB_NAME}, expected ${TEST_DB}`);
}

const pool = new Pool({
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT, 10),
  database: TEST_DB,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD
});

async function executeMigration(client, relPath) {
  const fullPath = path.resolve('c:/Users/acer/Downloads/Hospital-Management-System/server', relPath);
  const mod = await import('file:///' + fullPath.replace(/\\/g, '/'));
  const sqlStatements = [];
  const pgm = {
    sql: (q) => { sqlStatements.push(q); }
  };
  mod.up(pgm);
  for (const stmt of sqlStatements) {
    await client.query(stmt);
  }
}

async function setupDatabase() {
  const client = await pool.connect();
  try {
    console.log(`[Setup] Resetting public schema in isolated ${TEST_DB}...`);
    await client.query('DROP SCHEMA public CASCADE; CREATE SCHEMA public;');

    console.log('[Setup] Applying Migration 1: 1791635204809_initial-schema.js...');
    await executeMigration(client, 'migrations/1791635204809_initial-schema.js');

    console.log('[Setup] Applying Migration 2: 1791785051918_blood-bank-schema.js...');
    await executeMigration(client, 'migrations/1791785051918_blood-bank-schema.js');

    console.log('[Setup] Applying Migration 3: 1791785895061_blood-bank-refinements.js...');
    await executeMigration(client, 'migrations/1791785895061_blood-bank-refinements.js');

    console.log(`✓ All migrations successfully applied to ${TEST_DB}`);
  } finally {
    client.release();
  }
}

async function runTests() {
  let server;
  let baseUrl;
  let passedTests = 0;
  let totalTests = 0;

  function assert(condition, message) {
    totalTests++;
    if (!condition) {
      console.error(`  FAIL: ${message}`);
      throw new Error(`Assertion failed: ${message}`);
    }
    passedTests++;
    console.log(`  ✓ ${message}`);
  }

  try {
    await setupDatabase();

    // Dynamically load Express app
    const appMod = await import('../src/app.js');
    const app = appMod.default || appMod;

    // Start server on ephemeral port
    server = http.createServer(app);
    await new Promise((resolve) => server.listen(0, resolve));
    const port = server.address().port;
    baseUrl = `http://localhost:${port}/api`;
    console.log(`[Server] Test Express server listening on ephemeral port ${port} -> ${baseUrl}`);

    // ========================================================================
    // SUITE 1: HEALTH & PATIENT API
    // ========================================================================
    console.log('\n--- SUITE 1: Health & Patient Master API ---');
    {
      const healthRes = await fetch(`${baseUrl}/health`);
      const healthData = await healthRes.json();
      assert(healthRes.status === 200, 'GET /health returns HTTP 200');
      assert(healthData.success === true, 'GET /health returns success: true');

      // Create Patient
      const createPatRes = await fetch(`${baseUrl}/patients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          uhid: 'UHID-2026-TEST01',
          full_name: 'Ananya Mukherjee',
          mobile: '9830012345',
          date_of_birth: '1985-05-20',
          gender: 'female'
        })
      });
      const patData = await createPatRes.json();
      assert(createPatRes.status === 201, 'POST /patients creates patient (201)');
      assert(patData.data.uhid === 'UHID-2026-TEST01', 'Patient has correct UHID');

      // Fetch Patient by UHID
      const getPatRes = await fetch(`${baseUrl}/patients/UHID-2026-TEST01`);
      const getPatData = await getPatRes.json();
      assert(getPatRes.status === 200, 'GET /patients/:uhid returns HTTP 200');
      assert(getPatData.data.full_name === 'Ananya Mukherjee', 'Patient full_name matches');
    }

    // ========================================================================
    // SUITE 2: DONOR REGISTRATION & HEALTH SCREENING API
    // ========================================================================
    console.log('\n--- SUITE 2: Donor Registration & Screening API ---');
    let donorId;
    let validScreeningId;
    {
      // Register Donor
      const createDonorRes = await fetch(`${baseUrl}/blood-bank/donors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          full_name: 'Vikramaditya Roy',
          date_of_birth: '1990-08-15',
          gender: 'male',
          blood_group: 'O',
          rh_factor: 'positive',
          mobile: '9831122334',
          email: 'vikram.roy@example.com'
        })
      });
      const donorData = await createDonorRes.json();
      assert(createDonorRes.status === 201, 'POST /blood-bank/donors returns 201');
      assert(donorData.data.donor_code.startsWith('DNR-'), 'Donor has sequential donor_code');
      donorId = donorData.data.id;

      // Screening Test A: Hemoglobin < 12.5 g/dL should defer donor
      const deferScreeningRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 65,
          hemoglobin_g_dl: 11.2, // Below 12.5!
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const deferData = await deferScreeningRes.json();
      assert(deferScreeningRes.status === 201, 'Low Hb screening recorded');
      assert(deferData.data.eligibility_status === 'temporarily_deferred', 'Low Hb auto-defers eligibility');

      // Verify donor status became temporarily_deferred
      const donorAfterDeferRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterDefer = await donorAfterDeferRes.json();
      assert(donorAfterDefer.data.donor_status === 'temporarily_deferred', 'Donor status updated to temporarily_deferred');

      // Screening Test B: Valid screening with Hb >= 12.5 and consent
      const validScreeningRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 68.5,
          hemoglobin_g_dl: 14.5,
          blood_pressure_systolic: 122,
          blood_pressure_diastolic: 82,
          pulse_bpm: 74,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const validData = await validScreeningRes.json();
      assert(validScreeningRes.status === 201, 'Valid screening returns 201');
      assert(validData.data.eligibility_status === 'approved', 'Valid screening approved');
      validScreeningId = validData.data.id;

      // Verify donor status restored to active
      const donorAfterValidRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterValid = await donorAfterValidRes.json();
      assert(donorAfterValid.data.donor_status === 'active', 'Donor status restored to active');
    }

    // ========================================================================
    // SUITE 3: PHLEBOTOMY & COLLECTION BARCODING API
    // ========================================================================
    console.log('\n--- SUITE 3: Phlebotomy & Bag Collection API ---');
    let donationId;
    {
      const bagBarcode = 'BB-2026-98745612301';
      const colRes = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          screening_id: validScreeningId,
          primary_bag_barcode: bagBarcode,
          volume_ml: 450,
          bag_type: 'triple',
          collection_type: 'voluntary',
          phlebotomist_name: 'Nurse Savitri Devi'
        })
      });
      const colData = await colRes.json();
      assert(colRes.status === 201, 'POST /blood-bank/donations returns 201');
      assert(colData.data.donation_number.startsWith('BLD-'), 'Donation assigned BLD number');
      assert(colData.data.primary_bag_barcode === bagBarcode, 'Bag barcode recorded');
      donationId = colData.data.id;

      // Verify donor donations count incremented
      const donorAfterColRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterCol = await donorAfterColRes.json();
      assert(donorAfterCol.data.total_donations === 1, 'Donor total_donations incremented to 1');
    }

    // ========================================================================
    // SUITE 4: COMPONENT SEPARATION & INVENTORY API
    // ========================================================================
    console.log('\n--- SUITE 4: Component Separation & Inventory API ---');
    let prbcComponentId;
    let prbcBarcode;
    {
      prbcBarcode = 'PRBC-2026-091401';
      const compRes = await fetch(`${baseUrl}/blood-bank/components`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          parent_donation_id: donationId,
          components: [
            {
              component_barcode: prbcBarcode,
              component_type: 'prbc',
              volume_ml: 280,
              storage_location: 'Cold-01',
              storage_min_temp_c: 2.0,
              storage_max_temp_c: 6.0,
              expires_at: new Date(Date.now() + 42 * 24 * 3600 * 1000).toISOString()
            },
            {
              component_barcode: 'FFP-2026-091402',
              component_type: 'ffp',
              volume_ml: 220,
              storage_location: 'DeepFreezer-02',
              storage_min_temp_c: -40.0,
              storage_max_temp_c: -30.0,
              expires_at: new Date(Date.now() + 365 * 24 * 3600 * 1000).toISOString()
            }
          ]
        })
      });
      const compData = await compRes.json();
      assert(compRes.status === 201, 'POST /blood-bank/components returns 201');
      assert(compData.data.length === 2, '2 components created');
      assert(compData.data[0].status === 'quarantined', 'Components initially quarantined');
      prbcComponentId = compData.data[0].id;

      // GET /blood-bank/components
      const getCompRes = await fetch(`${baseUrl}/blood-bank/components?status=quarantined`);
      const getCompData = await getCompRes.json();
      assert(getCompData.data.length >= 2, 'GET /components retrieves quarantined inventory');
    }

    // ========================================================================
    // SUITE 5: DUAL GROUPING & MANDATORY 5 TTI SEROLOGY & SAFE RELEASE GATE
    // ========================================================================
    console.log('\n--- SUITE 5: Dual Grouping & TTI Safe-Release Gate API ---');
    {
      // 1. Dual Grouping Verification
      const groupRes = await fetch(`${baseUrl}/blood-bank/grouping-verifications`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          forward_anti_a: '0',
          forward_anti_b: '0',
          forward_anti_d: '4+',
          reverse_a_cells: '4+',
          reverse_b_cells: '4+',
          determined_abo_group: 'O',
          determined_rh_factor: 'positive',
          technician1_name: 'Tech Anirban Das',
          technician2_name: 'Tech Sourav Paul',
          technicians_concur: true
        })
      });
      const groupData = await groupRes.json();
      assert(groupRes.status === 201, 'POST /grouping-verifications recorded');
      assert(groupData.data.technicians_concur === true, 'Technicians concurred on group');

      // 2. Record 5 mandatory TTI tests: HIV, HBV, HCV, Syphilis, Malaria
      const ttiNames = ['hiv_1_2', 'hepatitis_b', 'hepatitis_c', 'syphilis', 'malaria'];
      for (const tti of ttiNames) {
        const ttiRes = await fetch(`${baseUrl}/blood-bank/serology-tests`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donation_id: donationId,
            test_name: tti,
            test_method: 'elisa',
            result: 'non_reactive',
            tested_by_name: 'Lab Tech S. Paul'
          })
        });
        assert(ttiRes.status === 201, `TTI test ${tti} recorded as non_reactive`);
      }

      // Check Serology Workbench
      const seroWorkRes = await fetch(`${baseUrl}/blood-bank/serology-workbench`);
      const seroWorkData = await seroWorkRes.json();
      assert(seroWorkRes.status === 200, 'GET /serology-workbench returns 200');
      const workbenchDonation = seroWorkData.data.find(d => d.donation_id === donationId);
      assert(workbenchDonation.tti_tests.length === 5, 'All 5 TTI tests present in workbench');

      // 3. Safe Release Authorization
      const releaseRes = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          release_decision: 'approved_for_release',
          all_tti_non_reactive: true,
          dual_grouping_verified: true,
          authorized_by_name: 'Dr. Meenakshi Sundaram (BBO)',
          notes: 'Safe release certified.'
        })
      });
      const releaseData = await releaseRes.json();
      assert(releaseRes.status === 201, 'Safe release authorization approved');
      assert(releaseData.data.release_decision === 'approved_for_release', 'Decision approved_for_release');

      // Verify PRBC component transitioned to safe_for_release
      const compCheckRes = await fetch(`${baseUrl}/blood-bank/components?status=safe_for_release`);
      const compCheckData = await compCheckRes.json();
      const releasedPrbc = compCheckData.data.find(c => c.id === prbcComponentId);
      assert(releasedPrbc !== undefined, 'PRBC component status transitioned to safe_for_release');
    }

    // ========================================================================
    // SUITE 6: REQUISITIONS, CROSSMATCHING & RESERVATIONS API
    // ========================================================================
    console.log('\n--- SUITE 6: Requisition, Crossmatch & Reservation API ---');
    let requisitionId;
    let crossmatchId;
    let reservationId;
    {
      // 1. Create Requisition
      const reqRes = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uhid: 'UHID-2026-TEST01',
          requested_component: 'prbc',
          units_requested: 1,
          urgency: 'urgent',
          clinical_indication: 'Pre-operative reserve for scheduled laparotomy',
          patient_blood_group: 'O',
          patient_rh_factor: 'positive',
          requester_name: 'Dr. Arindam Mitra'
        })
      });
      const reqData = await reqRes.json();
      assert(reqRes.status === 201, 'POST /requisitions returns 201');
      assert(reqData.data.requisition_number.startsWith('REQ-'), 'Requisition has REQ number');
      requisitionId = reqData.data.id;

      // 2. Perform Crossmatch (Compatible)
      const xmRes = await fetch(`${baseUrl}/blood-bank/crossmatches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          technique: 'gel_card',
          major_crossmatch: 'compatible',
          minor_crossmatch: 'compatible',
          compatibility_result: 'compatible',
          performed_by_name: 'Tech Anirban Das'
        })
      });
      const xmData = await xmRes.json();
      assert(xmRes.status === 201, 'Crossmatch recorded as compatible');
      crossmatchId = xmData.data.id;

      // 3. Reserve Component
      const reserveRes = await fetch(`${baseUrl}/blood-bank/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          crossmatch_id: crossmatchId,
          reserved_by_name: 'Dr. Meenakshi'
        })
      });
      const reserveData = await reserveRes.json();
      assert(reserveRes.status === 201, 'Reservation created successfully');
      assert(reserveData.data.status === 'active', 'Reservation status is active');
      reservationId = reserveData.data.id;

      // Verify Requisition units_reserved incremented
      const reqCheckRes = await fetch(`${baseUrl}/blood-bank/requisitions`);
      const reqCheckData = await reqCheckRes.json();
      const targetReq = reqCheckData.data.find(r => r.id === requisitionId);
      assert(targetReq.units_reserved === 1, 'Requisition units_reserved = 1');

      // 4. Test Reservation Cancellation & Idempotent Balance Restoration
      const cancelRes = await fetch(`${baseUrl}/blood-bank/reservations/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          reservation_id: reservationId,
          cancellation_reason: 'Surgery rescheduled, release back to general stock',
          cancelled_by_name: 'Dr. Meenakshi'
        })
      });
      assert(cancelRes.status === 200, 'Reservation cancelled successfully');

      // Verify Requisition units_reserved restored to 0
      const reqCheckAfterCancelRes = await fetch(`${baseUrl}/blood-bank/requisitions`);
      const reqCheckAfterCancelData = await reqCheckAfterCancelRes.json();
      const targetReqAfterCancel = reqCheckAfterCancelData.data.find(r => r.id === requisitionId);
      assert(targetReqAfterCancel.units_reserved === 0, 'Requisition units_reserved decremented to 0');

      // Re-reserve for issue testing
      const reReserveRes = await fetch(`${baseUrl}/blood-bank/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          crossmatch_id: crossmatchId,
          reserved_by_name: 'Dr. Meenakshi'
        })
      });
      const reReserveData = await reReserveRes.json();
      assert(reReserveRes.status === 201, 'Re-reserved component for issue test');
      reservationId = reReserveData.data.id;
    }

    // ========================================================================
    // SUITE 7: BLOOD ISSUE & SAFETY GATES ENFORCEMENT API
    // ========================================================================
    console.log('\n--- SUITE 7: Issue & Clinical Safety Gates Enforcement API ---');
    {
      // Safety Test 1: Routine issue without crossmatch MUST fail
      const badIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          is_emergency_unmatched: false,
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'OT Nurse'
          // Omitting crossmatch_id!
        })
      });
      assert(badIssueRes.status === 400, 'Routine issue without crossmatch rejected (400)');

      // Safety Test 2: Emergency uncrossed release on routine requisition MUST fail
      const badEmergencyRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId, // Urgency is 'urgent', NOT 'stat_emergency'
          component_id: prbcComponentId,
          is_emergency_unmatched: true,
          emergency_clinical_justification: 'Exsanguinating hemorrhage',
          emergency_authorized_by_name: 'Dr. Trauma Lead',
          issued_by_name: 'Dr. Meenakshi',
          verified_by_name: 'Tech Anirban Das',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(badEmergencyRes.status === 400, 'Emergency uncrossed release on non-stat requisition strictly blocked');

      // Valid Routine Issue: Compatible crossmatch + valid reservation
      const validIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          reservation_id: reservationId,
          crossmatch_id: crossmatchId,
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Staff Nurse R. Thomas (OT 2)',
          received_by_designation: 'Operating Theatre Nurse',
          transport_box_id: 'BOX-CTOT-04',
          transport_temperature_c: 4.2,
          cold_chain_maintained: true
        })
      });
      const validIssueData = await validIssueRes.json();
      assert(validIssueRes.status === 201, 'Routine compatible issue succeeds (201)');
      assert(validIssueData.data.issue_slip_number.startsWith('ISS-'), 'Issue slip generated');

      // Verify component status became 'issued'
      const compAfterIssueRes = await fetch(`${baseUrl}/blood-bank/components?status=issued`);
      const compAfterIssueData = await compAfterIssueRes.json();
      const issuedComp = compAfterIssueData.data.find(c => c.id === prbcComponentId);
      assert(issuedComp !== undefined, 'Component status marked as issued in inventory');

      // Verify requisition units_issued incremented
      const reqAfterIssueRes = await fetch(`${baseUrl}/blood-bank/requisitions`);
      const reqAfterIssueData = await reqAfterIssueRes.json();
      const targetReqAfterIssue = reqAfterIssueData.data.find(r => r.id === requisitionId);
      assert(targetReqAfterIssue.units_issued === 1, 'Requisition units_issued incremented to 1');
      assert(targetReqAfterIssue.status === 'fulfilled', 'Requisition status transitioned to fulfilled');
    }

    // ========================================================================
    // SUITE 8: IMMUTABLE AUDIT TRAIL API
    // ========================================================================
    console.log('\n--- SUITE 8: Immutable Audit Trail API ---');
    {
      const auditRes = await fetch(`${baseUrl}/blood-bank/audit-logs?component_id=${prbcComponentId}`);
      const auditData = await auditRes.json();
      console.log('Recorded action types:', auditData.data.map(l => l.action_type));
      const actionTypes = auditData.data.map(l => l.action_type.toLowerCase());
      assert(actionTypes.includes('component_issued'), 'Audit trail captured COMPONENT_ISSUED action');
      assert(actionTypes.includes('component_reserved'), 'Audit trail captured COMPONENT_RESERVED action');
      assert(actionTypes.includes('reservation_cancelled_released'), 'Audit trail captured RESERVATION_CANCELLED_RELEASED action');
      assert(actionTypes.includes('safe_release_approved'), 'Audit trail captured safe_release_approved action');
    }

    console.log('\n============================================================');
    console.log(`ALL INTEGRATION TESTS PASSED: ${passedTests}/${totalTests} checks verified!`);
    console.log('Tested against isolated disposable database: medicsprime_disposable_test');
    console.log('Zero modifications or connections made to medicsprime_hms_dev.');
    console.log('============================================================\n');

  } finally {
    if (server) {
      server.close();
    }
    await pool.end();
  }
}

runTests().catch((err) => {
  console.error('\nTEST SUITE FAILED:', err);
  process.exit(1);
});
