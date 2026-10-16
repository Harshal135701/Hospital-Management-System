const pool = require("../../config/db");

const findAllActive = async ({ departmentId } = {}, client = pool) => {
  const conditions = ["d.is_active = true", "dep.is_active = true"];
  const values = [];

  if (departmentId) {
    values.push(departmentId);
    conditions.push(`d.department_id = $${values.length}::uuid`);
  }

  const query = `
    SELECT d.id,
           d.employee_code,
           d.full_name,
           d.full_name AS name,
           d.department_id,
           dep.name AS department_name,
           dep.name AS department,
           d.room_id,
           r.room_number,
           r.room_number AS room
    FROM doctors d
    JOIN departments dep ON dep.id = d.department_id
    LEFT JOIN rooms r ON r.id = d.room_id
    WHERE ${conditions.join(" AND ")}
    ORDER BY d.full_name ASC
  `;

  const r = await client.query(query, values);
  return r.rows;
};

const findById = async (id, client = pool) => {
  const query = `
    SELECT d.id,
           d.employee_code,
           d.full_name,
           d.full_name AS name,
           d.department_id,
           dep.name AS department_name,
           dep.name AS department,
           d.room_id,
           r.room_number,
           r.room_number AS room
    FROM doctors d
    JOIN departments dep ON dep.id = d.department_id
    LEFT JOIN rooms r ON r.id = d.room_id
    WHERE d.id = $1::uuid AND d.is_active = true AND dep.is_active = true
  `;
  const r = await client.query(query, [id]);
  return r.rows[0] || null;
};

module.exports = {
  findAllActive,
  findById,
};
