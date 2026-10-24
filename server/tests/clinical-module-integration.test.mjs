import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import pool from '../src/config/db.js';
import authUtils from '../src/modules/auth/auth.utils.js';
const { signJwt } = authUtils;

let server;
let baseUrl;

// Pre-generated JWT tokens for RBAC testing
const doctorUser = {
  account_id: '11111111-1111-1111-1111-111111111111',
  role: 'clinician_doctor',
  doctor_id: 'af969d93-aa0d-4871-ac5b-29f999c20677', // Dr. Arindam Mitra
  employee_code: 'EMP-DOC-01',
  full_name: 'Dr. Arindam Mitra',
  token_version: 1,
};
const doctorToken = signJwt(doctorUser);

const adminUser = {
  account_id: '22222222-2222-2222-2222-222222222222',
  role: 'super_admin',
  employee_code: 'EMP-ADM-01',
  full_name: 'IT System Admin',
  token_version: 1,
};
const adminToken = signJwt(adminUser);

const nurseUser = {
  account_id: '33333333-3333-3333-3333-333333333333',
  role: 'staff_nurse',
  employee_code: 'EMP-NUR-01',
  full_name: 'Nurse Staff',
  token_version: 1,
};
const nurseToken = signJwt(nurseUser);

const receptionistUser = {
  account_id: '44444444-4444-4444-4444-444444444444',
  role: 'receptionist',
  employee_code: 'EMP-REC-01',
  full_name: 'Alok Roy',
  token_version: 1,
};
const receptionistToken = signJwt(receptionistUser);

async function request(path, options = {}) {
  const url = `${baseUrl}${path}`;
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  const res = await fetch(url, {
    method: options.method || 'GET',
    headers,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  return { status: res.status, data };
}

test.before(async () => {
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });
});

test.after(async () => {
  if (server) await new Promise((resolve) => server.close(resolve));
  await pool.end();
  process.exit(0);
});

