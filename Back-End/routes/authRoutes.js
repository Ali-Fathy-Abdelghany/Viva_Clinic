const express = require('express');
const router = express.Router();
const { register, login, getProfile, logout, forgotPassword, resetPassword } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { validateUserRegistration, validateUserLogin, validateForgotPassword, validateResetPassword } = require('../middleware/validator');
const { authLimiter, registerLimiter, passwordResetLimiter } = require('../middleware/rateLimit');

// Public routes with specific rate limiters
router.post('/register', registerLimiter, validateUserRegistration, register);
router.post('/login', authLimiter, validateUserLogin, login);
router.post('/forgot-password', passwordResetLimiter, validateForgotPassword, forgotPassword);
router.post('/reset-password', passwordResetLimiter, validateResetPassword, resetPassword);

// Protected routes (less strict rate limiting)
router.get('/profile', authLimiter, authenticate, getProfile);
router.post('/logout', authLimiter, authenticate, logout);

module.exports = router;

