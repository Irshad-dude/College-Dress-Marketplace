const jwt = require('jsonwebtoken');

/**
 * Generate a signed JWT token for a given user ID.
 * Token expires in 24 hours.
 *
 * @param {string} userId - The MongoDB ObjectId of the user
 * @returns {string} Signed JWT token
 */
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = generateToken;
