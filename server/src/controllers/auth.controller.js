/**
 * auth.controller.js
 *
 * Handles all authentication operations:
 * - Register / Login / Logout
 * - Token refresh (H6)
 * - Change password (H7)
 * - Profile get/update
 *
 * Security model (C1):
 *  - Access token (15min)  → httpOnly 'jwt' cookie + response body (for Socket.IO)
 *  - Refresh token (7 days) → httpOnly 'refreshToken' cookie ONLY
 *  - Both cookies: httpOnly, secure in prod, sameSite=strict
 */
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/generateToken');
const logger = require('../utils/logger');
const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// ── Cookie helpers ─────────────────────────────────────────────────────────────

const isProduction = process.env.NODE_ENV === 'production';

/** Access token cookie — short-lived (15 min) */
const accessCookieOptions = {
  httpOnly: true,
  secure: true,          // Must be true when sameSite is 'none'
  sameSite: isProduction ? 'none' : 'strict', // 'none' allows cross-site (Netlify → Render)
  maxAge: 15 * 60 * 1000, // 15 minutes in ms
};

/** Refresh token cookie — long-lived (7 days) */
const refreshCookieOptions = {
  httpOnly: true,
  secure: true,          // Must be true when sameSite is 'none'
  sameSite: isProduction ? 'none' : 'strict', // 'none' allows cross-site (Netlify → Render)
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
};

/** Set both auth cookies on a response */
const setAuthCookies = (res, userId) => {
  const accessToken  = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId);
  res.cookie('jwt', accessToken, accessCookieOptions);
  res.cookie('refreshToken', refreshToken, refreshCookieOptions);
  return { accessToken, refreshToken };
};

/** Clear both auth cookies (for logout) */
const clearAuthCookies = (res) => {
  const clearOpts = { httpOnly: true, secure: true, sameSite: isProduction ? 'none' : 'strict' };
  res.clearCookie('jwt', clearOpts);
  res.clearCookie('refreshToken', clearOpts);
};

// ── Controllers ────────────────────────────────────────────────────────────────

