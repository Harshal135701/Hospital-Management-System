const pool = require("../../config/db");

const checkIn = async (appointmentId) => {
  const r = await pool.query(
    `UPDATE appointments
     SET status = 'arrived',
         arrived_at = NOW(),
         updated_at = NOW()
     WHERE id = $1 AND status = 'booked'
     RETURNING *`,
    [appointmentId]
  );
  return r.rows[0];
};

const callNextPatient = async (doctorId, date, roomId = null) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Lock and fetch the next candidate
    const candidateRes = await client.query(
      `SELECT a.id
       FROM appointments a
       WHERE a.doctor_id = $1
         AND a.appointment_date = $2
         AND a.status IN ('arrived', 'waiting')
       ORDER BY a.is_priority DESC, a.token_number ASC
       LIMIT 1
       FOR UPDATE SKIP LOCKED`,
      [doctorId, date]
    );

    if (candidateRes.rowCount === 0) {
      await client.query("COMMIT");
      return null;
    }

    const appointmentId = candidateRes.rows[0].id;

    // Transition to in_consultation
    const updateRes = await client.query(
      `UPDATE appointments
       SET status = 'in_consultation',
           called_at = NOW(),
           consultation_started_at = NOW(),
           room_id = COALESCE($2, room_id),
           updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [appointmentId, roomId]
    );

    await client.query("COMMIT");
    return updateRes.rows[0];
  } catch (e) {
    await client.query("ROLLBACK");
    throw e;
  } finally {
    client.release();
  }
};

const startConsultation = async (appointmentId) => {
  const r = await pool.query(
    `UPDATE appointments
     SET status = 'in_consultation',
         consultation_started_at = COALESCE(consultation_started_at, NOW()),
         updated_at = NOW()
     WHERE id = $1 AND status IN ('arrived', 'waiting', 'in_consultation')
     RETURNING *`,
    [appointmentId]
  );
  return r.rows[0];
};

const completeConsultation = async (appointmentId, notes = null) => {
  const r = await pool.query(
    `UPDATE appointments
     SET status = 'completed',
         consultation_ended_at = NOW(),
         notes = CASE WHEN $2::text IS NOT NULL THEN COALESCE(notes || ' | ', '') || $2::text ELSE notes END,
         updated_at = NOW()
     WHERE id = $1 AND status = 'in_consultation'
     RETURNING *`,
    [appointmentId, notes]
  );
  return r.rows[0];
};

const markNoShow = async (appointmentId) => {
  const r = await pool.query(
    `UPDATE appointments
     SET status = 'no_show',
         updated_at = NOW()
     WHERE id = $1 AND status IN ('booked', 'arrived', 'waiting', 'in_consultation')
     RETURNING *`,
    [appointmentId]
  );
  return r.rows[0];
};

const recallToken = async (appointmentId) => {
  const r = await pool.query(
    `UPDATE appointments
     SET called_at = NOW(),
         updated_at = NOW()
     WHERE id = $1 AND status IN ('arrived', 'waiting', 'in_consultation')
     RETURNING *`,
    [appointmentId]
  );
  return r.rows[0];
};

const setPriority = async (appointmentId, isPriority, notes = null) => {
  const r = await pool.query(
    `UPDATE appointments
     SET is_priority = $2,
         notes = CASE WHEN $3::text IS NOT NULL THEN COALESCE(notes || ' | ', '') || $3::text ELSE notes END,
         updated_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [appointmentId, isPriority, notes]
  );
  return r.rows[0];
};

const getDoctorQueue = async (doctorId, date) => {
  const r = await pool.query(
    `SELECT a.*,
            p.full_name AS patient_name, p.uhid AS patient_uhid, p.mobile AS patient_mobile,
            p.gender, p.date_of_birth,
            d.full_name AS doctor_name,
            rm.room_number, rm.floor AS room_floor
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     LEFT JOIN rooms rm ON rm.id = a.room_id
     WHERE a.doctor_id = $1 AND a.appointment_date = $2
     ORDER BY a.token_number ASC`,
    [doctorId, date]
  );
  return r.rows;
};

const getDisplayData = async (date, departmentId = null) => {
  const conditions = [`a.appointment_date = $1`];
  const values = [date];

  if (departmentId) {
    values.push(departmentId);
    conditions.push(`d.department_id = $${values.length}`);
  }

  const r = await pool.query(
    `SELECT a.*,
            p.full_name AS patient_name, p.uhid AS patient_uhid,
            d.id AS doc_id, d.full_name AS doctor_name, d.employee_code AS doctor_code,
            dep.id AS dept_id, dep.name AS department_name, dep.code AS department_code,
            COALESCE(rm.room_number, doc_rm.room_number, 'OPD Desk') AS active_room_number,
            COALESCE(rm.floor, doc_rm.floor, 'Ground Floor') AS active_room_floor
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN rooms rm ON rm.id = a.room_id
     LEFT JOIN rooms doc_rm ON doc_rm.id = d.room_id
     WHERE ${conditions.join(" AND ")}
     ORDER BY a.doctor_id, a.token_number ASC`,
    values
  );
  return r.rows;
};

module.exports = {
  checkIn,
  callNextPatient,
  startConsultation,
  completeConsultation,
  markNoShow,
  recallToken,
  setPriority,
  getDoctorQueue,
  getDisplayData,
};
