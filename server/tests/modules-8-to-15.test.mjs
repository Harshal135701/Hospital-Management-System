import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import app from '../src/app.js';
import pool from '../src/config/db.js';

let server;
let baseUrl;

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

test('Modules 8.1 - 15.5 End-to-End Suite', async (t) => {
  // Setup baseline patient, department, doctor for foreign keys
  const deptRes = await pool.query(
    `INSERT INTO departments (name, code, description, is_active)
     VALUES ('Dept ' || floor(random()*10000000), 'GMS-' || floor(random()*100000), 'Core medical department', true)
     RETURNING id`
  );
  const departmentId = deptRes.rows[0].id;

  const docRes = await pool.query(
    `INSERT INTO doctors (employee_code, full_name, mobile, department_id, is_active)
     VALUES ('DOC-' || floor(random()*10000), 'Dr. Alexander Fleming', '9876543210', $1, true)
     RETURNING id`,
    [departmentId]
  );
  const doctorId = docRes.rows[0].id;

  const patRes = await pool.query(
    `INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender)
     VALUES ('UHID-' || floor(random()*100000), 'John Doe', '9123456789', '1985-06-15', 'Male')
     RETURNING id`
  );
  const patientId = patRes.rows[0].id;

  // -------------------------------------------------------------
  // MODULE 15: Hospital Enterprise Master Data
  // -------------------------------------------------------------
  let hospitalId;
  let branchId;
  let clinicId;
  let serviceId;
  let corporateTariffId;

  await t.test('15.1 Hospital & Branch Master', async () => {
    const hospRes = await request('/api/enterprise/hospitals', {
      method: 'POST',
      body: {
        code: `HOSP-${Date.now()}`,
        name: 'Apollo Lifeline Hospital',
        city: 'Mumbai',
        email: 'info@apollo.example.com',
      },
    });
    assert.equal(hospRes.status, 201);
    hospitalId = hospRes.data.data.id;

    const branchRes = await request(`/api/enterprise/hospitals/${hospitalId}/branches`, {
      method: 'POST',
      body: {
        branch_code: `BR-${Date.now()}`,
        branch_name: 'Metro City Branch',
        city: 'Mumbai',
        state: 'Maharashtra',
        is_headquarters: true,
      },
    });
    assert.equal(branchRes.status, 201);
    branchId = branchRes.data.data.id;

    const listRes = await request('/api/enterprise/hospitals');
    assert.equal(listRes.status, 200);
    assert.ok(listRes.data.data.length > 0);
  });

  await t.test('15.2 Department & Clinic Hierarchy', async () => {
    const clinicRes = await request('/api/enterprise/clinics', {
      method: 'POST',
      body: {
        branch_id: branchId,
        department_id: departmentId,
        clinic_name: 'Day Care & Minor Surgery Suite',
        floor_wing: '2nd Floor, Wing B',
        head_doctor_id: doctorId,
        clinic_type: 'DayCare',
      },
    });
    assert.equal(clinicRes.status, 201);
    clinicId = clinicRes.data.data.id;

    const hierRes = await request('/api/enterprise/hierarchy');
    assert.equal(hierRes.status, 200);
    assert.ok(hierRes.data.data.clinics.length > 0);
  });

  await t.test('15.3 Doctor & Consultant Master', async () => {
    const docCreateRes = await request('/api/enterprise/doctors', {
      method: 'POST',
      body: {
        employee_code: `DOC-${Date.now()}`,
        full_name: 'Dr. Gregory House',
        mobile: '9888877777',
        department_id: departmentId,
        is_active: true,
      },
    });
    assert.equal(docCreateRes.status, 201);
    const newDocId = docCreateRes.data.data.id;

    const getDocRes = await request(`/api/enterprise/doctors/${newDocId}`);
    assert.equal(getDocRes.status, 200);
    assert.equal(getDocRes.data.data.full_name, 'Dr. Gregory House');
  });

  await t.test('15.4 Service Catalog & Tariff Master', async () => {
    const srvRes = await request('/api/enterprise/services', {
      method: 'POST',
      body: {
        service_code: `SRV-${Date.now()}`,
        service_name: 'Day Care Endoscopy & Biopsy',
        category: 'DayCare',
        standard_rate: 15000,
        tax_percent: 5,
      },
    });
    assert.equal(srvRes.status, 201);
    serviceId = srvRes.data.data.id;

    const listRes = await request('/api/enterprise/services');
    assert.equal(listRes.status, 200);
    assert.ok(listRes.data.data.some((s) => s.id === serviceId));
  });

  await t.test('15.5 Corporate Tariff Rate Contracts', async () => {
    const corpRes = await request('/api/enterprise/corporate-tariffs', {
      method: 'POST',
      body: {
        corporate_name: 'Star Health Allied Insurance',
        policy_code: 'STAR-CORP-001',
        service_id: serviceId,
        agreed_rate: 12000,
        discount_percent: 20,
        end_date: '2028-12-31',
      },
    });
    assert.equal(corpRes.status, 201);
    corporateTariffId = corpRes.data.data.id;

    const listRes = await request('/api/enterprise/corporate-tariffs');
    assert.equal(listRes.status, 200);
    assert.ok(listRes.data.data.some((c) => c.id === corporateTariffId));
  });

  // -------------------------------------------------------------
  // MODULE 8: Day Care / Ambulatory Surgery
  // -------------------------------------------------------------
  let chairId;
  let daycareAdmissionId;

  await t.test('8.1 & 8.2 Day Care Chair & Admission', async () => {
    const chairRes = await request('/api/daycare/chairs', {
      method: 'POST',
      body: {
        code: `CHR-${Date.now()}`,
        name: 'Recliner Pod A1',
        type: 'chair',
        zone: 'Ambulatory Pod A',
        status: 'available',
      },
    });
    assert.equal(chairRes.status, 201);
    chairId = chairRes.data.data.id;

    const admRes = await request('/api/daycare/admissions', {
      method: 'POST',
      body: {
        patient_id: patientId,
        doctor_id: doctorId,
        chair_id: chairId,
        procedure_name: 'Cataract Phacoemulsification',
        procedure_date: new Date().toISOString().split('T')[0],
        planned_duration_minutes: 60,
        pre_op_instructions: 'NPO 6 hours prior, pupil dilation eye drops',
        status: 'admitted',
      },
    });
    assert.equal(admRes.status, 201);
    daycareAdmissionId = admRes.data.data.id;
    assert.equal(admRes.data.data.status, 'admitted');
  });

  await t.test('8.3 Clinical Procedure Monitoring', async () => {
    const monRes = await request(`/api/daycare/admissions/${daycareAdmissionId}/monitoring`, {
      method: 'POST',
      body: {
        pulse_rate: 74,
        systolic_bp: 120,
        diastolic_bp: 80,
        oxygen_saturation: 99.0,
        respiratory_rate: 16,
        anesthesia_type: 'Local Topical',
        sedation_score: 'Aldrete 10',
        surgical_checklist_signed: true,
        notes: 'Procedure commenced without complication.',
        recorded_by: doctorId,
      },
    });
    assert.equal(monRes.status, 201);

    const getMonRes = await request(`/api/daycare/admissions/${daycareAdmissionId}/monitoring`);
    assert.equal(getMonRes.status, 200);
    assert.equal(getMonRes.data.data.length, 1);
  });

  await t.test('8.4 Same-Day Discharge Summary', async () => {
    const dischRes = await request(`/api/daycare/admissions/${daycareAdmissionId}/discharge`, {
      method: 'POST',
      body: {
        aldrete_score: 10,
        padss_score: 10,
        vitals_stable: true,
        post_op_instructions: 'Wear eye shield at night. Do not rub eyes.',
        medications_prescribed: [{ drug: 'Moxifloxacin Eye Drops', dose: '1 drop 4 times daily' }],
        follow_up_date: '2026-10-25',
        emergency_contact_advice: 'Call hospital immediately if severe pain or vision loss occurs.',
        authorized_by: doctorId,
      },
    });
    assert.equal(dischRes.status, 201);

    const getAdmRes = await request(`/api/daycare/admissions/${daycareAdmissionId}`);
    assert.equal(getAdmRes.status, 200);
    assert.equal(getAdmRes.data.data.status, 'discharged');
  });

  // -------------------------------------------------------------
  // MODULE 9: Dietary & Kitchen Management
  // -------------------------------------------------------------
  let dietOrderId;
  let kitchenBatchId;

  await t.test('9.1 Dietitian Nutritional Assessment', async () => {
    const assessRes = await request('/api/dietary/assessments', {
      method: 'POST',
      body: {
        patient_id: patientId,
        bmi: 24.2,
        height_cm: 175,
        weight_kg: 74,
        dietary_restrictions: 'Vegetarian',
        food_allergies: 'Peanuts',
        calorie_target_kcal: 2000,
        diet_type: 'diabetic',
        clinical_notes: 'Moderate carbohydrate, high fiber meal plan',
        assessed_by: 'Dietitian Sarah Connor',
      },
    });
    assert.equal(assessRes.status, 201);
  });

  await t.test('9.2 Patient Diet Ordering', async () => {
    const orderRes = await request('/api/dietary/orders', {
      method: 'POST',
      body: {
        patient_id: patientId,
        ward_bed: 'Day Care Pod A1',
        meal_type: 'lunch',
        diet_category: 'diabetic',
        special_instructions: 'Low salt, diabetic diet dessert replacement',
        status: 'ordered',
      },
    });
    assert.equal(orderRes.status, 201);
    dietOrderId = orderRes.data.data.id;
  });

  await t.test('9.3 Kitchen Meal Batch Production', async () => {
    const batchRes = await request('/api/dietary/batches', {
      method: 'POST',
      body: {
        meal_type: 'lunch',
        total_portions: 45,
        diet_categories: ['diabetic', 'regular', 'renal'],
        kitchen_shift: 'morning',
        status: 'ready',
        quality_notes: 'Temperature tested at 72C, hygiene standards passed',
      },
    });
    assert.equal(batchRes.status, 201);
    kitchenBatchId = batchRes.data.data.id;
  });

  await t.test('9.4 Ward Meal Delivery Tracking', async () => {
    const deliveryRes = await request('/api/dietary/deliveries', {
      method: 'POST',
      body: {
        order_id: dietOrderId,
        batch_id: kitchenBatchId,
        delivered_by: 'Staff Jack',
        received_by: 'Nurse Linda',
        meal_temperature_c: 65.5,
        delivery_status: 'delivered',
        remarks: 'Delivered warm on time',
      },
    });
    assert.equal(deliveryRes.status, 201);

    const listRes = await request('/api/dietary/deliveries');
    assert.equal(listRes.status, 200);
    assert.ok(listRes.data.data.length > 0);
  });

  // -------------------------------------------------------------
  // MODULE 10: IVF / ART (Assisted Reproductive Technology)
  // -------------------------------------------------------------
  let ivfCycleId;
  let embryoId;

  await t.test('10.1 Oocyte Retrieval (OPU)', async () => {
    const cycleRes = await request('/api/ivf/cycles', {
      method: 'POST',
      body: {
        patient_id: patientId,
        partner_name: 'Jane Doe',
        cycle_type: 'self',
        start_date: '2026-10-01',
      },
    });
    assert.equal(cycleRes.status, 201);
    ivfCycleId = cycleRes.data.data.id;

    const opuRes = await request(`/api/ivf/cycles/${ivfCycleId}/opu`, {
      method: 'POST',
      body: {
        follicles_aspirated: 14,
        oocytes_retrieved: 12,
        mii_count: 10,
        mi_count: 1,
        gv_count: 1,
        physician_id: doctorId,
        embryologist_name: 'Dr. Robert Edwards',
        notes: 'Good quality cumulus-oocyte complexes retrieved',
      },
    });
    assert.equal(opuRes.status, 201);
  });

  await t.test('10.2 Fertilization Conventional / ICSI', async () => {
    const fertRes = await request(`/api/ivf/cycles/${ivfCycleId}/fertilization`, {
      method: 'POST',
      body: {
        fertilization_method: 'ICSI',
        sperm_sample_id: 'SP-9921',
        oocytes_inseminated: 10,
        normal_2pn_count: 8,
        abnormal_1pn_count: 1,
        abnormal_multipn_count: 0,
        unfertilized_count: 1,
        embryologist_name: 'Dr. Robert Edwards',
        remarks: '80% 2PN fertilization rate achieved',
      },
    });
    assert.equal(fertRes.status, 201);
  });

  await t.test('10.3 Embryo Morphological Grading', async () => {
    const embRes = await request(`/api/ivf/cycles/${ivfCycleId}/embryos`, {
      method: 'POST',
      body: {
        embryo_code: 'E1-Day5',
        day_number: 5,
        cell_count: 100,
        fragmentation_percent: 5.0,
        gardner_grade: '4AA',
        status: 'viable',
        biopsy_taken: false,
        notes: 'Expanded blastocyst with excellent inner cell mass',
      },
    });
    assert.equal(embRes.status, 201);
    embryoId = embRes.data.data.id;
  });

  await t.test('10.4 Embryo Transfer (ET) Protocol', async () => {
    const etRes = await request(`/api/ivf/cycles/${ivfCycleId}/transfer`, {
      method: 'POST',
      body: {
        transfer_type: 'fresh',
        embryos_transferred_count: 1,
        catheter_type: 'Cook Echotip Soft',
        ultrasound_guided: true,
        endometrium_thickness_mm: 9.8,
        physician_id: doctorId,
        luteal_phase_regimen: 'Progesterone 400mg vaginally twice daily',
        pregnancy_test_date: '2026-11-01',
      },
    });
    assert.equal(etRes.status, 201);
  });

  await t.test('10.5 Embryo Cryostorage Management', async () => {
    const cryoRes = await request(`/api/ivf/embryos/${embryoId}/cryostore`, {
      method: 'POST',
      body: {
        tank_id: 'Tank-1',
        canister_id: 'Canister-B',
        goblet_color: 'Blue',
        cane_number: 'C-04',
        straw_number: 'ST-019',
        media_used: 'Kitazato Vitrification Media',
        freeze_date: '2026-10-18',
        consent_expiry_date: '2031-10-18',
        notes: 'Vitrified safely',
      },
    });
    assert.equal(cryoRes.status, 201);

    const listCryo = await request('/api/ivf/cryostorage');
    assert.equal(listCryo.status, 200);
    assert.ok(listCryo.data.data.some((c) => c.embryo_id === embryoId));
  });

  // -------------------------------------------------------------
  // MODULE 11: Emergency Department & Trauma
  // -------------------------------------------------------------
  let triageId;
  let bayId;

  await t.test('11.1 Triage Assessment (Level 1 to 4)', async () => {
    const triageRes = await request('/api/emergency/triage', {
      method: 'POST',
      body: {
        patient_id: patientId,
        triage_level: 2,
        chief_complaint: 'Acute chest pain radiating to left arm with diaphoresis',
        arrival_mode: 'ambulance',
        gcs_score: 15,
        pulse_rate: 105,
        systolic_bp: 145,
        diastolic_bp: 95,
        respiratory_rate: 22,
        oxygen_saturation: 96.0,
        temperature_c: 37.1,
        pain_score: 8,
        triaged_by: 'Nurse Jennifer',
      },
    });
    assert.equal(triageRes.status, 201);
    triageId = triageRes.data.data.id;
  });

  await t.test('11.2 Medico-Legal Case (MLC) Registry', async () => {
    const mlcRes = await request('/api/emergency/mlc', {
      method: 'POST',
      body: {
        patient_id: patientId,
        police_station: 'Central Police Station',
        officer_name: 'Sub-Inspector Kumar',
        officer_badge_no: 'POL-8842',
        case_type: 'RTA',
        injury_details: 'Blunt thoracic trauma following vehicular collision',
        alcohol_suspected: false,
        fit_for_statement: true,
        certificate_issued: true,
        registered_by: 'Staff Officer Smith',
      },
    });
    assert.equal(mlcRes.status, 201);
  });

  await t.test('11.3 Emergency Bay & Bed Allocation', async () => {
    const bayRes = await request('/api/emergency/bays', {
      method: 'POST',
      body: {
        code: `BAY-${Date.now()}`,
        zone: 'Red_Resus',
        bay_number: 'Resus Bay 1',
        status: 'available',
      },
    });
    assert.equal(bayRes.status, 201);
    bayId = bayRes.data.data.id;

    const allocRes = await request(`/api/emergency/triage/${triageId}/allocate-bay`, {
      method: 'POST',
      body: { bay_id: bayId, allocated_by: 'Dr. House' },
    });
    assert.equal(allocRes.status, 200);
  });

  await t.test('11.4 Trauma Clinical Charting', async () => {
    const traumaRes = await request(`/api/emergency/triage/${triageId}/trauma-chart`, {
      method: 'POST',
      body: {
        airway_status: 'Patent and clear',
        breathing_status: 'Bilateral air entry equal, tachypneic',
        circulation_status: 'Peripheral pulses palpable, BP 145/95',
        disability_neuro: 'GCS 15/15, Pupils equal and reactive to light',
        exposure_findings: 'Contusion on anterior chest wall, no deformity',
        fast_scan_findings: 'FAST Negative for pericardial and peritoneal free fluid',
        revised_trauma_score: 7.84,
        attending_doctor_id: doctorId,
        notes: 'Immediate ECG and cardiac enzymes ordered',
      },
    });
    assert.equal(traumaRes.status, 201);
  });

  await t.test('11.5 Rapid Disposition (ICU/OT/Ward/Discharge)', async () => {
    const dispRes = await request(`/api/emergency/triage/${triageId}/disposition`, {
      method: 'POST',
      body: {
        disposition_type: 'ICU',
        target_unit: 'Coronary Care Unit (CCU Bed 4)',
        clinician_id: doctorId,
        handover_summary: 'Acute Coronary Syndrome STEMI alert activated. Shifted directly to CCU.',
        follow_up_instructions: 'Continuous telemetry, prepare for emergency PCI.',
      },
    });
    assert.equal(dispRes.status, 201);
  });

  // -------------------------------------------------------------
  // MODULE 12: EMR & Clinical Records
  // -------------------------------------------------------------
  let prescriptionId;

  await t.test('12.2 E-Prescription (Rx) Studio', async () => {
    const rxRes = await request('/api/emr/prescriptions', {
      method: 'POST',
      body: {
        patient_id: patientId,
        doctor_id: doctorId,
        diagnosis_summary: 'Acute Coronary Syndrome & Hypertension',
        notes: 'Strict compliance required',
        items: [
          {
            medication_name: 'Aspirin Gastro-resistant',
            generic_name: 'Acetylsalicylic Acid',
            dosage: '75mg',
            route: 'Oral',
            frequency: 'OD',
            duration_days: 30,
            food_relation: 'After Food',
            quantity: 30,
          },
          {
            medication_name: 'Atorvastatin',
            generic_name: 'Atorvastatin Calcium',
            dosage: '40mg',
            route: 'Oral',
            frequency: 'OD',
            duration_days: 30,
            food_relation: 'Night',
            quantity: 30,
          },
        ],
      },
    });
    assert.equal(rxRes.status, 201);
    prescriptionId = rxRes.data.data.id;
    assert.equal(rxRes.data.data.items.length, 2);

    const dispenseRes = await request(`/api/emr/prescriptions/${prescriptionId}/dispense`, {
      method: 'PATCH',
    });
    assert.equal(dispenseRes.status, 200);
  });

  await t.test('12.3 ICD-10 & SNOMED Diagnosis Coding', async () => {
    const diagRes = await request('/api/emr/diagnoses', {
      method: 'POST',
      body: {
        patient_id: patientId,
        icd10_code: 'I21.0',
        icd10_description: 'Acute transmural myocardial infarction of anterior wall',
        snomed_code: '54329005',
        snomed_term: 'Anterior myocardial infarction',
        diagnosis_type: 'primary',
        status: 'active',
        recorded_by: doctorId,
      },
    });
    assert.equal(diagRes.status, 201);
  });

  await t.test('12.5 Clinical Document Attachments', async () => {
    const docAttachRes = await request('/api/emr/documents', {
      method: 'POST',
      body: {
        patient_id: patientId,
        document_title: '12-Lead Electrocardiogram Trace',
        document_category: 'Cardiology',
        file_name: 'ecg_trace_oct18.pdf',
        file_url: 'https://storage.hospital.example.com/ecg_trace_oct18.pdf',
        mime_type: 'application/pdf',
        uploaded_by: 'Staff Tech',
      },
    });
    assert.equal(docAttachRes.status, 201);
  });

  await t.test('12.1 Longitudinal Timeline & 12.4 Encounters Browser', async () => {
    const encRes = await request(`/api/emr/encounters/${patientId}`);
    assert.equal(encRes.status, 200);
    assert.ok(encRes.data.data.length > 0);

    const timeRes = await request(`/api/emr/timeline/${patientId}`);
    assert.equal(timeRes.status, 200);
    assert.ok(timeRes.data.data.length > 0);
  });

  // -------------------------------------------------------------
  // MODULE 13: Hospital Financials & Accounts
  // -------------------------------------------------------------
  let bankAccountId;
  let revenueAccountId;

  await t.test('13.1 Chart of Accounts & General Ledger', async () => {
    const bankAcc = await request('/api/finance/accounts', {
      method: 'POST',
      body: {
        account_code: `1010-${Date.now()}`,
        account_name: 'HDFC Main Operations Bank Account',
        account_type: 'Asset',
      },
    });
    assert.equal(bankAcc.status, 201);
    bankAccountId = bankAcc.data.data.id;

    const revAcc = await request('/api/finance/accounts', {
      method: 'POST',
      body: {
        account_code: `4010-${Date.now()}`,
        account_name: 'OPD & Surgical Revenue Account',
        account_type: 'Revenue',
      },
    });
    assert.equal(revAcc.status, 201);
    revenueAccountId = revAcc.data.data.id;

    const jeRes = await request('/api/finance/journal-entries', {
      method: 'POST',
      body: {
        entry_date: '2026-10-18',
        narration: 'Receipt of consultation and procedure fees',
        total_amount: 50000,
        lines: [
          { account_id: bankAccountId, debit: 50000, credit: 0, line_narration: 'Funds received in bank' },
          { account_id: revenueAccountId, debit: 0, credit: 50000, line_narration: 'Recognized revenue' },
        ],
      },
    });
    assert.equal(jeRes.status, 201);
  });

  await t.test('13.2 Debit / Credit Payment Vouchers', async () => {
    const vouchRes = await request('/api/finance/vouchers', {
      method: 'POST',
      body: {
        voucher_type: 'Receipt',
        payee_name: 'John Doe',
        payment_mode: 'bank',
        amount: 25000,
        account_id: bankAccountId,
        reference_document: 'RCPT-10029',
        status: 'approved',
      },
    });
    assert.equal(vouchRes.status, 201);
  });

  await t.test('13.3 Doctor Payout & Revenue Share Calculation', async () => {
    const payoutRes = await request('/api/finance/doctor-payouts/calculate', {
      method: 'POST',
      body: {
        doctor_id: doctorId,
        period_start: '2026-10-01',
        period_end: '2026-10-15',
        opd_consultation_revenue: 100000,
        opd_share_percent: 70,
        ipd_surgery_revenue: 200000,
        ipd_share_percent: 60,
        diagnostic_revenue: 50000,
        diagnostic_share_percent: 10,
        tds_deduction: 19500,
      },
    });
    assert.equal(payoutRes.status, 201);
    assert.ok(payoutRes.data.data.net_payout > 0);
  });

  await t.test('13.4 Bank Reconciliation', async () => {
    const brRes = await request('/api/finance/bank-reconciliations', {
      method: 'POST',
      body: {
        bank_account_id: bankAccountId,
        statement_date: '2026-10-18',
        statement_balance: 50000,
        ledger_balance: 50000,
        matched_items_count: 5,
        reconciled_by: 'Chief Accountant',
      },
    });
    assert.equal(brRes.status, 201);
    assert.equal(brRes.data.data.status, 'reconciled');
  });

  await t.test('13.5 Profit & Loss / Balance Sheet Reporting', async () => {
    const plRes = await request('/api/finance/reports/profit-and-loss');
    assert.equal(plRes.status, 200);
    assert.ok(plRes.data.data.totalRevenue !== undefined);

    const bsRes = await request('/api/finance/reports/balance-sheet');
    assert.equal(bsRes.status, 200);
    assert.ok(bsRes.data.data.totalAssets !== undefined);
  });

  // -------------------------------------------------------------
  // MODULE 14: Biomedical & Hospital Asset Management
  // -------------------------------------------------------------
  let assetId;

  await t.test('14.1 Asset Master & Barcode Tagging', async () => {
    const assetRes = await request('/api/assets', {
      method: 'POST',
      body: {
        asset_name: 'GE Healthcare Vivid E95 Ultrasound System',
        category: 'Diagnostic',
        department_id: departmentId,
        location_room: 'Echocardiography Lab 1',
        manufacturer: 'GE Healthcare',
        model_number: 'Vivid E95',
        purchase_date: '2024-01-15',
        purchase_cost: 4500000,
        warranty_expiry_date: '2027-01-15',
        status: 'in_service',
      },
    });
    assert.equal(assetRes.status, 201);
    assetId = assetRes.data.data.id;
  });

  await t.test('14.2 AMC / CMC Service Contracts & Warranties', async () => {
    const contractRes = await request(`/api/assets/${assetId}/contracts`, {
      method: 'POST',
      body: {
        contract_type: 'CMC',
        vendor_name: 'GE Medical Systems India Pvt Ltd',
        vendor_contact: '+91-80-4999-1000',
        start_date: '2025-01-01',
        end_date: '2027-12-31',
        contract_value: 350000,
        coverage_details: 'Includes probes, hardware repairs, software updates, 24/7 hotline',
        renewal_alert_days: 45,
      },
    });
    assert.equal(contractRes.status, 201);
  });

  await t.test('14.3 Preventive Maintenance (PM) Scheduling', async () => {
    const pmRes = await request(`/api/assets/${assetId}/pm-schedules`, {
      method: 'POST',
      body: {
        task_title: 'Quarterly Probe Calibration & Electrical Safety Check',
        frequency: 'quarterly',
        next_due_date: '2026-11-15',
        checklist_criteria: ['Visual inspection', 'Acoustic output check', 'Ground continuity test'],
        assigned_engineer: 'Biomedical Engineer Alex',
      },
    });
    assert.equal(pmRes.status, 201);
  });

  await t.test('14.4 Breakdown Reporting & Work Ticket', async () => {
    const ticketRes = await request(`/api/assets/${assetId}/breakdown-tickets`, {
      method: 'POST',
      body: {
        reported_by: 'Cardiac Sonographer Maya',
        priority: 'high',
        issue_description: 'Transducer probe cable connector loose, intermittent image artifact',
      },
    });
    assert.equal(ticketRes.status, 201);
    const ticketId = ticketRes.data.data.id;

    const resolveRes = await request(`/api/assets/breakdown-tickets/${ticketId}`, {
      method: 'PATCH',
      body: {
        status: 'resolved',
        root_cause: 'Loose locking pin on connector socket',
        action_taken: 'Pin realigned and secured; acoustic testing verified normal',
        repair_cost: 2500,
      },
    });
    assert.equal(resolveRes.status, 200);
  });

  await t.test('14.5 Asset Depreciation Calculation', async () => {
    const depRes = await request(`/api/assets/${assetId}/depreciation/calculate`, {
      method: 'POST',
      body: {
        method: 'SLM',
        useful_life_years: 7,
        salvage_value: 200000,
      },
    });
    assert.equal(depRes.status, 201);
    assert.ok(depRes.data.data.current_book_value > 0);
  });
});
