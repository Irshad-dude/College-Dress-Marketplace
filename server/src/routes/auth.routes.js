const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  logout,
  refreshToken,
  getProfile,
  updateProfile,
  changePassword,
  getAllUsers,
  deleteUser,
} = require('../controllers/auth.controller');
const { protect, requireRole } = require('../middleware/auth.middleware');
const {
  registerValidationRules,
  loginValidationRules,
  validate,
} = require('../validators/auth.validator');

// POST /api/v1/auth/register
router.post('/register', registerValidationRules, validate, register);

// POST /api/v1/auth/login
router.post('/login', loginValidationRules, validate, login);

// POST /api/v1/auth/logout — clears both httpOnly cookies (C1)
router.post('/logout', logout);

// POST /api/v1/auth/refresh-token — issues new access + refresh tokens (H6)
router.post('/refresh-token', refreshToken);

// GET  /api/v1/auth/profile
router.get('/profile', protect, getProfile);

// PUT  /api/v1/auth/profile
router.put('/profile', protect, updateProfile);

// PUT  /api/v1/auth/password — change password (H7)
router.put('/password', protect, changePassword);

// GET /api/v1/auth/admin/users — Get all users (Admin)
router.get('/admin/users', protect, requireRole('admin'), getAllUsers);

// DELETE /api/v1/auth/admin/users/:id — Delete user (Admin)
router.delete('/admin/users/:id', protect, requireRole('admin'), deleteUser);

module.exports = router;
