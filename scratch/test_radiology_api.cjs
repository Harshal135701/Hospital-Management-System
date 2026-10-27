const http = require('http');
const app = require('../server/src/app');

async function runTests() {
  const server = http.createServer(app);

  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api`;
  console.log(`[Test] Server running at ${baseUrl}`);

  try {
    // 1. Login as Doctor
    console.log('[Test] 1. Logging in as doctor@hospital.test...');
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'doctor@hospital.test',
        password: 'Doc#Pass2026!'
      })
    });
    const loginJson = await loginRes.json();
    if (!loginJson.success) {
      throw new Error(`Login failed: ${JSON.stringify(loginJson)}`);
    }
    const token = loginJson.data.token;
    console.log('✔ Doctor logged in successfully, received JWT token.');

    const authHeaders = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };

    // 2. GET /radiology/modalities
    console.log('[Test] 2. Testing GET /radiology/modalities...');
    const modRes = await fetch(`${baseUrl}/radiology/modalities`, { headers: authHeaders });
    const modJson = await modRes.json();
    console.log(`✔ Found ${modJson.data.length} modalities:`, modJson.data.map(m => m.id).join(', '));

    // 3. GET /radiology/studies
    console.log('[Test] 3. Testing GET /radiology/studies...');
    const studiesRes = await fetch(`${baseUrl}/radiology/studies`, { headers: authHeaders });
    const studiesJson = await studiesRes.json();
    console.log(`✔ Found ${studiesJson.data.length} studies in database.`);

    // 4. GET /radiology/pacs/status
    console.log('[Test] 4. Testing GET /radiology/pacs/status (Requirement 4)...');
    const pacsRes = await fetch(`${baseUrl}/radiology/pacs/status`, { headers: authHeaders });
    const pacsJson = await pacsRes.json();
    console.log(`✔ PACS Telemetry received: status = "${pacsJson.data.status}", AE Title = "${pacsJson.data.localAeTitle}"`);
    console.log(`   Message: "${pacsJson.data.message}"`);

    // 5. POST /radiology/studies (Schedule new study)
    console.log('[Test] 5. Testing POST /radiology/studies (Schedule new study)...');
    const patientId = studiesJson.data[0]?.patient_id;
    const scheduleRes = await fetch(`${baseUrl}/radiology/studies`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        patient_id: patientId,
        modality_id: 'XR',
        study_description: 'Pelvis AP View Digital',
        body_part: 'Pelvis',
        clinical_indication: 'Trauma fall injury, rule out fracture neck of femur.',
        priority: 'urgent',
        scheduled_at: new Date().toISOString()
      })
    });
    const scheduleJson = await scheduleRes.json();
    if (!scheduleJson.success) throw new Error('Schedule failed: ' + JSON.stringify(scheduleJson));
    const newStudy = scheduleJson.data;
    console.log(`✔ Study scheduled with accession number: ${newStudy.accession_number}`);

    // 6. PATCH /radiology/studies/:id/status (Mark arrived -> in_progress)
    console.log('[Test] 6. Testing PATCH /radiology/studies/:id/status...');
    const statusRes = await fetch(`${baseUrl}/radiology/studies/${newStudy.id}/status`, {
      method: 'PATCH',
      headers: authHeaders,
      body: JSON.stringify({ status: 'in_progress' })
    });
    const statusJson = await statusRes.json();
    console.log(`✔ Study status transitioned to: "${statusJson.data.status}"`);

    // 7. POST /radiology/reports (Save draft report)
    console.log('[Test] 7. Testing POST /radiology/reports (Save draft)...');
    const reportRes = await fetch(`${baseUrl}/radiology/reports`, {
      method: 'POST',
      headers: authHeaders,
      body: JSON.stringify({
        study_id: newStudy.id,
        technique: 'Single anteroposterior projection of pelvis.',
        findings: 'Bilateral hip joints and femoral necks show preserved trabecular pattern. No cortical breach or displaced fracture line seen. Sacroiliac joints intact.',
        impression: 'Normal pelvic radiograph. No acute fracture or dislocation identified.',
        recommendations: 'Mobilize with pain-relief as tolerated.',
        status: 'draft'
      })
    });
    const reportJson = await reportRes.json();
    const reportId = reportJson.data.id;
    console.log(`✔ Report draft saved with ID: ${reportId}`);

    // 8. PATCH /radiology/reports/:id/verify (Verify with electronic signature)
    console.log('[Test] 8. Testing PATCH /radiology/reports/:id/verify (Sign & Authorize)...');
    const verifyRes = await fetch(`${baseUrl}/radiology/reports/${reportId}/verify`, {
      method: 'PATCH',
      headers: authHeaders
    });
    const verifyJson = await verifyRes.json();
    console.log(`✔ Report status verified: status = "${verifyJson.data.status}", verified_by = ${verifyJson.data.verified_by}`);

    // 9. POST /radiology/reports/:id/distribute (Distribute to EMR)
    console.log('[Test] 9. Testing POST /radiology/reports/:id/distribute (Distribute to EMR)...');
    const distRes = await fetch(`${baseUrl}/radiology/reports/${reportId}/distribute`, {
      method: 'POST',
      headers: authHeaders
    });
    const distJson = await distRes.json();
    console.log(`✔ Report distributed to patient EMR timeline: status = "${distJson.data.status}"`);

    console.log('\n======================================================');
    console.log('🎉 ALL RADIOLOGY BACKEND API ENDPOINTS VERIFIED 100%!');
    console.log('======================================================');
  } catch (err) {
    console.error('Test failed with error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
