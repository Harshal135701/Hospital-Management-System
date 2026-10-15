const authRepository = require('./auth.repository');
const {
  hashPassword,
  verifyPassword,
  dummyHash,
  signJwt
} = require('./auth.utils');
const ApiError = require('../../utils/ApiError');

class AuthService {
  constructor(repo = authRepository) {
    this.repo = repo;
  }

  async login(email, password) {
    const account = await this.repo.findAccountByEmail(email);

    if (!account) {
      // Mitigate username enumeration timing side-channels
      dummyHash();
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Check account lockout
    if (account.locked_until && new Date(account.locked_until) > new Date()) {
      const minutesRemaining = Math.ceil((new Date(account.locked_until).getTime() - Date.now()) / 60000);
      throw ApiError.forbidden(`Account is temporarily locked due to excessive failed attempts. Please try again in ${minutesRemaining} minute(s).`);
    }

    // Check active status
    if (!account.is_active) {
      throw ApiError.forbidden('Account has been deactivated. Please contact the hospital systems administrator.');
    }

    // Verify password
    const isMatch = verifyPassword(password, account.password_hash);
    if (!isMatch) {
      const attempts = account.failed_login_attempts + 1;
      const lockedUntil = attempts >= 5
        ? new Date(Date.now() + 15 * 60 * 1000).toISOString()
        : null;

      await this.repo.updateFailedLogin(account.id, attempts, lockedUntil);

      if (attempts >= 5) {
        throw ApiError.forbidden('Account is temporarily locked due to excessive failed attempts. Please try again in 15 minutes.');
      }
      throw ApiError.unauthorized('Invalid email or password');
    }

    // Password verified: reset failure counters
    if (account.failed_login_attempts > 0 || account.locked_until) {
      await this.repo.resetFailedLogin(account.id);
    }

    // Issue JWT with current token_version
    const token = signJwt({
      sub: account.id,
      employee_code: account.employee_code,
      full_name: account.full_name,
      email: account.email,
      role: account.role,
      doctor_id: account.doctor_id,
      token_version: account.token_version
    }, 900); // 15 minutes

    return {
      token,
      user: {
        id: account.id,
        employee_code: account.employee_code,
        full_name: account.full_name,
        email: account.email,
        role: account.role,
        doctor_id: account.doctor_id,
        must_change_password: account.must_change_password
      }
    };
  }

  async logout(user, jti, exp) {
    if (jti && exp) {
      await this.repo.addTokenRevocation(jti, exp, user?.id || null);
    }
    return { message: 'Logged out successfully' };
  }

  async getCurrentUser(userId) {
    const account = await this.repo.findAccountById(userId);
    if (!account) {
      throw ApiError.notFound('User account not found');
    }
    if (!account.is_active) {
      throw ApiError.forbidden('User account has been deactivated');
    }
    return {
      id: account.id,
      employee_code: account.employee_code,
      full_name: account.full_name,
      email: account.email,
      role: account.role,
      department_name: account.department_name,
      doctor_code: account.doctor_code,
      must_change_password: account.must_change_password,
      created_at: account.created_at
    };
  }

  async changePassword(userId, currentPassword, newPassword) {
    const account = await this.repo.findAccountById(userId);
    if (!account) {
      throw ApiError.notFound('User account not found');
    }
    if (!account.is_active) {
      throw ApiError.forbidden('User account has been deactivated');
    }

    // Full account query for password_hash
    const fullAccount = await this.repo.findAccountByEmail(account.email);
    const isCurrentValid = verifyPassword(currentPassword, fullAccount.password_hash);
    if (!isCurrentValid) {
      throw ApiError.badRequest('Current password provided is incorrect');
    }

    if (currentPassword === newPassword) {
      throw ApiError.badRequest('New password cannot be the same as the current password');
    }

    const newHash = hashPassword(newPassword);
    // updatePassword also increments token_version to invalidate other active sessions
    await this.repo.updatePassword(userId, newHash);

    return { message: 'Password updated successfully. Other active sessions have been invalidated.' };
  }
}

module.exports = new AuthService();
