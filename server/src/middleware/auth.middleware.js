const { verifyJwt } = require('../modules/auth/auth.utils');
const authRepository = require('../modules/auth/auth.repository');

function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      code: 'UNAUTHORIZED',
      message: 'Authentication required. Missing Bearer token in Authorization header.'
    });
  }

  const token = authHeader.split(' ')[1];

  let payload;
  try {
    payload = verifyJwt(token);
  } catch (err) {
    return res.status(401).json({
      success: false,
      code: 'INVALID_TOKEN',
      message: `Authentication failed: ${err.message}`
    });
  }

  // Asynchronous verification of token revocation, account active status, and token_version
  (async () => {
    try {
      // 1. Check token revocation blacklist
      if (payload.jti) {
        const isRevoked = await authRepository.isTokenRevoked(payload.jti);
        if (isRevoked) {
          return res.status(401).json({
            success: false,
            code: 'TOKEN_REVOKED',
            message: 'Token has been revoked. Please log in again.'
          });
        }
      }

      // 2. Check current account state in database
      const account = await authRepository.findAccountById(payload.sub);
      if (!account) {
        return res.status(401).json({
          success: false,
          code: 'USER_NOT_FOUND',
          message: 'Staff account associated with this token no longer exists.'
        });
      }

      // 3. Immediate enforcement on account deactivation
      if (!account.is_active) {
        return res.status(403).json({
          success: false,
          code: 'ACCOUNT_DEACTIVATED',
          message: 'Staff account has been deactivated. Access revoked.'
        });
      }

      // 4. Immediate session invalidation on role changes or password resets
      if (payload.token_version !== undefined && account.token_version !== payload.token_version) {
        return res.status(401).json({
          success: false,
          code: 'SESSION_INVALIDATED',
          message: 'Session has been invalidated due to a security update or role change. Please log in again.'
        });
      }

      // Attach verified authenticated user context to request
      req.user = {
        id: account.id,
        employee_code: account.employee_code,
        full_name: account.full_name,
        email: account.email,
        role: account.role,
        doctor_id: account.doctor_id,
        jti: payload.jti,
        exp: payload.exp
      };

      next();
    } catch (dbErr) {
      next(dbErr);
    }
  })();
}

function requireRoles(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        code: 'UNAUTHORIZED',
        message: 'Authentication required'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        code: 'FORBIDDEN',
        message: `Access denied. Role '${req.user.role}' is not authorized to access this resource. Required role: [${allowedRoles.join(', ')}]`
      });
    }

    next();
  };
}

module.exports = {
  authenticateToken,
  requireRoles
};
