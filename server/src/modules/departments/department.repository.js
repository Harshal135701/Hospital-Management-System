const pool = require("../../config/db");

const findAllActive = async (client = pool) => {
  const r = await client.query(
    "SELECT id, name, code, description, is_active FROM departments WHERE is_active = true ORDER BY name ASC"
  );
  return r.rows;
};

const findAll = async ({ search = '', includeInactive = true } = {}, client = pool) => {
  let query = "SELECT id, name, code, description, is_active FROM departments WHERE 1=1";
  const params = [];

  if (!includeInactive) {
    query += " AND is_active = true";
  }

  if (search) {
    params.push(`%${search}%`);
    query += ` AND (name ILIKE $${params.length} OR code ILIKE $${params.length} OR description ILIKE $${params.length})`;
  }

  query += " ORDER BY name ASC";
  const r = await client.query(query, params);
  return r.rows;
};

const findById = async (id, client = pool) => {
  const r = await client.query(
    "SELECT id, name, code, description, is_active FROM departments WHERE id = $1",
    [id]
  );
  return r.rows[0] || null;
};

const findByCode = async (code, excludeId = null, client = pool) => {
  let query = "SELECT id, name, code, description, is_active FROM departments WHERE LOWER(code) = LOWER($1)";
  const params = [code];
  if (excludeId) {
    params.push(excludeId);
    query += " AND id != $2";
  }
  const r = await client.query(query, params);
  return r.rows[0] || null;
};

const create = async ({ name, code, description, is_active = true }, client = pool) => {
  const r = await client.query(
    `INSERT INTO departments (name, code, description, is_active)
     VALUES ($1, $2, $3, $4)
     RETURNING id, name, code, description, is_active`,
    [name, code.toUpperCase(), description || null, Boolean(is_active)]
  );
  return r.rows[0];
};

const update = async (id, { name, code, description, is_active }, client = pool) => {
  const r = await client.query(
    `UPDATE departments
     SET name = COALESCE($2, name),
         code = COALESCE(UPPER($3), code),
         description = COALESCE($4, description),
         is_active = COALESCE($5, is_active)
     WHERE id = $1
     RETURNING id, name, code, description, is_active`,
    [id, name, code, description, is_active !== undefined ? Boolean(is_active) : null]
  );
  return r.rows[0] || null;
};

module.exports = {
  findAllActive,
  findAll,
  findById,
  findByCode,
  create,
  update,
};
