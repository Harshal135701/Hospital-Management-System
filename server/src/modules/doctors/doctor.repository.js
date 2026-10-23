const pool = require("../../config/db");

const DOCTOR_COLUMNS = `
  d.id,
  d.employee_code,
  d.full_name,
  d.full_name AS name,
  d.mobile,
  d.department_id,
  dep.name AS department_name,
  dep.name AS department,
  d.room_id,
  r.room_number,
  r.room_number AS room,
  d.specialty,
  COALESCE(d.consultation_fee, 500) AS consultation_fee,
  d.experience_years,
  d.qualifications,
  d.is_active,
  d.created_at
`;

const findAllActive = async ({ departmentId } = {}, client = pool) => {
  const conditions = ["d.is_active = true", "dep.is_active = true"];
  const values = [];

  if (departmentId) {
    values.push(departmentId);
    conditions.push(`d.department_id = $${values.length}::uuid`);
  }

  const query = `
    SELECT ${DOCTOR_COLUMNS}
    FROM doctors d
    JOIN departments dep ON dep.id = d.department_id
    LEFT JOIN rooms r ON r.id = d.room_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY d.full_name ASC
  `;

  const r = await client.query(query, values);
  return r.rows;
};

const findAll = async ({ search = '', departmentId = null, includeInactive = true } = {}, client = pool) => {
  let query = `
    SELECT ${DOCTOR_COLUMNS}
    FROM doctors d
    JOIN departments dep ON dep.id = d.department_id
    LEFT JOIN rooms r ON r.id = d.room_id
    WHERE 1=1
  `;
  const values = [];

  if (!includeInactive) {
    query += " AND d.is_active = true";
  }

  if (departmentId) {
    values.push(departmentId);
    query += ` AND d.department_id = $${values.length}::uuid`;
  }

  if (search) {
    values.push(`%${search}%`);
    query += ` AND (d.full_name ILIKE $${values.length} OR d.employee_code ILIKE $${values.length} OR d.specialty ILIKE $${values.length} OR dep.name ILIKE $${values.length})`;
  }

  query += " ORDER BY d.full_name ASC";
  const r = await client.query(query, values);
  return r.rows;
};

const findById = async (id, client = pool) => {
  const query = `
    SELECT ${DOCTOR_COLUMNS}
    FROM doctors d
    JOIN departments dep ON dep.id = d.department_id
    LEFT JOIN rooms r ON r.id = d.room_id
    WHERE d.id = $1::uuid
  `;
  const r = await client.query(query, [id]);
  return r.rows[0] || null;
};

const findByEmployeeCode = async (code, excludeId = null, client = pool) => {
  let query = "SELECT id, employee_code FROM doctors WHERE LOWER(employee_code) = LOWER($1)";
  const values = [code];
  if (excludeId) {
    values.push(excludeId);
    query += " AND id != $2::uuid";
  }
  const r = await client.query(query, values);
  return r.rows[0] || null;
};

const create = async (data, client = pool) => {
  const query = `
    INSERT INTO doctors (
      employee_code, full_name, mobile, department_id, room_id,
      specialty, consultation_fee, experience_years, qualifications, is_active
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    RETURNING id, employee_code, full_name, mobile, department_id, room_id,
              specialty, consultation_fee, experience_years, qualifications, is_active, created_at
  `;
  const values = [
    data.employee_code.trim().toUpperCase(),
    data.full_name.trim(),
    data.mobile ? data.mobile.trim() : null,
    data.department_id,
    data.room_id || null,
    data.specialty ? data.specialty.trim() : null,
    parseFloat(data.consultation_fee) || 500,
    parseInt(data.experience_years, 10) || 0,
    data.qualifications ? data.qualifications.trim() : null,
    data.is_active !== undefined ? Boolean(data.is_active) : true
  ];

  const r = await client.query(query, values);
  return r.rows[0];
};

const update = async (id, data, client = pool) => {
  const query = `
    UPDATE doctors
    SET full_name = COALESCE($2, full_name),
        mobile = COALESCE($3, mobile),
        department_id = COALESCE($4, department_id),
        room_id = $5,
        specialty = COALESCE($6, specialty),
        consultation_fee = COALESCE($7, consultation_fee),
        experience_years = COALESCE($8, experience_years),
        qualifications = COALESCE($9, qualifications),
        is_active = COALESCE($10, is_active),
        employee_code = COALESCE($11, employee_code)
    WHERE id = $1::uuid
    RETURNING id, employee_code, full_name, mobile, department_id, room_id,
              specialty, consultation_fee, experience_years, qualifications, is_active
  `;
  const values = [
    id,
    data.full_name ? data.full_name.trim() : null,
    data.mobile ? data.mobile.trim() : null,
    data.department_id || null,
    data.room_id !== undefined ? (data.room_id || null) : undefined,
    data.specialty ? data.specialty.trim() : null,
    data.consultation_fee !== undefined ? parseFloat(data.consultation_fee) : null,
    data.experience_years !== undefined ? parseInt(data.experience_years, 10) : null,
    data.qualifications ? data.qualifications.trim() : null,
    data.is_active !== undefined ? Boolean(data.is_active) : null,
    data.employee_code ? data.employee_code.trim().toUpperCase() : null
  ];

  const r = await client.query(query, values);
  return r.rows[0] || null;
};

module.exports = {
  findAllActive,
  findAll,
  findById,
  findByEmployeeCode,
  create,
  update,
};
