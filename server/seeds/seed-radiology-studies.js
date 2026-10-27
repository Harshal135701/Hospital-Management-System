const pool = require('../src/config/db');

async function seedRadiology() {
  try {
    console.log('[Seed] Seeding realistic radiology studies linked to existing patients & clinicians...');

    const patientsRes = await pool.query('SELECT id, uhid, full_name, gender, date_of_birth FROM patients ORDER BY created_at ASC LIMIT 6');
    const doctorsRes = await pool.query('SELECT id, full_name, employee_code, specialty FROM doctors ORDER BY id ASC LIMIT 5');

    if (patientsRes.rows.length === 0 || doctorsRes.rows.length === 0) {
      console.warn('[Seed] No existing patients or doctors found to link.');
      return;
    }

    const patients = patientsRes.rows;
    const doctors = doctorsRes.rows;
    const referringDoc = doctors[0];
    const radiologistDoc = doctors.length > 1 ? doctors[1] : doctors[0];

    const studiesData = [
      {
        accession_number: 'ACC-2026-XR001',
        patient_id: patients[0].id,
        modality_id: 'XR',
        study_description: 'Chest X-Ray (PA View Digital)',
        body_part: 'Thorax / Chest',
        clinical_indication: 'Persistent productive cough for 2 weeks, low-grade pyrexia. Rule out pneumonia or consolidation.',
        ordering_doctor_id: referringDoc.id,
        scheduled_at: new Date(Date.now() - 3600000 * 4),
        performed_at: new Date(Date.now() - 3600000 * 3),
        priority: 'routine',
        status: 'completed',
        technologist_name: 'Tech Rajesh Sharma',
        pacs_study_uid: '1.2.840.113619.2.55.3.2831172836.721',
        series_count: 1,
        instances_count: 2,
        is_demo: true,
        report: {
          technique: 'Single posteroanterior (PA) erect projection of the thoracic cavity obtained at 120 kVp, low-dose AEC technique.',
          findings: 'Lungs are well-expanded with normal bronchovascular markings. No focal airspace consolidation, pleural effusion, or pneumothorax is identified. Heart size and cardiothoracic ratio (CTR 0.46) are within normal limits. Mediastinal contours, hilar shadows, and both hemidiaphragms are normal with sharp costophrenic sulci. Visualized osseous structures of the rib cage and thoracic spine reveal no acute fracture or destructive lesion.',
          impression: 'No acute cardiopulmonary disease. Clear lung fields without focal consolidation or active pleuro-parenchymal lesion.',
          recommendations: 'Clinical correlation advised. If symptoms persist or fever spikes, consider repeat evaluation or HRCT thorax.',
          status: 'verified',
          critical_alert: false,
          verified_by: radiologistDoc.id,
          verified_at: new Date(Date.now() - 3600000 * 2),
          distributed_at: new Date(Date.now() - 3600000 * 1)
        }
      },
      {
        accession_number: 'ACC-2026-CT002',
        patient_id: patients[1 % patients.length].id,
        modality_id: 'CT',
        study_description: 'HRCT Thorax (Chest High Resolution)',
        body_part: 'Thorax / Pulmonary',
        clinical_indication: 'Suspected interstitial lung disease (ILD), dyspnea on exertion, bilateral basal crepitations.',
        ordering_doctor_id: referringDoc.id,
        scheduled_at: new Date(Date.now() - 3600000 * 2),
        performed_at: new Date(Date.now() - 3600000 * 1.5),
        priority: 'urgent',
        status: 'completed',
        technologist_name: 'Tech Sneha Nair',
        pacs_study_uid: '1.2.840.113619.2.55.3.9876543210.842',
        series_count: 3,
        instances_count: 184,
        is_demo: true,
        report: {
          technique: 'Thin-section (1.0 mm) volumetric helical CT scan of the thorax performed from lung apices to adrenal glands without intravenous contrast administration.',
          findings: 'Subpleural and basal predominant reticular opacities with architectural distortion and traction bronchiectasis noted in bilateral lower lobes. Mild peripheral ground-glass haze is seen. No definite honeycombing identified. No mediastinal or hilar lymphadenopathy. Pleural spaces are clear without effusion.',
          impression: 'Findings suggestive of early Usual Interstitial Pneumonia (UIP) / Non-Specific Interstitial Pneumonia (NSIP) pattern. No acute airspace infection or pulmonary embolism visible on non-contrast imaging.',
          recommendations: 'Pulmonary medicine consultation and serial pulmonary function tests (PFT / DLCO) recommended.',
          status: 'draft',
          critical_alert: false,
          verified_by: null,
          verified_at: null,
          distributed_at: null
        }
      },
      {
        accession_number: 'ACC-2026-MR003',
        patient_id: patients[2 % patients.length].id,
        modality_id: 'MRI',
        study_description: 'MRI Brain with Contrast (3.0T)',
        body_part: 'Neuro / Brain',
        clinical_indication: 'Severe acute onset thunderclap headache, episodic blurring of vision. Rule out acute intracranial lesion or vascular anomaly.',
        ordering_doctor_id: referringDoc.id,
        scheduled_at: new Date(Date.now() - 3600000 * 0.5),
        performed_at: null,
        priority: 'stat',
        status: 'in_progress',
        technologist_name: 'Tech Arun Kumar',
        pacs_study_uid: '1.2.840.113619.2.55.3.1122334455.901',
        series_count: 6,
        instances_count: 0,
        is_demo: true,
        report: null
      },
      {
        accession_number: 'ACC-2026-US004',
        patient_id: patients[3 % patients.length].id,
        modality_id: 'USG',
        study_description: 'USG Whole Abdomen & Pelvis',
        body_part: 'Abdomen & Pelvis',
        clinical_indication: 'Right upper quadrant post-prandial colic pain radiating to back. Rule out cholelithiasis or acute cholecystitis.',
        ordering_doctor_id: referringDoc.id,
        scheduled_at: new Date(Date.now() + 3600000 * 2),
        performed_at: null,
        priority: 'urgent',
        status: 'arrived',
        technologist_name: 'Sonographer Dr. Kavita V',
        pacs_study_uid: '1.2.840.113619.2.55.3.5544332211.312',
        series_count: 2,
        instances_count: 0,
        is_demo: true,
        report: null
      },
      {
        accession_number: 'ACC-2026-MG005',
        patient_id: patients[4 % patients.length].id,
        modality_id: 'MAMMO',
        study_description: 'Bilateral Digital Screening Mammography',
        body_part: 'Breast Bilateral',
        clinical_indication: 'Annual routine breast cancer screening. Age 52, family history of breast malignancy in maternal aunt.',
        ordering_doctor_id: referringDoc.id,
        scheduled_at: new Date(Date.now() + 3600000 * 5),
        performed_at: null,
        priority: 'routine',
        status: 'scheduled',
        technologist_name: 'Tech Preeti S',
        pacs_study_uid: '1.2.840.113619.2.55.3.6677889900.115',
        series_count: 4,
        instances_count: 0,
        is_demo: true,
        report: null
      }
    ];

    for (const item of studiesData) {
      const studyRes = await pool.query(
        `INSERT INTO radiology_studies (
          accession_number, patient_id, modality_id, study_description, body_part,
          clinical_indication, ordering_doctor_id, scheduled_at, performed_at, priority,
          status, technologist_name, pacs_study_uid, series_count, instances_count, is_demo
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        ON CONFLICT (accession_number) DO UPDATE SET
          status = EXCLUDED.status,
          performed_at = EXCLUDED.performed_at,
          scheduled_at = EXCLUDED.scheduled_at
        RETURNING id`,
        [
          item.accession_number,
          item.patient_id,
          item.modality_id,
          item.study_description,
          item.body_part,
          item.clinical_indication,
          item.ordering_doctor_id,
          item.scheduled_at,
          item.performed_at,
          item.priority,
          item.status,
          item.technologist_name,
          item.pacs_study_uid,
          item.series_count,
          item.instances_count,
          item.is_demo
        ]
      );

      const studyId = studyRes.rows[0].id;

      if (item.report) {
        await pool.query(
          `INSERT INTO radiology_reports (
            study_id, radiologist_id, technique, findings, impression, recommendations,
            status, verified_by, verified_at, distributed_at, critical_alert
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          ON CONFLICT (study_id) DO UPDATE SET
            findings = EXCLUDED.findings,
            impression = EXCLUDED.impression,
            status = EXCLUDED.status,
            verified_by = EXCLUDED.verified_by,
            verified_at = EXCLUDED.verified_at,
            distributed_at = EXCLUDED.distributed_at`,
          [
            studyId,
            radiologistDoc.id,
            item.report.technique,
            item.report.findings,
            item.report.impression,
            item.report.recommendations,
            item.report.status,
            item.report.verified_by,
            item.report.verified_at,
            item.report.distributed_at,
            item.report.critical_alert
          ]
        );
      }
    }

    console.log('[Seed] Radiology studies and structured reports successfully seeded!');
  } catch (err) {
    console.error('[Seed] Error seeding radiology studies:', err);
  } finally {
    process.exit(0);
  }
}

seedRadiology();
