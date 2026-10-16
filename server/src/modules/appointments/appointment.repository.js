const pool = require("../../config/db");

const findPatientById = async (id, client = pool) => {
  const r = await client.query("SELECT * FROM patients WHERE id = $1", [id]);
  return r.rows[0];
};

const findDoctorById = async (id, client = pool) => {
  const r = await client.query(
    "SELECT * FROM doctors WHERE id = $1 AND is_active = true",
    [id]
  );
  return r.rows[0];
};

const findDepartmentById = async (id, client = pool) => {
  const r = await client.query(
    "SELECT * FROM departments WHERE id = $1 AND is_active = true",
    [id]
  );
  return r.rows[0];
};

const findRoomById = async (id, client = pool) => {
  const r = await client.query(
    "SELECT * FROM rooms WHERE id = $1 AND is_active = true",
    [id]
  );
  return r.rows[0];
};

const findAppointmentById = async (id, client = pool) => {
  const r = await client.query(
    `SELECT a.*,
            p.full_name AS patient_name, p.uhid AS patient_uhid, p.mobile AS patient_mobile,
            p.gender AS patient_gender, p.date_of_birth AS patient_dob,
            d.full_name AS doctor_name, d.employee_code AS doctor_code,
            dep.name AS department_name, dep.code AS department_code,
            r.room_number, r.name AS room_name, r.floor AS room_floor
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     JOIN doctors d ON d.id = a.doctor_id
     JOIN departments dep ON dep.id = a.department_id
     LEFT JOIN rooms r ON r.id = a.room_id
     WHERE a.id = $1`,
    [id]
  );
  return r.rows[0];
};

const isDoctorOnLeave = async (doctorId, date, client = pool) => {
  const r = await client.query(
    `SELECT * FROM doctor_leaves
     WHERE doctor_id = $1
       AND status = 'approved'
       AND $2::date BETWEEN start_date AND end_date
     LIMIT 1`,
    [doctorId, date]
  );
  return r.rows[0] || null;
};

const isSlotBooked = async (doctorId, date, start, end, excludeId = null, client = pool) => {
  const r = await client.query(
    `SELECT id FROM appointments
     WHERE doctor_id = $1
       AND appointment_date = $2
       AND status NOT IN ('cancelled', 'no_show')
       AND start_time < $4 AND end_time > $3
       AND ($5::uuid IS NULL OR id <> $5::uuid)
     LIMIT 1`,
    [doctorId, date, start, end, excludeId]
  );
  return r.rows.length > 0;
};

const getNextTokenNumber = async (doctorId, date, client = pool) => {
  const r = await client.query(
    `SELECT COALESCE(MAX(token_number), 0) + 1 AS next_token
     FROM appointments
     WHERE doctor_id = $1 AND appointment_date = $2`,
    [doctorId, date]
  );
  return parseInt(r.rows[0].next_token, 10);
};

const generateAppointmentNumber = async (client = pool) => {
  const year = new Date().getFullYear();
  const r = await client.query(
    `SELECT COUNT(*) AS total FROM appointments WHERE EXTRACT(YEAR FROM created_at) = $1`,
    [year]
  );
  const seq = String(parseInt(r.rows[0].total, 10) + 1).padStart(4, "0");
  return `APT-${year}-${seq}`;
};

const createAppointmentWithClient = async (data, client) => {
  const aptNum = await generateAppointmentNumber(client);
  const query = `
    INSERT INTO appointments (
      appointment_number, patient_id, doctor_id, department_id,
      room_id, appointment_date, start_time, end_time,
      status, visit_type, token_number, notes, is_priority
    ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'booked', $9, $10, $11, $12)
    RETURNING *;
  `;
  const values = [
    aptNum,
    data.patientId,
    data.doctorId,
    data.departmentId,
    data.roomId || null,
    data.appointmentDate,
    data.startTime,
    data.endTime,
    data.visitType,
    data.tokenNumber,
    data.notes || null,
    data.isPriority || false,
  ];
  const r = await client.query(query, values);
  return r.rows[0];
};

const rescheduleAppointmentWithClient = async (id, data, client) => {
  const query = `
    UPDATE appointments
    SET appointment_date = $1,
        start_time = $2,
        end_time = $3,
        token_number = $4,
        room_id = COALESCE($5, room_id),
        notes = CASE WHEN $6::text IS NOT NULL THEN $6::text ELSE notes END,
        updated_at = NOW()
    WHERE id = $7
    RETURNING *;
  `;
  const values = [
    data.appointmentDate,
    data.startTime,
    data.endTime,
    data.tokenNumber,
    data.roomId || null,
    data.reason || null,
    id,
  ];
  const r = await client.query(query, values);
  return r.rows[0];
};

const cancelAppointment = async (id, reason, client = pool) => {
  const query = `
    UPDATE appointments
    SET status = 'cancelled',
        cancellation_reason = $1,
        updated_at = NOW()
    WHERE id = $2
    RETURNING *;
  `;
  const r = await client.query(query, [reason, id]);
  return r.rows[0];
};

