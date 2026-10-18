const pool = require('../../config/db');

async function findEncounterById(id, client = pool) {
  const result = await client.query(
    `SELECT e.*,
            p.full_name AS patient_name,
            p.uhid AS patient_uhid,
            p.gender AS patient_gender,
            p.date_of_birth AS patient_dob,
            d.full_name AS doctor_name,
            d.employee_code AS doctor_code,
            a.appointment_number,
            a.status AS appointment_status
     FROM consultation_encounters e
     JOIN patients p ON p.id = e.patient_id
     JOIN doctors d ON d.id = e.doctor_id
     JOIN appointments a ON a.id = e.appointment_id
     WHERE e.id = $1`,
    [id]
  );
  return result.rows[0] || null;
}

async function findEncounterByAppointmentId(appointmentId, client = pool) {
  const result = await client.query(
    `SELECT e.*,
            p.full_name AS patient_name,
            p.uhid AS patient_uhid,
            p.gender AS patient_gender,
            p.date_of_birth AS patient_dob,
            d.full_name AS doctor_name,
            d.employee_code AS doctor_code,
            a.appointment_number,
            a.status AS appointment_status
     FROM consultation_encounters e
     JOIN patients p ON p.id = e.patient_id
     JOIN doctors d ON d.id = e.doctor_id
     JOIN appointments a ON a.id = e.appointment_id
     WHERE e.appointment_id = $1`,
    [appointmentId]
  );
  return result.rows[0] || null;
}

async function createEncounter({ appointmentId, patientId, doctorId }, client = pool) {
  const result = await client.query(
    `INSERT INTO consultation_encounters (
      appointment_id,
      patient_id,
      doctor_id,
      status,
      started_at
    )
    VALUES ($1, $2, $3, 'in_progress', NOW())
    RETURNING *`,
    [appointmentId, patientId, doctorId]
  );
  return result.rows[0];
}

async function getEncounters({ patientId, doctorId, status }, client = pool) {
  const conditions = [];
  const params = [];
  let idx = 1;

  if (patientId) {
    conditions.push(`e.patient_id = $${idx++}`);
    params.push(patientId);
  }
  if (doctorId) {
    conditions.push(`e.doctor_id = $${idx++}`);
    params.push(doctorId);
  }
  if (status) {
    conditions.push(`e.status = $${idx++}`);
    params.push(status);
  }

  const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const result = await client.query(
    `SELECT e.*,
            p.full_name AS patient_name,
            p.uhid AS patient_uhid,
            d.full_name AS doctor_name,
            a.appointment_number,
            a.status AS appointment_status
     FROM consultation_encounters e
     JOIN patients p ON p.id = e.patient_id
     JOIN doctors d ON d.id = e.doctor_id
     JOIN appointments a ON a.id = e.appointment_id
     ${whereClause}
     ORDER BY e.started_at DESC`,
    params
  );
  return result.rows;
}

async function completeEncounterAtomic(id, doctorId, client = pool) {
  const query = doctorId
    ? `UPDATE consultation_encounters
       SET status = 'completed',
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND doctor_id = $2 AND status = 'in_progress'
       RETURNING *`
    : `UPDATE consultation_encounters
       SET status = 'completed',
           completed_at = NOW(),
           updated_at = NOW()
       WHERE id = $1 AND status = 'in_progress'
       RETURNING *`;

  const params = doctorId ? [id, doctorId] : [id];
  const result = await client.query(query, params);
  return result.rows[0] || null;
}

module.exports = {
  pool,
  findEncounterById,
  findEncounterByAppointmentId,
  createEncounter,
  getEncounters,
  completeEncounterAtomic,
};
