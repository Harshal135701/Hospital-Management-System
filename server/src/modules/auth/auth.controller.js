const authService = require('./auth.service');
const { loginSchema, changePasswordSchema } = require('./auth.validation');

class AuthController {
  async login(req, res, next) {
    try {
      const validated = loginSchema.parse(req.body);
      const result = await authService.login(validated.email, validated.password);
      res.status(200).json({
        success: true,
        data: result
      });
    } catch (err) {
      next(err);
    }
  }

  async logout(req, res, next) {
    try {
      const result = await authService.logout(req.user, req.user?.jti, req.user?.exp);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }

  async getCurrentUser(req, res, next) {
    try {
      const user = await authService.getCurrentUser(req.user.id);
      res.status(200).json({
        success: true,
        data: user
      });
    } catch (err) {
      next(err);
    }
  }

  async changePassword(req, res, next) {
    try {
      const validated = changePasswordSchema.parse(req.body);
      const result = await authService.changePassword(
        req.user.id,
        validated.current_password,
        validated.new_password
      );
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new AuthController();
