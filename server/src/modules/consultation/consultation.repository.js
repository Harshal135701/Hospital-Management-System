
const pool = require("../../config/db");

async function createEncounter({ appointment_id, patient_id, doctor_id }) {
  const result = await pool.query(
    `INSERT INTO consultation_encounters
       (appointment_id, patient_id, doctor_id)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [appointment_id, patient_id, doctor_id]
  );

  return result.rows[0];
}

async function getEncounters({ patient_id, doctor_id, status } = {}) {
  const conditions = [];
  const values = [];

  if (patient_id) {
    values.push(patient_id);
    conditions.push(`patient_id = $${values.length}`);
  }

  if (doctor_id) {
    values.push(doctor_id);
    conditions.push(`doctor_id = $${values.length}`);
  }

  if (status) {
    values.push(status);
    conditions.push(`ce.status = $${values.length}`);
  }

  const where = conditions.length
    ? `WHERE ${conditions.join(" AND ")}`
    : "";

  const result = await pool.query(
    `SELECT ce.*, a.appointment_date, a.start_time, a.end_time,
            p.full_name AS patient_name, p.uhid,
            d.id AS assigned_doctor_id
     FROM consultation_encounters ce
     JOIN appointments a ON a.id = ce.appointment_id
     JOIN patients p ON p.id = ce.patient_id
     JOIN doctors d ON d.id = ce.doctor_id
     ${where}
     ORDER BY ce.started_at DESC`,
    values
  );

  return result.rows;
}

async function getEncounterById(id) {
  const result = await pool.query(
    `SELECT ce.*, a.appointment_date, a.start_time, a.end_time,
            p.full_name AS patient_name, p.uhid,
            d.id AS assigned_doctor_id
     FROM consultation_encounters ce
     JOIN appointments a ON a.id = ce.appointment_id
     JOIN patients p ON p.id = ce.patient_id
     JOIN doctors d ON d.id = ce.doctor_id
     WHERE ce.id = $1`,
    [id]
  );

  return result.rows[0] || null;
}

async function completeEncounter(id) {
  const result = await pool.query(
    `UPDATE consultation_encounters
     SET status = 'completed',
         completed_at = NOW(),
         updated_at = NOW()
     WHERE id = $1 AND status = 'in_progress'
     RETURNING *`,
    [id]
  );

  return result.rows[0] || null;
}

module.exports = {
  createEncounter,
  getEncounters,
  getEncounterById,
  completeEncounter,
};
