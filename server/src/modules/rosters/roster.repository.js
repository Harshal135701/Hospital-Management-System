const pool = require("../../config/db");

// ==================== DOCTOR SCHEDULES ====================

const createSchedule = async (d) => {
  const r = await pool.query(
    `INSERT INTO doctor_schedules (
       doctor_id, day_of_week, shift_type, start_time, end_time,
       max_patients, effective_from, effective_until, room_id, is_active
     )
     VALUES ($1, $2, $3, $4, $5, $6, COALESCE($7, CURRENT_DATE), $8, $9, $10)
     RETURNING *`,
    [
      d.doctorId,
      d.dayOfWeek,
      d.shiftType,
      d.startTime,
      d.endTime,
      d.maxPatients,
      d.effectiveFrom || null,
      d.effectiveUntil || null,
      d.roomId || null,
      d.isActive ?? true,
    ]
  );
  return r.rows[0];
};

const getSchedules = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.doctorId) {
    values.push(filters.doctorId);
    conditions.push(`s.doctor_id = $${values.length}`);
  }
  if (filters.dayOfWeek !== undefined && filters.dayOfWeek !== null) {
    values.push(filters.dayOfWeek);
    conditions.push(`s.day_of_week = $${values.length}`);
  }
  if (filters.isActive !== undefined) {
    values.push(filters.isActive);
    conditions.push(`s.is_active = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const r = await pool.query(
    `SELECT s.*,
            d.full_name AS doctor_name, d.employee_code AS doctor_code,
            dep.name AS department_name,
            rm.room_number, rm.floor AS room_floor
     FROM doctor_schedules s
     JOIN doctors d ON d.id = s.doctor_id
     JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN rooms rm ON rm.id = s.room_id
     ${where}
     ORDER BY s.day_of_week ASC, s.start_time ASC`,
    values
  );
  return r.rows;
};

const findScheduleById = async (id) => {
  const r = await pool.query(
    `SELECT s.*, d.full_name AS doctor_name
     FROM doctor_schedules s
     JOIN doctors d ON d.id = s.doctor_id
     WHERE s.id = $1`,
    [id]
  );
  return r.rows[0];
};

const updateSchedule = async (id, d) => {
  const updates = [];
  const values = [id];

  if (d.shiftType !== undefined) {
    values.push(d.shiftType);
    updates.push(`shift_type = $${values.length}`);
  }
  if (d.startTime !== undefined) {
    values.push(d.startTime);
    updates.push(`start_time = $${values.length}`);
  }
  if (d.endTime !== undefined) {
    values.push(d.endTime);
    updates.push(`end_time = $${values.length}`);
  }
  if (d.maxPatients !== undefined) {
    values.push(d.maxPatients);
    updates.push(`max_patients = $${values.length}`);
  }
  if (d.effectiveUntil !== undefined) {
    values.push(d.effectiveUntil);
    updates.push(`effective_until = $${values.length}`);
  }
  if (d.roomId !== undefined) {
    values.push(d.roomId);
    updates.push(`room_id = $${values.length}`);
  }
  if (d.isActive !== undefined) {
    values.push(d.isActive);
    updates.push(`is_active = $${values.length}`);
  }

  if (!updates.length) return findScheduleById(id);

  const r = await pool.query(
    `UPDATE doctor_schedules SET ${updates.join(", ")} WHERE id = $1 RETURNING *`,
    values
  );
  return r.rows[0];
};

const deleteSchedule = async (id) => {
  const r = await pool.query("DELETE FROM doctor_schedules WHERE id = $1 RETURNING *", [id]);
  return r.rows[0];
};

// ==================== DOCTOR LEAVES ====================

const createLeave = async (d) => {
  const r = await pool.query(
    `INSERT INTO doctor_leaves (doctor_id, start_date, end_date, reason, status)
     VALUES ($1, $2, $3, $4, 'pending')
     RETURNING *`,
    [d.doctorId, d.startDate, d.endDate, d.reason]
  );
  return r.rows[0];
};

const findLeaveById = async (id) => {
  const r = await pool.query(
    `SELECT l.*,
            d.full_name AS doctor_name,
            rev.full_name AS reviewer_name
     FROM doctor_leaves l
     JOIN doctors d ON d.id = l.doctor_id
     LEFT JOIN doctors rev ON rev.id = l.reviewed_by
     WHERE l.id = $1`,
    [id]
  );
  return r.rows[0];
};

const getLeaves = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.doctorId) {
    values.push(filters.doctorId);
    conditions.push(`l.doctor_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`l.status = $${values.length}`);
  }
  if (filters.startDate) {
    values.push(filters.startDate);
    conditions.push(`l.end_date >= $${values.length}`);
  }
  if (filters.endDate) {
    values.push(filters.endDate);
    conditions.push(`l.start_date <= $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const r = await pool.query(
    `SELECT l.*,
            d.full_name AS doctor_name, d.employee_code AS doctor_code,
            rev.full_name AS reviewer_name
     FROM doctor_leaves l
     JOIN doctors d ON d.id = l.doctor_id
     LEFT JOIN doctors rev ON rev.id = l.reviewed_by
     ${where}
     ORDER BY l.start_date DESC`,
    values
  );
  return r.rows;
};

const updateLeaveStatus = async (id, status, reviewedBy = null) => {
  const r = await pool.query(
    `UPDATE doctor_leaves
     SET status = $2,
         reviewed_by = $3,
         reviewed_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id, status, reviewedBy]
  );
  return r.rows[0];
};

