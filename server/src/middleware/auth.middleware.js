const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Authentication middleware (C1 + H6 updates)
 *
 * Token resolution order:
 *  1. 'jwt' httpOnly cookie (access token, 15min) — XSS-safe
 *  2. Authorization: Bearer <token> header — fallback for API clients
 *
 * NOTE: The 'refreshToken' cookie is never used here.
 *       It is only accepted at POST /api/v1/auth/refresh-token.
 */
const protect = async (req, res, next) => {
  let token;

  if (req.cookies?.jwt) {
    token = req.cookies.jwt;
  } else if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ success: false, message: 'Not authorized. No token provided.' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Reject refresh tokens accidentally sent to protected routes
    if (decoded.type === 'refresh') {
      return res.status(401).json({ success: false, message: 'Cannot use a refresh token for API access.' });
    }

    const user = await User.findById(decoded.id).select('-password');
    if (!user) return res.status(401).json({ success: false, message: 'Not authorized. User not found.' });

    req.user = { id: user._id.toString(), name: user.name, email: user.email, role: user.role };
    next();
  } catch (error) {
    // Distinguish expired vs invalid tokens for better frontend handling
    const message = error.name === 'TokenExpiredError'
      ? 'Token expired. Please refresh your session.'
      : 'Not authorized. Token is invalid.';
    return res.status(401).json({ success: false, message, expired: error.name === 'TokenExpiredError' });
  }
};

/**
 * Role-based access control (M1 fix)
 * Usage: router.post('/products', protect, requireRole('seller'), ...)
 */
const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({
      success: false,
      message: `Access denied. This action requires role: ${roles.join(' or ')}.`,
    });
  }
  next();
};

module.exports = { protect, requireRole };
