const pool = require("../../config/db");

const ROOM_COLUMNS = `
  r.id, r.room_number, r.name, r.floor, r.is_active, r.room_type,
  r.department_id, dep.name AS department_name, r.capacity, r.daily_tariff, r.created_at
`;

const findAll = async ({ roomType, departmentId, search, includeInactive = true } = {}, client = pool) => {
  let query = `
    SELECT ${ROOM_COLUMNS}
    FROM rooms r
    LEFT JOIN departments dep ON dep.id = r.department_id
    WHERE 1=1
  `;
  const params = [];

  if (!includeInactive) {
    query += " AND r.is_active = true";
  }

  if (roomType) {
    params.push(roomType);
    query += ` AND r.room_type = $${params.length}`;
  }

  if (departmentId) {
    params.push(departmentId);
    query += ` AND r.department_id = $${params.length}::uuid`;
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (r.room_number ILIKE $${params.length} OR r.name ILIKE $${params.length} OR r.floor ILIKE $${params.length})`;
  }

  query += " ORDER BY r.room_number ASC";
  const res = await client.query(query, params);
  return res.rows;
};

const findById = async (id, client = pool) => {
  const query = `
    SELECT ${ROOM_COLUMNS}
    FROM rooms r
    LEFT JOIN departments dep ON dep.id = r.department_id
    WHERE r.id = $1::uuid
  `;
  const res = await client.query(query, [id]);
  return res.rows[0] || null;
};

const findByRoomNumber = async (roomNumber, excludeId = null, client = pool) => {
  let query = "SELECT id, room_number FROM rooms WHERE LOWER(room_number) = LOWER($1)";
  const params = [roomNumber];
  if (excludeId) {
    params.push(excludeId);
    query += " AND id != $2::uuid";
  }
  const res = await client.query(query, params);
  return res.rows[0] || null;
};

const create = async (data, client = pool) => {
  const res = await client.query(
    `INSERT INTO rooms (room_number, name, floor, room_type, department_id, capacity, daily_tariff, is_active)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
     RETURNING id, room_number, name, floor, room_type, department_id, capacity, daily_tariff, is_active, created_at`,
    [
      data.room_number.trim(),
      data.name ? data.name.trim() : null,
      data.floor ? data.floor.trim() : null,
      data.room_type || 'general',
      data.department_id || null,
      parseInt(data.capacity, 10) || 1,
      parseFloat(data.daily_tariff) || 0,
      data.is_active !== undefined ? Boolean(data.is_active) : true
    ]
  );
  return res.rows[0];
};

const update = async (id, data, client = pool) => {
  const res = await client.query(
    `UPDATE rooms
     SET room_number = COALESCE($2, room_number),
         name = COALESCE($3, name),
         floor = COALESCE($4, floor),
         room_type = COALESCE($5, room_type),
         department_id = $6,
         capacity = COALESCE($7, capacity),
         daily_tariff = COALESCE($8, daily_tariff),
         is_active = COALESCE($9, is_active)
     WHERE id = $1::uuid
     RETURNING id, room_number, name, floor, room_type, department_id, capacity, daily_tariff, is_active`,
    [
      id,
      data.room_number ? data.room_number.trim() : null,
      data.name ? data.name.trim() : null,
      data.floor ? data.floor.trim() : null,
      data.room_type || null,
      data.department_id !== undefined ? (data.department_id || null) : undefined,
      data.capacity ? parseInt(data.capacity, 10) : null,
      data.daily_tariff !== undefined ? parseFloat(data.daily_tariff) : null,
      data.is_active !== undefined ? Boolean(data.is_active) : null
    ]
  );
  return res.rows[0] || null;
};

module.exports = {
  findAll,
  findById,
  findByRoomNumber,
  create,
  update
};