const deleteLeave = async (id) => {
  const r = await pool.query(
    `DELETE FROM doctor_leaves WHERE id = $1 AND status = 'pending' RETURNING *`,
    [id]
  );
  return r.rows[0];
};

const getAppointmentsInLeaveRange = async (doctorId, startDate, endDate) => {
  const r = await pool.query(
    `SELECT a.id, a.appointment_date, a.start_time, a.token_number,
            p.full_name AS patient_name, p.mobile AS patient_mobile
     FROM appointments a
     JOIN patients p ON p.id = a.patient_id
     WHERE a.doctor_id = $1
       AND a.appointment_date BETWEEN $2 AND $3
       AND a.status NOT IN ('cancelled', 'completed', 'no_show')`,
    [doctorId, startDate, endDate]
  );
  return r.rows;
};

// ==================== DOCTOR ROSTERS ====================

const createRoster = async (d) => {
  const publishedAt = d.status === "published" ? new Date() : null;
  const r = await pool.query(
    `INSERT INTO doctor_rosters (
       doctor_id, roster_date, shift_type, start_time, end_time,
       room_id, max_patients, status, published_at
     )
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
     RETURNING *`,
    [
      d.doctorId,
      d.rosterDate,
      d.shiftType,
      d.startTime,
      d.endTime,
      d.roomId || null,
      d.maxPatients,
      d.status || "draft",
      publishedAt,
    ]
  );
  return r.rows[0];
};

const findRosterById = async (id) => {
  const r = await pool.query(
    `SELECT r.*,
            d.full_name AS doctor_name, d.employee_code AS doctor_code,
            dep.id AS department_id, dep.name AS department_name,
            rm.room_number, rm.floor AS room_floor,
            (SELECT COUNT(*) FROM appointments a
             WHERE a.roster_id = r.id AND a.status NOT IN ('cancelled', 'no_show')) AS booked_count
     FROM doctor_rosters r
     JOIN doctors d ON d.id = r.doctor_id
     JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN rooms rm ON rm.id = r.room_id
     WHERE r.id = $1`,
    [id]
  );
  return r.rows[0];
};

const checkRosterConflict = async (doctorId, rosterDate, startTime, endTime, excludeId = null) => {
  const r = await pool.query(
    `SELECT id FROM doctor_rosters
     WHERE doctor_id = $1
       AND roster_date = $2
       AND start_time < $4 AND end_time > $3
       AND ($5::uuid IS NULL OR id <> $5::uuid)
     LIMIT 1`,
    [doctorId, rosterDate, startTime, endTime, excludeId]
  );
  return r.rowCount > 0;
};

const getRosters = async (filters = {}) => {
  const conditions = [];
  const values = [];

  if (filters.rosterDate) {
    values.push(filters.rosterDate);
    conditions.push(`r.roster_date = $${values.length}`);
  }
  if (filters.startDate) {
    values.push(filters.startDate);
    conditions.push(`r.roster_date >= $${values.length}`);
  }
  if (filters.endDate) {
    values.push(filters.endDate);
    conditions.push(`r.roster_date <= $${values.length}`);
  }
  if (filters.doctorId) {
    values.push(filters.doctorId);
    conditions.push(`r.doctor_id = $${values.length}`);
  }
  if (filters.departmentId) {
    values.push(filters.departmentId);
    conditions.push(`d.department_id = $${values.length}`);
  }
  if (filters.status) {
    values.push(filters.status);
    conditions.push(`r.status = $${values.length}`);
  }
  if (filters.shiftType) {
    values.push(filters.shiftType);
    conditions.push(`r.shift_type = $${values.length}`);
  }

  const where = conditions.length ? `WHERE ${conditions.join(" AND ")}` : "";
  const r = await pool.query(
    `SELECT r.*,
            d.full_name AS doctor_name, d.employee_code AS doctor_code,
            dep.id AS department_id, dep.name AS department_name,
            rm.room_number, rm.floor AS room_floor,
            (SELECT COUNT(*) FROM appointments a
             WHERE a.roster_id = r.id AND a.status NOT IN ('cancelled', 'no_show')) AS booked_count
     FROM doctor_rosters r
     JOIN doctors d ON d.id = r.doctor_id
     JOIN departments dep ON dep.id = d.department_id
     LEFT JOIN rooms rm ON rm.id = r.room_id
     ${where}
     ORDER BY r.roster_date ASC, r.start_time ASC`,
    values
  );
  return r.rows;
};

