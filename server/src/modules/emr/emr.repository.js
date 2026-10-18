const pool = require("../../config/db");

// 12.2 E-Prescription (Rx) Studio
async function createPrescription(data) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const {
      rx_number,
      patient_id,
      doctor_id,
      encounter_id,
      diagnosis_summary,
      notes,
      items = [],
    } = data;

    const rxRes = await client.query(
      `INSERT INTO emr_eprescriptions (
        rx_number,
        patient_id,
        doctor_id,
        encounter_id,
        diagnosis_summary,
        notes
      )
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *`,
      [
        rx_number,
        patient_id,
        doctor_id || null,
        encounter_id || null,
        diagnosis_summary || null,
        notes || null,
      ]
    );

    const rx = rxRes.rows[0];
    const insertedItems = [];

    for (const item of items) {
      const itemRes = await client.query(
        `INSERT INTO emr_prescription_items (
          prescription_id,
          medication_name,
          generic_name,
          dosage,
          route,
          frequency,
          duration_days,
          food_relation,
          instructions,
          quantity
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        RETURNING *`,
        [
          rx.id,
          item.medication_name,
          item.generic_name || null,
          item.dosage,
          item.route || "Oral",
          item.frequency,
          item.duration_days || 5,
          item.food_relation || "After Food",
          item.instructions || null,
          item.quantity || 1,
        ]
      );
      insertedItems.push(itemRes.rows[0]);
    }

    await client.query("COMMIT");
    rx.items = insertedItems;
    return rx;
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
}

async function getPrescriptions(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`ep.patient_id = $${values.length}`);
  }
  if (filters.doctor_id) {
    values.push(filters.doctor_id);
    conditions.push(`ep.doctor_id = $${values.length}`);
  }
  if (filters.is_dispensed !== undefined) {
    values.push(filters.is_dispensed === "true" || filters.is_dispensed === true);
    conditions.push(`ep.is_dispensed = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT 
      ep.*,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid,
      d.full_name AS doctor_name,
      COALESCE(
        json_agg(epi.*) FILTER (WHERE epi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM emr_eprescriptions ep
    JOIN patients p ON p.id = ep.patient_id
    LEFT JOIN doctors d ON d.id = ep.doctor_id
    LEFT JOIN emr_prescription_items epi ON epi.prescription_id = ep.id
    ${whereClause}
    GROUP BY ep.id, p.full_name, p.uhid, d.full_name
    ORDER BY ep.prescribed_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function getPrescriptionById(id) {
  const query = `
    SELECT 
      ep.*,
      p.full_name AS patient_name,
      p.uhid AS patient_uhid,
      d.full_name AS doctor_name,
      COALESCE(
        json_agg(epi.*) FILTER (WHERE epi.id IS NOT NULL),
        '[]'
      ) AS items
    FROM emr_eprescriptions ep
    JOIN patients p ON p.id = ep.patient_id
    LEFT JOIN doctors d ON d.id = ep.doctor_id
    LEFT JOIN emr_prescription_items epi ON epi.prescription_id = ep.id
    WHERE ep.id = $1
    GROUP BY ep.id, p.full_name, p.uhid, d.full_name
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0] || null;
}

