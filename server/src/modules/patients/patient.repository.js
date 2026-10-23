const pool = require('../../config/db');

const PATIENT_COLUMNS = `
  id, uhid, full_name, mobile, date_of_birth, gender, created_at,
  alt_mobile, email, address, city, district, state, pin_code,
  emergency_name, emergency_relationship, emergency_phone,
  blood_group, rh_factor, allergies, high_risk
`;

class PatientRepository {
  async findAll({ search, limit = 50, offset = 0 } = {}) {
    let query = `
      SELECT ${PATIENT_COLUMNS}
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
      `SELECT ${PATIENT_COLUMNS}
       FROM patients
       WHERE uhid = $1`,
      [uhid]
    );
    return res.rows[0] || null;
  }

  async findById(id) {
    const res = await pool.query(
      `SELECT ${PATIENT_COLUMNS}
       FROM patients
       WHERE id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findByMobile(mobile) {
    const res = await pool.query(
      `SELECT ${PATIENT_COLUMNS}
       FROM patients
       WHERE mobile = $1 OR alt_mobile = $1`,
      [mobile]
    );
    return res.rows;
  }

  async create(data) {
    const res = await pool.query(
      `INSERT INTO patients (
        uhid, full_name, mobile, date_of_birth, gender,
        alt_mobile, email, address, city, district, state, pin_code,
        emergency_name, emergency_relationship, emergency_phone,
        blood_group, rh_factor, allergies, high_risk
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING ${PATIENT_COLUMNS}`,
      [
        data.uhid,
        data.full_name,
        data.mobile,
        data.date_of_birth || null,
        data.gender || null,
        data.alt_mobile || null,
        data.email || null,
        data.address || null,
        data.city || null,
        data.district || null,
        data.state || null,
        data.pin_code || null,
        data.emergency_name || null,
        data.emergency_relationship || null,
        data.emergency_phone || null,
        data.blood_group || null,
        data.rh_factor || null,
        data.allergies || null,
        Boolean(data.high_risk)
      ]
    );
    return res.rows[0];
  }

  async update(id, data) {
    const res = await pool.query(
      `UPDATE patients
       SET full_name = COALESCE($2, full_name),
           mobile = COALESCE($3, mobile),
           date_of_birth = COALESCE($4, date_of_birth),
           gender = COALESCE($5, gender),
           alt_mobile = $6,
           email = $7,
           address = $8,
           city = $9,
           district = $10,
           state = $11,
           pin_code = $12,
           emergency_name = $13,
           emergency_relationship = $14,
           emergency_phone = $15,
           blood_group = $16,
           rh_factor = $17,
           allergies = $18,
           high_risk = $19
       WHERE id = $1
       RETURNING ${PATIENT_COLUMNS}`,
      [
        id,
        data.full_name,
        data.mobile,
        data.date_of_birth || null,
        data.gender || null,
        data.alt_mobile || null,
        data.email || null,
        data.address || null,
        data.city || null,
        data.district || null,
        data.state || null,
        data.pin_code || null,
        data.emergency_name || null,
        data.emergency_relationship || null,
        data.emergency_phone || null,
        data.blood_group || null,
        data.rh_factor || null,
        data.allergies || null,
        Boolean(data.high_risk)
      ]
    );
    return res.rows[0] || null;
  }
}

module.exports = new PatientRepository();