/**
 * @desc    Register a new user
 * @route   POST /api/v1/auth/register
 * @access  Public
 */
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, collegeName } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
    }

    const user = await User.create({ name, email, password, role: role || 'buyer', collegeName });
    const { accessToken } = setAuthCookies(res, user._id);

    logger.info({ userId: user._id, email: user.email, collegeName }, 'New user registered');

    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      token: accessToken, // In-memory use for Socket.IO only
      user: { id: user._id, name: user.name, email: user.email, role: user.role, collegeName: user.collegeName, profileImage: user.profileImage, createdAt: user.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Login
 * @route   POST /api/v1/auth/login
 * @access  Public
 */
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select('+password');

    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const { accessToken } = setAuthCookies(res, user._id);
    logger.info({ userId: user._id }, 'User logged in');

    res.status(200).json({
      success: true,
      message: 'Login successful.',
      token: accessToken,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, collegeName: user.collegeName, profileImage: user.profileImage, createdAt: user.createdAt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Logout — clears both auth cookies
 * @route   POST /api/v1/auth/logout
 * @access  Public
 */
const logout = (req, res) => {
  clearAuthCookies(res);
  res.status(200).json({ success: true, message: 'Logged out successfully.' });
};

/**
 * @desc    Refresh access token using httpOnly refresh token cookie (H6)
 * @route   POST /api/v1/auth/refresh-token
 * @access  Public (uses refreshToken cookie)
 */
const refreshToken = async (req, res, next) => {
  try {
    const token = req.cookies?.refreshToken;
    if (!token) {
      return res.status(401).json({ success: false, message: 'No refresh token provided.' });
    }

    const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh';
    let decoded;
    try {
      decoded = jwt.verify(token, REFRESH_SECRET);
    } catch {
      return res.status(401).json({ success: false, message: 'Refresh token is invalid or expired. Please log in again.' });
    }

    if (decoded.type !== 'refresh') {
      return res.status(401).json({ success: false, message: 'Invalid token type.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'User no longer exists.' });
    }

    // H6: Token rotation — issue brand new tokens on every refresh
    const { accessToken: newAccessToken } = setAuthCookies(res, user._id);
    logger.info({ userId: user._id }, 'Tokens refreshed');

    res.status(200).json({
      success: true,
      token: newAccessToken, // New in-memory token for Socket.IO
      user: { id: user._id, name: user.name, email: user.email, role: user.role, collegeName: user.collegeName, profileImage: user.profileImage },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get current user's profile + issue fresh access token
 * @route   GET /api/v1/auth/profile
 * @access  Private
 */
const getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // Re-issue access token + slide refresh cookie (session continuity)
    const { accessToken } = setAuthCookies(res, user._id);

    res.status(200).json({ success: true, token: accessToken, user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update profile (name / profileImage)
 * @route   PUT /api/v1/auth/profile
 * @access  Private
 */
const updateProfile = async (req, res, next) => {
  try {
    const { name, profileImage } = req.body;
    const updateFields = {};
    if (name)         updateFields.name = name.trim();
    if (profileImage) updateFields.profileImage = profileImage;

    const user = await User.findByIdAndUpdate(req.user.id, { $set: updateFields }, { new: true, runValidators: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    res.status(200).json({ success: true, message: 'Profile updated successfully.', user });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Change password (H7)
 * @route   PUT /api/v1/auth/password
 * @access  Private
 *
 * Body: { oldPassword, newPassword, confirmPassword }
 * - Verifies old password against stored bcrypt hash
 * - Ensures newPassword meets policy (≥6 chars, 1 digit)
 * - Ensures newPassword === confirmPassword
 * - Saves and re-issues tokens (invalidates old sessions conceptually)
 */
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword, confirmPassword } = req.body;

    if (!oldPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'oldPassword, newPassword and confirmPassword are all required.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters.' });
    }
    if (!/[0-9]/.test(newPassword)) {
      return res.status(400).json({ success: false, message: 'New password must contain at least one number.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    const user = await User.findById(req.user.id).select('+password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Old password is incorrect.' });
    }

    // The pre('save') hook will hash the new password automatically
    user.password = newPassword;
    await user.save();

    // Re-issue tokens so existing sessions remain valid with new password context
    const { accessToken } = setAuthCookies(res, user._id);
    logger.info({ userId: user._id }, 'Password changed');

    res.status(200).json({ success: true, message: 'Password changed successfully.', token: accessToken });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all users (Admin only)
 * @route   GET /api/v1/auth/admin/users
 * @access  Private/Admin
 */
const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select('-password').sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, users });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete user account (Admin only)
 * @route   DELETE /api/v1/auth/admin/users/:id
 * @access  Private/Admin
 */
const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found.' });

    // 1. Fetch all products owned by this user
    const products = await Product.find({ sellerId: user._id });

    // 2. Delete all Cloudinary images for these products
    for (const product of products) {
      if (product.images && product.images.length > 0) {
        const deletePromises = product.images.map((imageUrl) => {
          const parts = imageUrl.split('/');
          const fileWithExt = parts[parts.length - 1];
          const fileName = fileWithExt.split('.')[0];
          const folder = parts[parts.length - 2];
          const publicId = `${folder}/${fileName}`;

          return cloudinary.uploader.destroy(publicId).catch((err) => {
            console.warn(`Failed to delete Cloudinary image: ${publicId}`, err.message);
          });
        });
        await Promise.all(deletePromises);
      }
    }

    // 3. Delete all product documents
    await Product.deleteMany({ sellerId: user._id });

    // 4. Finally, delete the user
    await User.findByIdAndDelete(req.params.id);
    
    logger.info({ userId: req.params.id }, 'User and their listings deleted by admin');
    res.status(200).json({ success: true, message: 'User and all their listings deleted successfully.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, logout, refreshToken, getProfile, updateProfile, changePassword, getAllUsers, deleteUser };
