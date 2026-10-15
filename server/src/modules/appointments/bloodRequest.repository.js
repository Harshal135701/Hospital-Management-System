
const pool = require("../../config/db");

async function createBloodRequest(data) {
  const {
    patient_id,
    appointment_id,
    requested_by_doctor_id,
    blood_group,
    component_type,
    units_requested,
    urgency,
    clinical_indication,
    required_by,
    notes,
  } = data;

  const query = `
    INSERT INTO appointment_blood_requests (
      patient_id,
      appointment_id,
      requested_by_doctor_id,
      blood_group,
      component_type,
      units_requested,
      urgency,
      clinical_indication,
      required_by,
      notes
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING *
  `;

  const values = [
    patient_id,
    appointment_id || null,
    requested_by_doctor_id || null,
    blood_group,
    component_type || "whole_blood",
    units_requested || 1,
    urgency || "routine",
    clinical_indication,
    required_by || null,
    notes || null,
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
}

async function getBloodRequests({ patient_id, status } = {}) {
  const conditions = [];
  const values = [];

  if (patient_id) {
    values.push(patient_id);
    conditions.push(`patient_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`status = $${values.length}`);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT * FROM appointment_blood_requests
     ${where}
     ORDER BY created_at DESC`,
    values
  );

  return result.rows;
}

async function getBloodRequestById(id) {
  const result = await pool.query(
    `SELECT * FROM appointment_blood_requests WHERE id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function updateBloodRequestStatus(id, status, notes) {
  const result = await pool.query(
    `UPDATE appointment_blood_requests
     SET status = $2,
         notes = COALESCE($3, notes),
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, notes ?? null]
  );

  return result.rows[0] || null;
}

module.exports = {
  createBloodRequest,
  getBloodRequests,
  getBloodRequestById,
  updateBloodRequestStatus,
};
