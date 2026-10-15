const pool = require('../../config/db');

class AuthRepository {
  constructor(dbPool = pool) {
    this.pool = dbPool;
  }

  async findAccountByEmail(email) {
    const res = await this.pool.query(
      `SELECT sa.*, d.employee_code as doctor_employee_code
       FROM staff_accounts sa
       LEFT JOIN doctors d ON sa.doctor_id = d.id
       WHERE LOWER(sa.email) = LOWER($1)`,
      [email]
    );
    return res.rows[0] || null;
  }

  async findAccountById(id) {
    const res = await this.pool.query(
      `SELECT sa.id, sa.employee_code, sa.full_name, sa.email, sa.role, sa.department_id,
              sa.doctor_id, sa.is_active, sa.token_version, sa.must_change_password,
              sa.created_at, sa.updated_at,
              d.employee_code as doctor_code,
              dep.name as department_name
       FROM staff_accounts sa
       LEFT JOIN doctors d ON sa.doctor_id = d.id
       LEFT JOIN departments dep ON sa.department_id = dep.id
       WHERE sa.id = $1`,
      [id]
    );
    return res.rows[0] || null;
  }

  async findDoctorWithStaff(doctorEmployeeCode) {
    const res = await this.pool.query(
      `SELECT d.id as doctor_id, d.employee_code, d.full_name as doctor_name, d.is_active as doctor_active,
              sa.id as staff_id, sa.emergency_pin_hash, sa.failed_pin_attempts, sa.pin_locked_until,
              sa.is_active as staff_active
       FROM doctors d
       LEFT JOIN staff_accounts sa ON d.id = sa.doctor_id
       WHERE d.employee_code = $1`,
      [doctorEmployeeCode]
    );
    return res.rows[0] || null;
  }

  async updateFailedLogin(id, attempts, lockedUntil) {
    await this.pool.query(
      `UPDATE staff_accounts
       SET failed_login_attempts = $1, locked_until = $2, updated_at = NOW()
       WHERE id = $3`,
      [attempts, lockedUntil, id]
    );
  }

  async resetFailedLogin(id) {
    await this.pool.query(
      `UPDATE staff_accounts
       SET failed_login_attempts = 0, locked_until = NULL, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async updateFailedPin(staffId, attempts, lockedUntil) {
    await this.pool.query(
      `UPDATE staff_accounts
       SET failed_pin_attempts = $1, pin_locked_until = $2, updated_at = NOW()
       WHERE id = $3`,
      [attempts, lockedUntil, staffId]
    );
  }

  async resetFailedPin(staffId) {
    await this.pool.query(
      `UPDATE staff_accounts
       SET failed_pin_attempts = 0, pin_locked_until = NULL, updated_at = NOW()
       WHERE id = $1`,
      [staffId]
    );
  }

  async updatePassword(id, passwordHash) {
    await this.pool.query(
      `UPDATE staff_accounts
       SET password_hash = $1, token_version = token_version + 1, must_change_password = FALSE, updated_at = NOW()
       WHERE id = $2`,
      [passwordHash, id]
    );
  }

  async incrementTokenVersion(id) {
    await this.pool.query(
      `UPDATE staff_accounts
       SET token_version = token_version + 1, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async deactivateAccount(id) {
    await this.pool.query(
      `UPDATE staff_accounts
       SET is_active = FALSE, token_version = token_version + 1, updated_at = NOW()
       WHERE id = $1`,
      [id]
    );
  }

  async addTokenRevocation(jti, expiresAt, userId) {
    await this.pool.query(
      `INSERT INTO token_revocations (token_id, expires_at, user_id)
       VALUES ($1, to_timestamp($2), $3)
       ON CONFLICT (token_id) DO NOTHING`,
      [jti, expiresAt, userId]
    );
  }

  async isTokenRevoked(jti) {
    const res = await this.pool.query(
      `SELECT 1 FROM token_revocations WHERE token_id = $1`,
      [jti]
    );
    return res.rows.length > 0;
  }
}

module.exports = new AuthRepository();
