const jwt = require('jsonwebtoken');
const config = require('../config/config');

// Generate JWT token
const generateToken = (userId) => {
  return jwt.sign({ userId }, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRE
  });
};

// Verify JWT token
const verifyToken = (token) => {
  return jwt.verify(token, config.JWT_SECRET);
};

// Generate password reset token (short-lived, 1 hour)
const generatePasswordResetToken = (userId) => {
  return jwt.sign({ userId, type: 'password-reset' }, config.JWT_SECRET, {
    expiresIn: '1h' // Password reset tokens expire in 1 hour
  });
};

// Verify password reset token
const verifyPasswordResetToken = (token) => {
  try {
    const decoded = jwt.verify(token, config.JWT_SECRET);
    if (decoded.type !== 'password-reset') {
      throw new Error('Invalid token type');
    }
    return decoded;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  generateToken,
  verifyToken,
  generatePasswordResetToken,
  verifyPasswordResetToken
};

