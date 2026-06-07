const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getProfile,
  updateProfile,
} = require('../controllers/auth.controller');
const { protect } = require('../middleware/auth.middleware');
const {
  registerValidationRules,
  loginValidationRules,
  validate,
} = require('../validators/auth.validator');

// POST /api/v1/auth/register
router.post('/register', registerValidationRules, validate, register);

// POST /api/v1/auth/login
router.post('/login', loginValidationRules, validate, login);

// GET /api/v1/auth/profile
router.get('/profile', protect, getProfile);

// PUT /api/v1/auth/profile
router.put('/profile', protect, updateProfile);

module.exports = router;
