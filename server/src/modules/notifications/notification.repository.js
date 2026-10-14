
const pool = require("../../config/db");


const createNotification = async (data) => {
  const result = await pool.query(
    `INSERT INTO notifications
      (appointment_id, patient_id, channel, event_type,
       recipient, message, scheduled_at)
     SELECT
       $1::uuid,
       $2::uuid,
       $3::varchar,
       $4::varchar,
       $5::varchar,
       $6::text,
       $7::timestamptz
     WHERE NOT EXISTS (
       SELECT 1 FROM notifications
       WHERE appointment_id = $1::uuid
         AND channel = $3::varchar
         AND event_type = $4::varchar
         AND status IN ('pending', 'sent')
     )
     RETURNING *`,
    [
      data.appointmentId,
      data.patientId,
      data.channel,
      data.eventType,
      data.recipient,
      data.message,
      data.scheduledAt,
    ]
  );

  return result.rows[0] || null;
};


const getAppointmentDetails = async (appointmentId) => {
  const result = await pool.query(
    `SELECT a.id, a.patient_id, a.doctor_id, a.appointment_date,
            a.start_time, a.status AS appointment_status,
            p.full_name AS patient_name, p.mobile,
            d.full_name AS doctor_name, dep.name AS department_name
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN departments dep ON dep.id = a.department_id
     WHERE a.id = $1`,
    [appointmentId]
  );

  return result.rows[0];
};

const getNotificationById = async (id) => {
  const result = await pool.query(
    "SELECT * FROM notifications WHERE id = $1",
    [id]
  );
  return result.rows[0];
};

const getNotifications = async (filters = {}) => {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE ($1::text IS NULL OR status = $1)
       AND ($2::uuid IS NULL OR appointment_id = $2)
     ORDER BY created_at DESC
     LIMIT 100`,
    [filters.status || null, filters.appointmentId || null]
  );

  return result.rows;
};

const getDueNotifications = async () => {
  const result = await pool.query(
    `SELECT * FROM notifications
     WHERE status = 'pending' AND scheduled_at <= NOW()
     ORDER BY scheduled_at ASC
     LIMIT 50`
  );

  return result.rows;
};


const updateNotification = async (id, data) => {
  const result = await pool.query(
    `UPDATE notifications
     SET status = $2::varchar,
         sent_at = CASE
           WHEN $2::varchar = 'sent' THEN NOW()
           ELSE sent_at
         END,
         provider_message_id = COALESCE($3::varchar, provider_message_id),
         error_message = $4::text,
         attempts = attempts + 1,
         updated_at = NOW()
     WHERE id = $1::uuid
     RETURNING *`,
    [
      id,
      data.status,
      data.providerMessageId || null,
      data.errorMessage || null,
    ]
  );

  return result.rows[0];
};

const cancelPendingForAppointment = async (appointmentId) => {
  const result = await pool.query(
    `UPDATE notifications
     SET status = 'cancelled', updated_at = NOW()
     WHERE appointment_id = $1 AND status = 'pending'
     RETURNING *`,
    [appointmentId]
  );

  return result.rows;
};

module.exports = {
  createNotification,
  getAppointmentDetails,
  getNotificationById,
  getNotifications,
  getDueNotifications,
  updateNotification,
  cancelPendingForAppointment,
};
