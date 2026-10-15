const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const { authenticateToken } = require('../../middleware/auth.middleware');
const { loginRateLimiter } = require('../../middleware/rate-limiter.middleware');

// Public login endpoint with rate limiting
router.post('/login', loginRateLimiter, (req, res, next) => authController.login(req, res, next));

// Authenticated session endpoints
router.post('/logout', authenticateToken, (req, res, next) => authController.logout(req, res, next));
router.get('/me', authenticateToken, (req, res, next) => authController.getCurrentUser(req, res, next));
router.post('/change-password', authenticateToken, (req, res, next) => authController.changePassword(req, res, next));

module.exports = router;