test('Clinical Module - 5 Sub-Modules Integration Suite', async (t) => {
  // Setup baseline patient, department, doctor and appointment
  const rand = Math.floor(Math.random() * 1000000);
  const deptRes = await pool.query(
    `INSERT INTO departments (name, code, description, is_active)
     VALUES ('Clinical Cardiology ' || $1, 'CARD-' || $1, 'Cardiology Services', true)
     RETURNING id`,
    [rand]
  );
  const departmentId = deptRes.rows[0].id;

  const docRes = await pool.query(
    `INSERT INTO doctors (employee_code, full_name, mobile, department_id, is_active)
     VALUES ('DOC-CLN-' || $1, 'Dr. Arindam Mitra', '9830009999', $2, true)
     RETURNING id`,
    [rand, departmentId]
  );
  const doctorId = docRes.rows[0].id;

  const patRes = await pool.query(
    `INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender, blood_group)
     VALUES ('UHID-CLN-' || $1, 'Eleanor Vance', '9830122410', '1988-04-12', 'Female', 'B+')
     RETURNING id`,
    [rand]
  );
  const patientId = patRes.rows[0].id;

  const aptRes = await pool.query(
    `INSERT INTO appointments (
       patient_id, doctor_id, department_id, appointment_number,
       appointment_date, start_time, end_time, status, notes
     )
     VALUES ($1, $2, $3, 'APT-CLN-' || $4, CURRENT_DATE, '10:00:00', '10:30:00', 'arrived', 'Chest tightness on exertion')
     RETURNING id`,
    [patientId, doctorId, departmentId, rand]
  );
  const appointmentId = aptRes.rows[0].id;

  let encounterId;

  // =========================================================================
  // SUB-MODULE 1: DOCTOR CONSULTATION DESK
  // =========================================================================
  await t.test('1.1 Start Consultation Encounter', async () => {
    const res = await request('/api/consultations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        appointment_id: appointmentId,
        patient_id: patientId,
        chief_complaint: 'Chest pain radiating to left arm',
        summary: 'Patient reports 2-week history of exertional angina.',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.ok(res.data.data.id);
    encounterId = res.data.data.id;

    // Verify appointment status was synced to in_consultation
    const checkApt = await pool.query(`SELECT status FROM appointments WHERE id = $1`, [appointmentId]);
    assert.equal(checkApt.rows[0].status, 'in_consultation');
  });

  await t.test('1.2 Idempotent Start Encounter returns existing encounter', async () => {
    const res = await request('/api/consultations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        appointment_id: appointmentId,
        patient_id: patientId,
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.data.id, encounterId);
  });

  await t.test('1.3 Retrieve Encounter By Appointment ID & Encounter ID', async () => {
    const res1 = await request(`/api/consultations/appointment/${appointmentId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(res1.status, 200);
    assert.equal(res1.data.data.id, encounterId);
    assert.equal(res1.data.data.patient_name, 'Eleanor Vance');

    const res2 = await request(`/api/consultations/${encounterId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(res2.status, 200);
    assert.equal(res2.data.data.id, encounterId);
  });

  await t.test('1.4 Save Consultation Draft (summary, examination, impression)', async () => {
    const res = await request(`/api/consultations/${encounterId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        summary: 'Updated clinical observations: stable hemodynamics.',
        examination: 'Regular rhythm, no murmurs. Clear lung bases.',
        impression: 'Suspected stable angina pectoris. Rule out coronary artery disease.',
        chief_complaint: 'Exertional retrosternal tightness with dyspnea',
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.impression, 'Suspected stable angina pectoris. Rule out coronary artery disease.');
  });

  // =========================================================================
  // SUB-MODULE 2: VITALS RECORDING & PHYSICAL EXAMINATION
  // =========================================================================
  await t.test('2.1 Record Vitals with Fahrenheit Conversion & BMI Calculation', async () => {
    const res = await request('/api/vitals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${nurseToken}` },
      body: {
        encounter_id: encounterId,
        systolic: 128,
        diastolic: 82,
        heartRate: 74,
        respiratoryRate: 16,
        temperature: 98.6,
        tempUnit: 'F',
        spo2: 98,
        height: 165,
        weight: 68.0,
        cvs: 'Normal S1, S2, no murmur',
        rs: 'Bilateral vesicular breath sounds',
        abdomen: 'Soft, non-tender, no organomegaly',
        cns: 'Conscious, oriented, GCS 15/15',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    const vitals = res.data.data;
    assert.equal(vitals.systolic_bp, 128);
    assert.equal(vitals.diastolic_bp, 82);
    assert.equal(vitals.pulse_rate, 74);
    assert.equal(Number(vitals.temperature_c), 37.0); // 98.6 F converts to 37.0 C
    assert.equal(Number(vitals.bmi), 25.0); // 68 / (1.65)^2 = 24.97 -> 25.0
    assert.equal(vitals.cvs, 'Normal S1, S2, no murmur');
  });

  await t.test('2.2 Reject Impossible / Malformed Vitals', async () => {
    // Systolic <= Diastolic
    const res1 = await request('/api/vitals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        encounter_id: encounterId,
        systolic: 80,
        diastolic: 120,
      },
    });
    assert.equal(res1.status, 400);

    // SpO2 > 100
    const res2 = await request('/api/vitals', {
      method: 'POST',
      headers: { Authorization: `Bearer ${doctorToken}` },
      body: {
        encounter_id: encounterId,
        spo2: 105,
      },
    });
    assert.equal(res2.status, 400);
  });

  await t.test('2.3 Retrieve Chronological Vitals and History', async () => {
    const resEncounter = await request(`/api/vitals/${encounterId}`, {
      headers: { Authorization: `Bearer ${nurseToken}` },
    });
    assert.equal(resEncounter.status, 200);
    assert.ok(resEncounter.data.data.length >= 1);

    const resPatient = await request(`/api/vitals/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${nurseToken}` },
    });
    assert.equal(resPatient.status, 200);
    assert.ok(resPatient.data.data.length >= 1);
  });

  // =========================================================================
  // SUB-MODULE 3: CHIEF COMPLAINTS & CLINICAL HISTORY
  // =========================================================================
  await t.test('3.1 Save Chief Complaints and Clinical History', async () => {
    const res = await request('/api/clinical-history', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        encounter_id: encounterId,
        presentingComplaint: 'Substernal chest tightness radiating to left arm when walking',
        onsetDuration: '2 weeks ago; episodes lasting 5-10 mins',
        severity: 'Moderate',
        aggravatingFactors: 'Physical exertion, climbing stairs, cold weather',
        relievingFactors: 'Complete rest, sublingual nitrates',
        medicalHistory: 'Hypertension (diagnosed 2021)',
        surgicalHistory: 'Appendectomy (2015)',
        currentMedications: 'Amlodipine 5mg OD, Aspirin 75mg OD',
        allergies: 'Penicillin (mild cutaneous hives)',
        familyHistory: 'Father had MI at age 54; Mother has Type 2 diabetes',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.severity, 'Moderate');
    assert.equal(res.data.data.past_surgical_history, 'Appendectomy (2015)');
    assert.equal(res.data.data.onset_duration, '2 weeks ago; episodes lasting 5-10 mins');
  });

  await t.test('3.2 Upsert & Retrieve Encounter Clinical History', async () => {
    // Update medical history
    const updateRes = await request(`/api/clinical-history/${encounterId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        medicalHistory: 'Hypertension (diagnosed 2021), Dyslipidemia',
      },
    });
    assert.equal(updateRes.status, 200);

    const getRes = await request(`/api/clinical-history/${encounterId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(getRes.status, 200);
    assert.equal(getRes.data.data.past_medical_history, 'Hypertension (diagnosed 2021), Dyslipidemia');
    assert.equal(getRes.data.data.allergy_history, 'Penicillin (mild cutaneous hives)');
  });

  await t.test('3.3 Retrieve Patient Clinical History across encounters', async () => {
    const res = await request(`/api/clinical-history/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.data.length >= 1);
  });

  // =========================================================================
  // SUB-MODULE 4: COMPUTERIZED PROVIDER ORDER ENTRY (CPOE)
  // =========================================================================
  let placedOrderId;

  await t.test('4.1 Retrieve Diagnostic Test Catalog', async () => {
    const res = await request('/api/provider-orders/catalog', {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(res.status, 200);
    assert.ok(res.data.data.length >= 10);
    const cbc = res.data.data.find((item) => item.code === 'HEM-CBC-01');
    assert.ok(cbc, 'CBC must exist in diagnostic catalog');
  });

  await t.test('4.2 Place Batch of Diagnostic Orders atomically in transaction', async () => {
    const res = await request('/api/provider-orders/batch', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        encounter_id: encounterId,
        priority: 'Urgent',
        indication: 'Evaluate exertional angina; rule out myocardial ischemia',
        instructions: 'Fasting lipid profile; immediate resting 12-lead ECG',
        orders: [
          {
            testId: 't-cbc',
            testCode: 'HEM-CBC-01',
            testName: 'Complete Blood Count (CBC)',
            category: 'Hematology',
            department: 'Hematology Lab',
          },
          {
            testId: 't-lipid',
            testCode: 'BIO-LIP-03',
            testName: 'Lipid Profile (Fasting)',
            category: 'Biochemistry',
            department: 'Clinical Biochemistry',
          },
          {
            testId: 't-ecg',
            testCode: 'CAR-ECG-01',
            testName: '12-Lead Electrocardiogram (ECG)',
            category: 'Cardiology',
            department: 'Cardiology Diagnostics',
          },
        ],
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.count, 3);
    placedOrderId = res.data.data[0].id;
  });

  await t.test('4.3 Retrieve Encounter Orders & Update Status / Cancel', async () => {
    const listRes = await request(`/api/provider-orders/encounter/${encounterId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(listRes.status, 200);
    assert.equal(listRes.data.data.length, 3);

    // Cancel first order
    const cancelRes = await request(`/api/provider-orders/${placedOrderId}/cancel`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(cancelRes.status, 200);
    assert.equal(cancelRes.data.data.status, 'cancelled');
  });

  // =========================================================================
  // SUB-MODULE 5: CLINICAL PROGRESS NOTES
  // =========================================================================
  let draftNoteId;

  await t.test('5.1 Save SOAP Draft Progress Note (Partial fields)', async () => {
    const res = await request('/api/clinical-notes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        encounter_id: encounterId,
        note_type: 'progress',
        status: 'draft',
        subjective: 'Patient feels slightly better after sublingual nitrate trial.',
        objective: 'Resting BP 122/80, HR 72, normal respiratory effort.',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.data.status, 'draft');
    draftNoteId = res.data.data.id;
  });

  await t.test('5.2 Reject Finalizing Progress Note without Assessment or Plan', async () => {
    const res = await request('/api/clinical-notes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        encounter_id: encounterId,
        note_type: 'progress',
        status: 'finalized',
        subjective: 'Exam notes only.',
      },
    });
    assert.equal(res.status, 400);
  });

  await t.test('5.3 Finalize & Sign Clinical Progress Note', async () => {
    const res = await request('/api/clinical-notes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        encounter_id: encounterId,
        note_type: 'progress',
        status: 'finalized',
        subjective: 'Exertional chest tightness improved with rest.',
        objective: 'BP 128/82, HR 74, clear breath sounds, normal S1/S2.',
        assessment: 'Suspected stable coronary artery disease (Class II angina).',
        plan: 'Start Aspirin 75mg OD, Atorvastatin 20mg OD, Metoprolol Succinate 25mg OD. Schedule TMT in 1 week.',
        follow_up_instructions: 'Return immediately if chest pain worsens or lasts > 15 mins.',
      },
    });

    assert.equal(res.status, 201);
    assert.equal(res.data.data.status, 'finalized');
    assert.ok(res.data.data.signed_at);
  });

  await t.test('5.4 Retrieve Chronological Encounter & Patient Notes', async () => {
    const encNotes = await request(`/api/clinical-notes/encounter/${encounterId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(encNotes.status, 200);
    assert.equal(encNotes.data.data.length, 2); // 1 draft + 1 finalized

    const patNotes = await request(`/api/clinical-notes/patient/${patientId}`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(patNotes.status, 200);
    assert.ok(patNotes.data.data.length >= 2);
  });

  // =========================================================================
  // COMPLETE CONSULTATION WORKFLOW
  // =========================================================================
  await t.test('1.5 Complete Consultation Encounter & Sync Appointment Status', async () => {
    const res = await request(`/api/consultations/${encounterId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
      body: {
        impression: 'Stable Angina Pectoris; medical therapy initiated.',
      },
    });

    assert.equal(res.status, 200);
    assert.equal(res.data.success, true);
    assert.equal(res.data.data.status, 'completed');
    assert.ok(res.data.data.completed_at);

    // Verify appointment status was synced to completed
    const checkApt = await pool.query(`SELECT status FROM appointments WHERE id = $1`, [appointmentId]);
    assert.equal(checkApt.rows[0].status, 'completed');
  });

  await t.test('1.6 Prevent Duplicate Completion of Consultation', async () => {
    const res = await request(`/api/consultations/${encounterId}/complete`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    assert.equal(res.status, 409);
  });

  // =========================================================================
  // RBAC & SECURITY VERIFICATION
  // =========================================================================
  await t.test('6.1 Receptionist Cannot Author Clinical Notes or Orders', async () => {
    const noteRes = await request('/api/clinical-notes', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receptionistToken}` },
      body: {
        encounter_id: encounterId,
        assessment: 'Unauthorized attempt',
        plan: 'Should fail',
      },
    });
    assert.equal(noteRes.status, 403);

    const orderRes = await request('/api/provider-orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${receptionistToken}` },
      body: {
        encounter_id: encounterId,
        order_name: 'CBC',
      },
    });
    assert.equal(orderRes.status, 403);
  });

  await t.test('6.2 Patient Clinical Summary Aggregates All Encounters', async () => {
    const res = await request(`/api/consultations/patient/${patientId}/clinical-summary`, {
      headers: { Authorization: `Bearer ${doctorToken}` },
    });
    assert.equal(res.status, 200);
    assert.equal(res.data.data.patient.full_name, 'Eleanor Vance');
    assert.ok(res.data.data.encounters.length >= 1);
    assert.ok(res.data.data.vitals_history.length >= 1);
    assert.ok(res.data.data.clinical_history.length >= 1);
    assert.ok(res.data.data.orders.length >= 1);
    assert.ok(res.data.data.progress_notes.length >= 1);
  });
});
