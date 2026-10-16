const pool = require("../../config/db");

const findAllActive = async (client = pool) => {
  const r = await client.query(
    "SELECT id, name, code, description FROM departments WHERE is_active = true ORDER BY name ASC"
  );
  return r.rows;
};

const findById = async (id, client = pool) => {
  const r = await client.query(
    "SELECT id, name, code, description FROM departments WHERE id = $1 AND is_active = true",
    [id]
  );
  return r.rows[0] || null;
};

module.exports = {
  findAllActive,
  findById,
};
