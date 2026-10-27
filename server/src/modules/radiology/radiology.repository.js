const pool = require('../../config/db');

async function getModalities(client = pool) {
  const result = await client.query(
    `SELECT * FROM radiology_modalities WHERE is_active = true ORDER BY id ASC`
  );
  return result.rows;
}

async function getStudies(filters = {}, client = pool) {
  let query = `
    SELECT
      s.id,
      s.accession_number,
      s.patient_id,
      p.uhid AS patient_uhid,
      p.full_name AS patient_name,
      p.gender AS patient_gender,
      p.date_of_birth AS patient_dob,
      p.mobile AS patient_mobile,
      s.encounter_id,
      s.order_id,
      s.modality_id,
      m.name AS modality_name,
      m.room_name AS modality_room,
      s.study_description,
      s.body_part,
      s.clinical_indication,
      s.ordering_doctor_id,
      d.full_name AS ordering_doctor_name,
      d.employee_code AS ordering_doctor_code,
      d.specialty AS ordering_doctor_specialty,
      s.scheduled_at,
      s.performed_at,
      s.priority,
      s.status,
      s.technologist_name,
      s.pacs_study_uid,
      s.series_count,
      s.instances_count,
      s.is_demo,
      s.created_at,
      r.id AS report_id,
      r.status AS report_status,
      r.findings AS report_findings,
      r.impression AS report_impression,
      r.critical_alert AS report_critical_alert,
      r.verified_at AS report_verified_at,
      rad.full_name AS radiologist_name
    FROM radiology_studies s
    JOIN patients p ON p.id = s.patient_id
    JOIN radiology_modalities m ON m.id = s.modality_id
    LEFT JOIN doctors d ON d.id = s.ordering_doctor_id
    LEFT JOIN radiology_reports r ON r.study_id = s.id
    LEFT JOIN doctors rad ON rad.id = r.radiologist_id
    WHERE 1=1
  `;
  const params = [];

  if (filters.patient_id) {
    params.push(filters.patient_id);
    query += ` AND s.patient_id = $${params.length}`;
  }

  if (filters.modality_id && filters.modality_id !== 'all') {
    params.push(filters.modality_id);
    query += ` AND s.modality_id = $${params.length}`;
  }

  if (filters.status && filters.status !== 'all') {
    params.push(filters.status);
    query += ` AND s.status = $${params.length}`;
  }

  if (filters.priority && filters.priority !== 'all') {
    params.push(filters.priority);
    query += ` AND s.priority = $${params.length}`;
  }

  if (filters.search) {
    params.push(`%${filters.search}%`);
    query += ` AND (
      s.accession_number ILIKE $${params.length}
      OR p.uhid ILIKE $${params.length}
      OR p.full_name ILIKE $${params.length}
      OR s.study_description ILIKE $${params.length}
      OR s.clinical_indication ILIKE $${params.length}
    )`;
  }

  query += ` ORDER BY s.scheduled_at DESC`;

  const result = await client.query(query, params);
  return result.rows;
}