async function markPrescriptionDispensed(id) {
  const result = await pool.query(
    `UPDATE emr_eprescriptions SET is_dispensed = true WHERE id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0] || null;
}

// 12.3 ICD-10 & SNOMED Diagnosis Coding
async function createDiagnosis(data) {
  const {
    patient_id,
    encounter_id,
    icd10_code,
    icd10_description,
    snomed_code,
    snomed_term,
    diagnosis_type = "provisional",
    onset_date,
    status = "active",
    recorded_by,
  } = data;

  const result = await pool.query(
    `INSERT INTO emr_diagnoses (
      patient_id,
      encounter_id,
      icd10_code,
      icd10_description,
      snomed_code,
      snomed_term,
      diagnosis_type,
      onset_date,
      status,
      recorded_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *`,
    [
      patient_id,
      encounter_id || null,
      icd10_code,
      icd10_description,
      snomed_code || null,
      snomed_term || null,
      diagnosis_type,
      onset_date || new Date(),
      status,
      recorded_by || null,
    ]
  );
  return result.rows[0];
}

async function getDiagnoses(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`ed.patient_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`ed.status = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `
    SELECT ed.*, d.full_name AS recorded_by_doctor
    FROM emr_diagnoses ed
    LEFT JOIN doctors d ON d.id = ed.recorded_by
    ${whereClause}
    ORDER BY ed.recorded_at DESC
  `;
  const result = await pool.query(query, values);
  return result.rows;
}

async function updateDiagnosisStatus(id, status) {
  const result = await pool.query(
    `UPDATE emr_diagnoses SET status = $2 WHERE id = $1 RETURNING *`,
    [id, status]
  );
  return result.rows[0] || null;
}

// 12.5 Clinical Document Attachments
async function createDocument(data) {
  const {
    patient_id,
    document_title,
    document_category,
    file_name,
    file_url,
    file_size_bytes,
    mime_type,
    uploaded_by,
    notes,
  } = data;

  const result = await pool.query(
    `INSERT INTO emr_document_attachments (
      patient_id,
      document_title,
      document_category,
      file_name,
      file_url,
      file_size_bytes,
      mime_type,
      uploaded_by,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *`,
    [
      patient_id,
      document_title,
      document_category,
      file_name,
      file_url,
      file_size_bytes || null,
      mime_type || null,
      uploaded_by || null,
      notes || null,
    ]
  );
  return result.rows[0];
}

async function getDocuments(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`patient_id = $${values.length}`);
  }
  if (filters.document_category) {
    values.push(filters.document_category);
    conditions.push(`document_category = $${values.length}`);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";
  const query = `SELECT * FROM emr_document_attachments ${whereClause} ORDER BY created_at DESC`;
  const result = await pool.query(query, values);
  return result.rows;
}

async function deleteDocument(id) {
  const result = await pool.query(`DELETE FROM emr_document_attachments WHERE id = $1 RETURNING *`, [id]);
  return result.rows[0] || null;
}

// 12.4 Previous Encounters Browser
async function getPreviousEncounters(patientId) {
  const [consultations, admissions, daycare, triage] = await Promise.all([
    pool.query(
      `SELECT ce.id, 'OPD Consultation' AS encounter_type, ce.started_at AS encounter_date, ce.status, d.full_name AS doctor_name, dep.name AS department_name
       FROM consultation_encounters ce
       JOIN doctors d ON d.id = ce.doctor_id
       LEFT JOIN departments dep ON dep.id = d.department_id
       WHERE ce.patient_id = $1
       ORDER BY ce.started_at DESC`,
      [patientId]
    ),
    pool.query(
      `SELECT a.id, 'IPD Admission' AS encounter_type, a.admission_date AS encounter_date, a.status, d.full_name AS doctor_name, dep.name AS department_name
       FROM admissions a
       LEFT JOIN doctors d ON d.id = a.attending_doctor_id
       LEFT JOIN departments dep ON dep.id = d.department_id
       WHERE a.patient_id = $1
       ORDER BY a.admission_date DESC`,
      [patientId]
    ),
    pool.query(
      `SELECT da.id, 'Day Care Procedure' AS encounter_type, da.created_at AS encounter_date, da.status, d.full_name AS doctor_name, da.procedure_name AS details
       FROM daycare_admissions da
       LEFT JOIN doctors d ON d.id = da.doctor_id
       WHERE da.patient_id = $1
       ORDER BY da.created_at DESC`,
      [patientId]
    ),
    pool.query(
      `SELECT et.id, 'Emergency / Triage' AS encounter_type, et.triaged_at AS encounter_date, 'completed' AS status, et.triaged_by AS doctor_name, et.chief_complaint AS details
       FROM emergency_triage et
       WHERE et.patient_id = $1
       ORDER BY et.triaged_at DESC`,
      [patientId]
    ),
  ]);

  const all = [
    ...consultations.rows,
    ...admissions.rows,
    ...daycare.rows,
    ...triage.rows,
  ].sort((a, b) => new Date(b.encounter_date) - new Date(a.encounter_date));

  return all;
}

// 12.1 Longitudinal Patient Lifetime Timeline
async function getPatientTimeline(patientId) {
  const encounters = await getPreviousEncounters(patientId);
  const [prescriptions, diagnoses, documents] = await Promise.all([
    pool.query(
      `SELECT id, 'Prescription' AS event_type, prescribed_at AS event_date, diagnosis_summary AS title, notes AS description
       FROM emr_eprescriptions WHERE patient_id = $1`,
      [patientId]
    ),
    pool.query(
      `SELECT id, 'Diagnosis' AS event_type, recorded_at AS event_date, icd10_code || ' - ' || icd10_description AS title, status AS description
       FROM emr_diagnoses WHERE patient_id = $1`,
      [patientId]
    ),
    pool.query(
      `SELECT id, 'Document Upload' AS event_type, created_at AS event_date, document_title AS title, document_category AS description
       FROM emr_document_attachments WHERE patient_id = $1`,
      [patientId]
    ),
  ]);

  const events = [
    ...encounters.map((e) => ({
      id: e.id,
      event_type: e.encounter_type,
      event_date: e.encounter_date,
      title: `${e.encounter_type}: ${e.status}`,
      description: e.doctor_name ? `Attending: ${e.doctor_name}` : (e.details || ""),
    })),
    ...prescriptions.rows,
    ...diagnoses.rows,
    ...documents.rows,
  ].sort((a, b) => new Date(b.event_date) - new Date(a.event_date));

  return events;
}

module.exports = {
  createPrescription,
  getPrescriptions,
  getPrescriptionById,
  markPrescriptionDispensed,
  createDiagnosis,
  getDiagnoses,
  updateDiagnosisStatus,
  createDocument,
  getDocuments,
  deleteDocument,
  getPreviousEncounters,
  getPatientTimeline,
};
