const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email('Valid email address is required').max(150),
  password: z.string().min(1, 'Password is required').max(128, 'Password cannot exceed 128 characters')
});

const changePasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: z.string()
    .min(12, 'New password must be at least 12 characters long according to NIST guidelines')
    .max(128, 'Password cannot exceed 128 characters')
});

module.exports = {
  loginSchema,
  changePasswordSchema
};
