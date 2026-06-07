const jwt = require('jsonwebtoken');

/**
 * Generate a short-lived ACCESS token (15 minutes).
 * Used for API authentication. Stored in httpOnly 'jwt' cookie.
 * Also returned in response body for Socket.IO in-memory use.
 *
 * @param {string} userId - MongoDB ObjectId string
 * @returns {string} Signed JWT
 */
const generateAccessToken = (userId) =>
  jwt.sign({ id: userId, type: 'access' }, process.env.JWT_SECRET, { expiresIn: '15m' });

/**
 * Generate a long-lived REFRESH token (7 days).
 * Used only to obtain new access tokens.
 * Stored in httpOnly 'refreshToken' cookie. Never sent to client as plain text.
 *
 * @param {string} userId - MongoDB ObjectId string
 * @returns {string} Signed JWT
 */
const generateRefreshToken = (userId) =>
  jwt.sign({ id: userId, type: 'refresh' }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', {
    expiresIn: '7d',
  });

// Backward-compatible alias — existing code using generateToken still works
const generateToken = generateAccessToken;

module.exports = { generateToken, generateAccessToken, generateRefreshToken };
