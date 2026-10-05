const express = require('express');
const rateLimit = require('express-rate-limit');
const validate = require('../middleware/validate');
const schemas = require('../validators/schemas');
const { register, login } = require('../controllers/authController');

const router = express.Router();

// Brute-force protection: max 20 requests per 15 minutes per IP on auth routes.
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many attempts. Please try again later.' },
});

router.post('/register', authLimiter, validate(schemas.register), register);
router.post('/login', authLimiter, validate(schemas.login), login);

module.exports = router;