const updateStatusAtomic = async (
  id,
  newStatus,
  expectedCurrentStatus,
  options = {},
  client = pool
) => {
  const query = `
    UPDATE appointments
    SET status = $1::varchar,
        arrived_at = CASE WHEN $1::varchar = 'arrived' AND arrived_at IS NULL THEN NOW() ELSE arrived_at END,
        called_at = CASE WHEN $1::varchar = 'in_consultation' AND called_at IS NULL THEN NOW() ELSE called_at END,
        consultation_started_at = CASE WHEN $1::varchar = 'in_consultation' AND consultation_started_at IS NULL THEN NOW() ELSE consultation_started_at END,
        consultation_ended_at = CASE WHEN $1::varchar = 'completed' AND consultation_ended_at IS NULL THEN NOW() ELSE consultation_ended_at END,
        cancellation_reason = CASE WHEN $1::varchar = 'cancelled' AND $4::text IS NOT NULL THEN $4::text ELSE cancellation_reason END,
        notes = CASE WHEN $5::text IS NOT NULL THEN $5::text ELSE notes END,
        updated_at = NOW()
    WHERE id = $2::uuid AND status = $3::varchar
    RETURNING *;
  `;
  const values = [
    newStatus,
    id,
    expectedCurrentStatus,
    options.cancellation_reason || null,
    options.notes || null,
  ];
  const r = await client.query(query, values);
  return r.rows[0] || null;
};

const listAppointments = async (filters, client = pool) => {
  const conditions = [];
  const values = [];

  if (filters.date) {
    values.push(filters.date);
    conditions.push(`a.appointment_date = $${values.length}`);
  }
  if (filters.startDate) {
    values.push(filters.startDate);
    conditions.push(`a.appointment_date >= $${values.length}`);
  }
  if (filters.endDate) {
    values.push(filters.endDate);
    conditions.push(`a.appointment_date <= $${values.length}`);
  }
  if (filters.doctorId) {
    values.push(filters.doctorId);
    conditions.push(`a.doctor_id = $${values.length}`);
  }
  if (filters.departmentId) {
    values.push(filters.departmentId);
    conditions.push(`a.department_id = $${values.length}`);
  }
  if (filters.patientId) {
    values.push(filters.patientId);
    conditions.push(`a.patient_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`a.status = $${values.length}`);
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const countQuery = `SELECT COUNT(*) AS total FROM appointments a ${whereClause}`;
  const countRes = await client.query(countQuery, values);
  const total = parseInt(countRes.rows[0].total, 10);

  const page = filters.page || 1;
  const limit = filters.limit || 20;
  const offset = (page - 1) * limit;

  values.push(limit);
  const limitPlaceholder = `$${values.length}`;
  values.push(offset);
  const offsetPlaceholder = `$${values.length}`;

  const query = `
    SELECT a.*,
           p.full_name AS patient_name, p.uhid AS patient_uhid, p.mobile AS patient_mobile,
           p.gender AS patient_gender, p.date_of_birth AS patient_dob,
           d.full_name AS doctor_name, d.employee_code AS doctor_code,
           dep.name AS department_name, dep.code AS department_code,
           r.room_number, r.name AS room_name, r.floor AS room_floor
    FROM appointments a
    JOIN patients p ON p.id = a.patient_id
    JOIN doctors d ON d.id = a.doctor_id
    JOIN departments dep ON dep.id = a.department_id
    LEFT JOIN rooms r ON r.id = a.room_id
    ${whereClause}
    ORDER BY a.appointment_date DESC, a.start_time ASC, a.token_number ASC
    LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
  `;

  const r = await client.query(query, values);
  return {
    items: r.rows,
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 1,
    },
  };
};

const getPatientHistory = async (patientId, client = pool) => {
  const query = `
    SELECT a.*,
           d.full_name AS doctor_name, dep.name AS department_name,
           r.room_number
    FROM appointments a
    JOIN doctors d ON d.id = a.doctor_id
    JOIN departments dep ON dep.id = a.department_id
    LEFT JOIN rooms r ON r.id = a.room_id
    WHERE a.patient_id = $1
    ORDER BY a.appointment_date DESC, a.start_time DESC
  `;
  const r = await client.query(query, [patientId]);
  return r.rows;
};

const getPublishedRoster = async (doctorId, date, client = pool) => {
  const query = `
    SELECT * FROM doctor_rosters
    WHERE doctor_id = $1 AND roster_date = $2 AND status = 'published'
    ORDER BY start_time ASC
  `;
  const r = await client.query(query, [doctorId, date]);
  return r.rows;
};

const getRecurringSchedule = async (doctorId, dayOfWeek, client = pool) => {
  const query = `
    SELECT * FROM doctor_schedules
    WHERE doctor_id = $1 AND day_of_week = $2
    ORDER BY start_time ASC
  `;
  const r = await client.query(query, [doctorId, dayOfWeek]);
  return r.rows;
};

const getAppointmentsForDoctor = async (doctorId, date, client = pool) => {
  const query = `
    SELECT start_time, end_time, status
    FROM appointments
    WHERE doctor_id = $1 AND appointment_date = $2
      AND status NOT IN ('cancelled', 'no_show')
    ORDER BY start_time ASC
  `;
  const r = await client.query(query, [doctorId, date]);
  return r.rows;
};

module.exports = {
  pool,
  findPatientById,
  findDoctorById,
  findDepartmentById,
  findRoomById,
  findAppointmentById,
  isDoctorOnLeave,
  isSlotBooked,
  getNextTokenNumber,
  generateAppointmentNumber,
  createAppointmentWithClient,
  rescheduleAppointmentWithClient,
  cancelAppointment,
  updateStatusAtomic,
  listAppointments,
  getPatientHistory,
  getPublishedRoster,
  getRecurringSchedule,
  getAppointmentsForDoctor,
};