const updateRoster = async (id, d) => {
  const updates = [];
  const values = [id];

  if (d.shiftType !== undefined) {
    values.push(d.shiftType);
    updates.push(`shift_type = $${values.length}`);
  }
  if (d.startTime !== undefined) {
    values.push(d.startTime);
    updates.push(`start_time = $${values.length}`);
  }
  if (d.endTime !== undefined) {
    values.push(d.endTime);
    updates.push(`end_time = $${values.length}`);
  }
  if (d.roomId !== undefined) {
    values.push(d.roomId);
    updates.push(`room_id = $${values.length}`);
  }
  if (d.maxPatients !== undefined) {
    values.push(d.maxPatients);
    updates.push(`max_patients = $${values.length}`);
  }
  if (d.status !== undefined) {
    values.push(d.status);
    updates.push(`status = $${values.length}`);
    if (d.status === "published") {
      updates.push(`published_at = NOW()`);
    }
  }

  if (!updates.length) return findRosterById(id);

  const r = await pool.query(
    `UPDATE doctor_rosters SET ${updates.join(", ")} WHERE id = $1 RETURNING *`,
    values
  );
  return r.rows[0];
};

const publishRoster = async (id) => {
  const r = await pool.query(
    `UPDATE doctor_rosters
     SET status = 'published', published_at = NOW()
     WHERE id = $1
     RETURNING *`,
    [id]
  );
  return r.rows[0];
};

const bulkPublishRosters = async ({ startDate, endDate, doctorId, departmentId }) => {
  const conditions = [
    `r.roster_date >= $1`,
    `r.roster_date <= $2`,
    `r.status = 'draft'`,
  ];
  const values = [startDate, endDate];

  if (doctorId) {
    values.push(doctorId);
    conditions.push(`r.doctor_id = $${values.length}`);
  }
  if (departmentId) {
    values.push(departmentId);
    conditions.push(`d.department_id = $${values.length}`);
  }

  const r = await pool.query(
    `UPDATE doctor_rosters r
     SET status = 'published', published_at = NOW()
     FROM doctors d
     WHERE r.doctor_id = d.id AND ${conditions.join(" AND ")}
     RETURNING r.*`,
    values
  );
  return r.rows;
};

const deleteRoster = async (id) => {
  const r = await pool.query(
    `DELETE FROM doctor_rosters
     WHERE id = $1 AND status = 'draft'
       AND NOT EXISTS (SELECT 1 FROM appointments WHERE roster_id = $1)
     RETURNING *`,
    [id]
  );
  return r.rows[0];
};

const getActiveDoctors = async (doctorId = null, departmentId = null) => {
  const conditions = ["d.is_active = true"];
  const values = [];

  if (doctorId) {
    values.push(doctorId);
    conditions.push(`d.id = $${values.length}`);
  }
  if (departmentId) {
    values.push(departmentId);
    conditions.push(`d.department_id = $${values.length}`);
  }

  const r = await pool.query(
    `SELECT d.*, dep.name AS department_name
     FROM doctors d
     JOIN departments dep ON dep.id = d.department_id
     WHERE ${conditions.join(" AND ")}`,
    values
  );
  return r.rows;
};

module.exports = {
  createSchedule,
  getSchedules,
  findScheduleById,
  updateSchedule,
  deleteSchedule,
  createLeave,
  findLeaveById,
  getLeaves,
  updateLeaveStatus,
  deleteLeave,
  getAppointmentsInLeaveRange,
  createRoster,
  findRosterById,
  checkRosterConflict,
  getRosters,
  updateRoster,
  publishRoster,
  bulkPublishRosters,
  deleteRoster,
  getActiveDoctors,
};
