const pool = require("../../config/db");

async function createEnhancementRequest(data) {
  const {
    preauthorization_id,
    previous_approved_amount,
    requested_additional_amount,
    revised_requested_amount,
    reason,
    supporting_details,
  } = data;

  const result = await pool.query(
    `INSERT INTO insurance_enhancement_requests (
      preauthorization_id,
      previous_approved_amount,
      requested_additional_amount,
      revised_requested_amount,
      reason,
      supporting_details
    )
    VALUES ($1, $2, $3, $4, $5, $6)
    RETURNING *`,
    [
      preauthorization_id,
      previous_approved_amount,
      requested_additional_amount,
      revised_requested_amount,
      reason,
      JSON.stringify(supporting_details ?? {}),
    ]
  );

  return result.rows[0];
}

async function getEnhancementRequestById(id) {
  const result = await pool.query(
    `SELECT *
     FROM insurance_enhancement_requests
     WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function getEnhancementRequests(filters = {}) {
  const conditions = [];
  const values = [];

  if (filters.preauthorization_id) {
    values.push(filters.preauthorization_id);
    conditions.push(`preauthorization_id = $${values.length}`);
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
     FROM insurance_enhancement_requests
     ${whereClause}
     ORDER BY created_at DESC`,
    values
  );

  return result.rows;
}

async function updateEnhancementStatus(
  id,
  status,
  approved_additional_amount,
  rejection_reason
) {
  const result = await pool.query(
    `UPDATE insurance_enhancement_requests
     SET status = $2,
         approved_additional_amount = $3,
         rejection_reason = $4,
         decision_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, approved_additional_amount, rejection_reason]
  );

  return result.rows[0] || null;
}

async function markEnhancementSubmitted(id) {
  const result = await pool.query(
    `UPDATE insurance_enhancement_requests
     SET status = 'submitted',
         submitted_at = NOW(),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );

  return result.rows[0] || null;
}

async function updatePreauthorizationApprovedAmount(id, approvedAmount) {
  const result = await pool.query(
    `UPDATE insurance_preauthorizations
     SET approved_amount = $2,
         status = 'approved',
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, approvedAmount]
  );

  return result.rows[0] || null;
}

module.exports = {
  createEnhancementRequest,
  getEnhancementRequestById,
  getEnhancementRequests,
  updateEnhancementStatus,
  markEnhancementSubmitted,
  updatePreauthorizationApprovedAmount,
};