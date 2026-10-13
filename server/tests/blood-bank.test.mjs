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
    let deferredScreeningIdForTest;
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

      // Boundary Test 1: Hemoglobin strict sub-threshold 12.4 g/dL
      const hb124Res = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 50.0,
          hemoglobin_g_dl: 12.4, // Strict sub-threshold
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const hb124Data = await hb124Res.json();
      assert(hb124Data.data.eligibility_status === 'temporarily_deferred', 'Hb = 12.4 g/dL boundary correctly deferred');

      // Boundary Test 2: Weight strict sub-threshold 44.5 kg
      const wt445Res = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 44.5, // Strict sub-threshold
          hemoglobin_g_dl: 13.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const wt445Data = await wt445Res.json();
      assert(wt445Data.data.eligibility_status === 'temporarily_deferred', 'Weight = 44.5 kg boundary correctly deferred');

      // Boundary Test 3: Exact minimum thresholds Hb = 12.5 and Weight = 45.0 approved
      const boundaryPassRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 45.0,
          hemoglobin_g_dl: 12.5,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 70,
          consent_obtained: true,
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const boundaryPassData = await boundaryPassRes.json();
      assert(boundaryPassData.data.eligibility_status === 'approved', 'Hb = 12.5 g/dL and Wt = 45.0 kg exact boundary approved');

      // Questionnaire Test: Recent illness causes temporary deferral
      const illnessRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 60.0,
          hemoglobin_g_dl: 14.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          questionnaire_answers: { recent_illness: true },
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const illnessData = await illnessRes.json();
      assert(illnessData.data.eligibility_status === 'temporarily_deferred', 'Questionnaire recent_illness causes temporary deferral');

      // Questionnaire Test: High risk exposure causes permanent deferral
      const highRiskRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 60.0,
          hemoglobin_g_dl: 14.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: true,
          questionnaire_answers: { high_risk_behavior: true },
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const highRiskData = await highRiskRes.json();
      assert(highRiskData.data.eligibility_status === 'permanently_deferred', 'Questionnaire high_risk_behavior causes permanent deferral');
      const donorAfterHighRiskRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterHighRisk = await donorAfterHighRiskRes.json();
      assert(donorAfterHighRisk.data.donor_status === 'permanently_deferred', 'Donor status updated to permanently_deferred in master registry');

      // Consent Test: Missing consent rejected
      const noConsentRes = await fetch(`${baseUrl}/blood-bank/screenings`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          weight_kg: 60.0,
          hemoglobin_g_dl: 14.0,
          blood_pressure_systolic: 120,
          blood_pressure_diastolic: 80,
          pulse_bpm: 72,
          consent_obtained: false, // Refused consent!
          eligibility_status: 'approved',
          reviewed_by_name: 'Dr. Meenakshi'
        })
      });
      const noConsentData = await noConsentRes.json();
      assert(noConsentData.data.eligibility_status === 'rejected', 'Missing consent auto-rejects screening');
      deferredScreeningIdForTest = noConsentData.data.id;

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
      // Safety Test 1: Blood collection on deferred/rejected screening strictly blocked
      const badCollectionRes = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          screening_id: deferredScreeningIdForTest,
          primary_bag_barcode: 'BB-REJECTED-001',
          volume_ml: 450,
          bag_type: 'triple',
          collection_type: 'voluntary',
          phlebotomist_name: 'Nurse Savitri Devi'
        })
      });
      assert(badCollectionRes.status === 400, 'Collection from non-approved screening rejected (400)');

      // Valid Primary Collection
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

      // Safety Test 2: Duplicate primary bag barcode strictly blocked (409 Conflict)
      const dupColRes = await fetch(`${baseUrl}/blood-bank/donations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donor_id: donorId,
          screening_id: validScreeningId,
          primary_bag_barcode: bagBarcode, // DUPLICATE!
          volume_ml: 450,
          bag_type: 'triple',
          collection_type: 'voluntary',
          phlebotomist_name: 'Nurse Savitri Devi'
        })
      });
      assert(dupColRes.status === 409, 'Duplicate primary bag barcode rejected (409 Conflict)');

      // Requirement 5.2 & 5.4 Verification: Automatic Pilot Sample Tubes Created
      const donDetailsRes = await fetch(`${baseUrl}/blood-bank/donations`);
      const donDetails = await donDetailsRes.json();
      const targetDon = donDetails.data.find(d => d.id === donationId);
      assert(Array.isArray(targetDon.pilot_samples), 'Donation contains pilot_samples array');
      assert(targetDon.pilot_samples.length === 3, 'Exactly 3 pilot sample tubes generated (-EDTA, -CLOT, -NAT)');
      const tubeTypes = targetDon.pilot_samples.map(s => s.tube_type);
      assert(tubeTypes.includes('edta') && tubeTypes.includes('plain_clot') && tubeTypes.includes('nat'), 'All required tube types (edta, plain_clot, nat) recorded');

      // Requirement 5.2: Verification of All Bag Types (single, double, quadruple)
      for (const bType of ['single', 'double', 'quadruple']) {
        const testBagBarcode = `BB-TYPE-${bType.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`;
        const testBagRes = await fetch(`${baseUrl}/blood-bank/donations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            donor_id: donorId,
            screening_id: validScreeningId,
            primary_bag_barcode: testBagBarcode,
            volume_ml: bType === 'single' ? 350 : 450,
            bag_type: bType,
            phlebotomist_name: 'Nurse Savitri Devi'
          })
        });
        assert(testBagRes.status === 201, `Collection with bag configuration '${bType}' successfully created`);
      }

      // Verify donor donations count incremented
      const donorAfterColRes = await fetch(`${baseUrl}/blood-bank/donors/${donorId}`);
      const donorAfterCol = await donorAfterColRes.json();
      assert(donorAfterCol.data.total_donations === 4, 'Donor total_donations incremented to 4');
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

      // Safety Test 1: Safe release authorization without dual grouping verification strictly rejected (400)
      const badRelease1 = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          release_decision: 'approved_for_release',
          all_tti_non_reactive: true,
          dual_grouping_verified: false, // Incomplete!
          authorized_by_name: 'Dr. Meenakshi Sundaram (BBO)',
          notes: 'Attempted premature release'
        })
      });
      assert(badRelease1.status === 400, 'Safe release without dual grouping verification strictly rejected (400)');

      // Safety Test 2: Safe release authorization with reactive TTI strictly rejected (400)
      const badRelease2 = await fetch(`${baseUrl}/blood-bank/release-authorizations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donation_id: donationId,
          release_decision: 'approved_for_release',
          all_tti_non_reactive: false, // Reactive infection!
          dual_grouping_verified: true,
          authorized_by_name: 'Dr. Meenakshi Sundaram (BBO)',
          notes: 'Attempted release with reactive TTI'
        })
      });
      assert(badRelease2.status === 400, 'Safe release with reactive/untested TTI strictly rejected (400)');

      // 3. Valid Safe Release Authorization
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
    let expiredXmId;
    let winningRequisitionId;
    {
      // Safety Test 1: Requisition for non-existent patient strictly blocked (404)
      const badReqRes = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uhid: 'UHID-NONEXISTENT-9999',
          requested_component: 'prbc',
          units_requested: 1,
          urgency: 'routine',
          clinical_indication: 'Invalid requisition check',
          patient_blood_group: 'O',
          patient_rh_factor: 'positive',
          requester_name: 'Dr. Ghost'
        })
      });
      assert(badReqRes.status === 404, 'Requisition with non-existent patient UHID rejected (404)');

      // 1. Create Valid Requisition
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

      // Safety Test 2: Incompatible crossmatch cannot be reserved
      const incompatibleXmRes = await fetch(`${baseUrl}/blood-bank/crossmatches`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          technique: 'gel_card',
          major_crossmatch: 'incompatible',
          minor_crossmatch: 'compatible',
          compatibility_result: 'incompatible',
          performed_by_name: 'Tech Anirban Das'
        })
      });
      const incompatibleXmData = await incompatibleXmRes.json();
      assert(incompatibleXmRes.status === 201, 'Incompatible crossmatch recorded in lab');

      const badReserveXmRes = await fetch(`${baseUrl}/blood-bank/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          crossmatch_id: incompatibleXmData.data.id,
          reserved_by_name: 'Dr. Meenakshi'
        })
      });
      assert(badReserveXmRes.status === 400, 'Reservation using incompatible crossmatch strictly rejected (400)');

      // Safety Test 3: Expired crossmatch cannot be reserved
      const expiredXmClient = await pool.connect();
      try {
        const expXmRes = await expiredXmClient.query(
          `INSERT INTO blood_crossmatches (
            requisition_id, patient_id, component_id, technique,
            major_crossmatch, compatibility_result, performed_by_name,
            tested_at
          ) VALUES ($1, (SELECT patient_id FROM blood_requisitions WHERE id = $1), $2, 'gel_card',
            'compatible', 'compatible', 'Tech S. Paul', NOW() - INTERVAL '5 days')
          RETURNING id`,
          [requisitionId, prbcComponentId]
        );
        expiredXmId = expXmRes.rows[0].id;
      } finally {
        expiredXmClient.release();
      }

      const expiredReserveRes = await fetch(`${baseUrl}/blood-bank/reservations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: requisitionId,
          component_id: prbcComponentId,
          crossmatch_id: expiredXmId,
          reserved_by_name: 'Dr. Meenakshi'
        })
      });
      assert(expiredReserveRes.status === 400, 'Reservation using expired crossmatch strictly rejected (400)');

      // 2. Perform Valid Compatible Crossmatch
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

      // 5. Concurrency Race Test: Two simultaneous reservation requests for the same available component unit
      // Create second requisition
      const req2Res = await fetch(`${baseUrl}/blood-bank/requisitions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patient_uhid: 'UHID-2026-TEST01',
          requested_component: 'prbc',
          units_requested: 1,
          urgency: 'routine',
          clinical_indication: 'Concurrent reservation race test',
          patient_blood_group: 'O',
          patient_rh_factor: 'positive',
          requester_name: 'Dr. Subhash Bose'
        })
      });
      const req2Data = await req2Res.json();
      assert(req2Res.status === 201, 'Second requisition created for concurrency test');
      const req2Id = req2Data.data.id;

      // Parallel reservation attempts for prbcComponentId
      const [race1, race2] = await Promise.all([
        fetch(`${baseUrl}/blood-bank/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requisition_id: requisitionId,
            component_id: prbcComponentId,
            crossmatch_id: crossmatchId,
            reserved_by_name: 'Dr. Worker 1'
          })
        }),
        fetch(`${baseUrl}/blood-bank/reservations`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requisition_id: req2Id,
            component_id: prbcComponentId,
            crossmatch_id: crossmatchId,
            reserved_by_name: 'Dr. Worker 2'
          })
        })
      ]);

      const raceStatuses = [race1.status, race2.status];
      assert(raceStatuses.includes(201), 'Concurrency race: exactly one reservation succeeds (201)');
      assert(raceStatuses.includes(409), 'Concurrency race: the colliding reservation receives 409 Conflict');

      // Ensure reservationId points to the winning reservation for downstream issue testing
      const winData = race1.status === 201 ? await race1.json() : await race2.json();
      reservationId = winData.data.id;
      winningRequisitionId = race1.status === 201 ? requisitionId : req2Id;
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
          requisition_id: winningRequisitionId,
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
          requisition_id: winningRequisitionId, // Urgency is 'urgent' or 'routine', NOT 'stat_emergency'
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

      // Safety Test 3: Routine issue with expired crossmatch MUST fail
      const badExpiredIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: winningRequisitionId,
          component_id: prbcComponentId,
          reservation_id: reservationId,
          crossmatch_id: expiredXmId, // Expired!
          is_emergency_unmatched: false,
          issued_by_name: 'Tech Anirban Das',
          verified_by_name: 'Tech Sourav Paul',
          received_by_name: 'Nurse Savitri',
          received_by_designation: 'Staff Nurse'
        })
      });
      assert(badExpiredIssueRes.status === 400, 'Routine issue with expired crossmatch strictly rejected (400)');

      // Valid Routine Issue: Compatible crossmatch + valid reservation
      const validIssueRes = await fetch(`${baseUrl}/blood-bank/issues`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          requisition_id: winningRequisitionId,
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
      const targetReqAfterIssue = reqAfterIssueData.data.find(r => r.id === winningRequisitionId);
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
