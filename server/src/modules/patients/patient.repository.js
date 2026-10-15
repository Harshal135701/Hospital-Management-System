const pool = require('../../config/db');

class PatientRepository {
  async findAll({ search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT id, uhid, full_name, mobile, date_of_birth, gender, created_at
      FROM patients
    `;
    const params = [];

    if (search) {
      query += ` WHERE full_name ILIKE $1 OR mobile ILIKE $1 OR uhid ILIKE $1`;
      params.push(`%${search}%`);
      query += ` ORDER BY created_at DESC LIMIT $2 OFFSET $3`;
      params.push(limit, offset);
    } else {
      query += ` ORDER BY created_at DESC LIMIT $1 OFFSET $2`;
      params.push(limit, offset);
    }

    const res = await pool.query(query, params);
    return res.rows;
  }

  async findByUhid(uhid) {
    const res = await pool.query(
      `SELECT id, uhid, full_name, mobile, date_of_birth, gender, created_at
       FROM patients
       WHERE uhid = $1`,
      [uhid]
    );
    return res.rows[0] || null;
  }

  async findById(id) {
    const res = await pool.query(
      `SELECT id, uhid, full_name, mobile, date_of_birth, gender, created_at
       FROM patients
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async create({ uhid, full_name, mobile, date_of_birth, gender }) {
    const res = await pool.query(
      `INSERT INTO patients (uhid, full_name, mobile, date_of_birth, gender)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, uhid, full_name, mobile, date_of_birth, gender, created_at`,
      [uhid, full_name, mobile, date_of_birth || null, gender || null]
    );
    return res.rows[0];
  }
}

module.exports = new PatientRepository();
