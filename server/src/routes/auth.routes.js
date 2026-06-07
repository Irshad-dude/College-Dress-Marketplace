const express = require('express');
const router = express.Router();
const {
  register,
  login,
  logout,
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

// GET  /api/v1/auth/profile
router.get('/profile', protect, getProfile);

// PUT  /api/v1/auth/profile
router.put('/profile', protect, updateProfile);

// POST /api/v1/auth/logout — clears httpOnly cookie (C1 fix)
router.post('/logout', logout);

module.exports = router;
