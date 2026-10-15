const pool = require("../../config/db");

async function createPreauthorization(data) {
  const {
    patient_id,
    appointment_id,
    insurance_provider,
    tpa_name,
    policy_number,
    requested_amount,
    clinical_justification,
  } = data;

  const result = await pool.query(
    `INSERT INTO insurance_preauthorizations (
      patient_id,
      appointment_id,
      insurance_provider,
      tpa_name,
      policy_number,
      requested_amount,
      clinical_justification
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *`,
    [
      patient_id,
      appointment_id ?? null,
      insurance_provider,
      tpa_name ?? null,
      policy_number,
      requested_amount,
      clinical_justification,
    ]
  );

  return result.rows[0];
}

async function getPreauthorizationById(id) {
  const result = await pool.query(
    `SELECT *
     FROM insurance_preauthorizations
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function getPreauthorizations(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.patient_id) {
    values.push(filters.patient_id);
    conditions.push(`patient_id = $${values.length}`);
  }

  if (filters.status) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  const whereClause = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT *
     FROM insurance_preauthorizations
     ${whereClause}
     ORDER BY created_at DESC`,
    values
  );

  return result.rows;
}

async function updatePreauthorizationDecision(
  id,
  status,
  approved_amount,
  rejection_reason
) {
  const result = await pool.query(
    `UPDATE insurance_preauthorizations
     SET status = $2,
         approved_amount = $3,
         rejection_reason = $4,
         decision_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, approved_amount, rejection_reason]
  );

  return result.rows[0] || null;
}

async function markPreauthorizationSubmitted(id) {
  const result = await pool.query(
    `UPDATE insurance_preauthorizations
     SET status = 'submitted',
         submitted_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  createPreauthorization,
  getPreauthorizationById,
  getPreauthorizations,
  updatePreauthorizationDecision,
  markPreauthorizationSubmitted,
};