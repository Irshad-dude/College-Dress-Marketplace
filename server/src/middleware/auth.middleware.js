const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware. (C1 fix applied)
 *
 * Token resolution order:
 *  1. httpOnly cookie `jwt` (set by login/register — XSS-safe)
 *  2. `Authorization: Bearer <token>` header (fallback for API clients / Socket.IO)
 *
 * Verifies the token, fetches user from DB, attaches to req.user.
 * Returns 401 if token is missing, malformed, expired, or user not found.
 */
const protect = async (req, res, next) => {
  let token;

  // 1. Prefer httpOnly cookie (XSS-safe)
  if (req.cookies && req.cookies.jwt) {
    token = req.cookies.jwt;
  }
  // 2. Fallback: Authorization header (for Socket.IO and API clients)
  else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. No token provided.',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Fetch user to confirm account still exists
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized. User not found.',
      });
    }

    req.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Token is invalid or expired.',
    });
  }
};

/**
 * Role-based access control middleware. (M1 fix)
 * Usage: protect, requireRole('seller')
 *
 * @param {...string} roles - Allowed roles
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. Required role: ${roles.join(' or ')}.`,
    });
  }
  next();
};

module.exports = { protect, requireRole };