async function getStudyById(id, client = pool) {
  const result = await client.query(
    `SELECT
      s.*,
      p.uhid AS patient_uhid,
      p.full_name AS patient_name,
      p.gender AS patient_gender,
      p.date_of_birth AS patient_dob,
      p.mobile AS patient_mobile,
      p.blood_group AS patient_blood_group,
      m.name AS modality_name,
      m.room_name AS modality_room,
      m.ae_title AS modality_ae_title,
      d.full_name AS ordering_doctor_name,
      d.employee_code AS ordering_doctor_code,
      d.specialty AS ordering_doctor_specialty
    FROM radiology_studies s
    JOIN patients p ON p.id = s.patient_id
    JOIN radiology_modalities m ON m.id = s.modality_id
    LEFT JOIN doctors d ON d.id = s.ordering_doctor_id
    WHERE s.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function createStudy(data, client = pool) {
  const {
    accession_number,
    patient_id,
    encounter_id,
    order_id,
    modality_id,
    study_description,
    body_part,
    clinical_indication,
    ordering_doctor_id,
    scheduled_at,
    priority,
    status,
    technologist_name,
    pacs_study_uid,
    series_count,
    instances_count,
    is_demo
  } = data;

  const result = await client.query(
    `INSERT INTO radiology_studies (
      accession_number, patient_id, encounter_id, order_id, modality_id,
      study_description, body_part, clinical_indication, ordering_doctor_id,
      scheduled_at, priority, status, technologist_name, pacs_study_uid,
      series_count, instances_count, is_demo, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, NOW(), NOW())
    RETURNING *`,
    [
      accession_number,
      patient_id,
      encounter_id || null,
      order_id || null,
      modality_id,
      study_description,
      body_part || 'General',
      clinical_indication || null,
      ordering_doctor_id || null,
      scheduled_at || new Date(),
      priority || 'routine',
      status || 'scheduled',
      technologist_name || null,
      pacs_study_uid || `1.2.840.113619.2.55.3.${Date.now()}`,
      series_count || 1,
      instances_count || 0,
      is_demo || false
    ]
  );
  return result.rows[0];
}

async function updateStudyStatus(id, updateData, client = pool) {
  const { status, performed_at, technologist_name } = updateData;
  const fields = ['status = $2', 'updated_at = NOW()'];
  const params = [id, status];

  if (performed_at !== undefined) {
    fields.push(`performed_at = $${params.length + 1}`);
    params.push(performed_at);
  }

  if (technologist_name !== undefined) {
    fields.push(`technologist_name = $${params.length + 1}`);
    params.push(technologist_name);
  }

  const result = await client.query(
    `UPDATE radiology_studies
     SET ${fields.join(', ')}
     WHERE id = $1
     RETURNING *`,
    params
  );
  return result.rows[0] || null;
}

async function getReportByStudyId(studyId, client = pool) {
  const result = await client.query(
    `SELECT
      r.*,
      doc.full_name AS radiologist_name,
      doc.employee_code AS radiologist_code,
      ver.full_name AS verified_by_name,
      ver.employee_code AS verified_by_code
    FROM radiology_reports r
    LEFT JOIN doctors doc ON doc.id = r.radiologist_id
    LEFT JOIN doctors ver ON ver.id = r.verified_by
    WHERE r.study_id = $1`,
    [studyId]
  );
  return result.rows[0] || null;
}

async function upsertReport(data, client = pool) {
  const {
    study_id,
    radiologist_id,
    technique,
    findings,
    impression,
    recommendations,
    status,
    critical_alert,
    critical_notes
  } = data;

  const result = await client.query(
    `INSERT INTO radiology_reports (
      study_id, radiologist_id, technique, findings, impression, recommendations,
      status, critical_alert, critical_notes, created_at, updated_at
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW(), NOW())
    ON CONFLICT (study_id) DO UPDATE SET
      radiologist_id = COALESCE(EXCLUDED.radiologist_id, radiology_reports.radiologist_id),
      technique = EXCLUDED.technique,
      findings = EXCLUDED.findings,
      impression = EXCLUDED.impression,
      recommendations = EXCLUDED.recommendations,
      status = EXCLUDED.status,
      critical_alert = EXCLUDED.critical_alert,
      critical_notes = EXCLUDED.critical_notes,
      updated_at = NOW()
    RETURNING *`,
    [
      study_id,
      radiologist_id || null,
      technique || '',
      findings || '',
      impression || '',
      recommendations || '',
      status || 'draft',
      Boolean(critical_alert),
      critical_notes || null
    ]
  );
  return result.rows[0];
}

async function verifyReport(id, verificationData, client = pool) {
  const { verified_by, verified_at } = verificationData;
  const result = await client.query(
    `UPDATE radiology_reports
     SET
       status = 'verified',
       verified_by = $2,
       verified_at = $3,
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, verified_by, verified_at || new Date()]
  );
  return result.rows[0] || null;
}

async function distributeReport(id, client = pool) {
  const result = await client.query(
    `UPDATE radiology_reports
     SET
       status = 'distributed',
       distributed_at = NOW(),
       updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

async function getPacsNodes(client = pool) {
  const result = await client.query(
    `SELECT * FROM pacs_nodes WHERE is_active = true ORDER BY id ASC`
  );
  return result.rows;
}

module.exports = {
  getModalities,
  getStudies,
  getStudyById,
  createStudy,
  updateStudyStatus,
  getReportByStudyId,
  upsertReport,
  verifyReport,
  distributeReport,
  getPacsNodes
};
