const { StatusCodes } = require('http-status-codes');
const { User, Patient, Doctor } = require('../models');
const { hashPassword, comparePassword } = require('../utils/passwordUtils');
const { generateToken, generatePasswordResetToken, verifyPasswordResetToken } = require('../utils/jwtUtils');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendPasswordResetEmail, sendPasswordResetConfirmation } = require('../services/notificationService');
const config = require('../config/config');

// Register new user
const register = asyncHandler(async (req, res) => {
  const { FirstName, LastName, Email, Password, ConfirmPassword, Phone, Role } = req.body;

  // ConfirmPassword is validated in middleware, but we ensure it's not saved
  // Remove ConfirmPassword from req.body to prevent any accidental saving
  delete req.body.ConfirmPassword;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { Email } });
  if (existingUser) {
    throw new AppError('User with this email already exists', StatusCodes.BAD_REQUEST);
  }

  // Hash password
  const PasswordHash = await hashPassword(Password);

  // Create user
  const user = await User.create({
    FirstName,
    LastName,
    Email,
    PasswordHash,
    Phone,
    Role: Role || 'Patient'
  });

  // Create role-specific profile
  if (user.Role === 'Patient') {
    await Patient.create({ PatientID: user.UserID });
  } else if (user.Role === 'Doctor') {
    // Doctor profile should be created by admin with SpecialtyID
  }

  // Generate token
  const token = generateToken(user.UserID);

  res.cookie(config.JWT_COOKIE_NAME, token, {
    httpOnly: true,
    secure: false, 
    maxAge: config.JWT_COOKIE_EXPIRE
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: {
        UserID: user.UserID,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Role: user.Role
      },
      token // Still return token in response for Postman/API clients
    }
  });
});

// Login user
const login = asyncHandler(async (req, res) => {
  const { Email, Password } = req.body;

  // Find user
  const user = await User.findOne({ where: { Email } });
  if (!user) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }


  // Verify password
  
  const isPasswordValid = await comparePassword(Password, user.PasswordHash);
  if (!isPasswordValid) {
    throw new AppError('Invalid email or password', StatusCodes.UNAUTHORIZED);
  }

  // Generate token
  const token = generateToken(user.UserID);


  const cookieOptions = {
    httpOnly: true,
    secure: false, 
    sameSite: 'lax',
    maxAge: config.JWT_COOKIE_EXPIRE
  };

  res.cookie(config.JWT_COOKIE_NAME, token, cookieOptions);

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Login successful',
    data: {
      user: {
        UserID: user.UserID,
        FirstName: user.FirstName,
        LastName: user.LastName,
        Email: user.Email,
        Role: user.Role
      },
      token // Still return token in response for Postman/API clients
    }
  });
});

// Get current user profile
const getProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;

  const user = await User.findByPk(userId, {
    attributes: { exclude: ['PasswordHash'] },
    include: [
      {
        model: Patient,
        as: 'patientInfo',
        required: false
      },
      {
        model: Doctor,
        as: 'doctorInfo',
        required: false,
        include: [
          {
            model: require('../models/Specialty'),
            as: 'specialty',
            required: false
          }
        ]
      }
    ]
  });

  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }
  
  res.status(StatusCodes.OK).json({
    success: true,
    data: { user }
  });
});

// Logout user (clear cookie)
const logout = asyncHandler(async (req, res) => {
  // Clear the token cookie - must use same settings as when setting the cookie
  const isCrossOrigin = config.FRONTEND_URL !== config.APP_URL;
  const isProduction = config.NODE_ENV === 'production';
  
  res.cookie(config.JWT_COOKIE_NAME, '', {
    httpOnly: true,
    secure: isProduction,
    sameSite: (isCrossOrigin || isProduction) ? 'none' : 'lax',
    expires: new Date(0) // Expire immediately
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Logged out successfully'
  });
});

// Forgot password - send reset link via email
const forgotPassword = asyncHandler(async (req, res) => {
  const { Email } = req.body;

  // Find user by email
  const user = await User.findOne({ where: { Email } });
  
  // Don't reveal if user exists or not (security best practice)
  // Always return success message to prevent email enumeration
  if (!user) {
    // Still return success to prevent user enumeration
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  // Generate password reset token
  const resetToken = generatePasswordResetToken(user.UserID);

  // Create reset URL
  const resetUrl = `${config.FRONTEND_URL}/reset-password?token=${resetToken}`;

  // Send password reset email
  //fix 
  try {
    await sendPasswordResetEmail(
      user.Email,
      `${user.FirstName} ${user.LastName}`,
      resetToken,
      resetUrl
    );
  } catch (error) {
    console.error('Failed to send password reset email:', error);
    // Don't reveal email sending failure to user
    return res.status(StatusCodes.OK).json({
      success: true,
      message: 'If an account with that email exists, a password reset link has been sent.'
    });
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'If an account with that email exists, a password reset link has been sent.'
  });
});

// Reset password using token
const resetPassword = asyncHandler(async (req, res) => {
  const { Token, Password, ConfirmPassword } = req.body;

  // Validate passwords match
  if (Password !== ConfirmPassword) {
    throw new AppError('Passwords do not match', StatusCodes.BAD_REQUEST);
  }

  // Verify reset token
  let decoded;
  try {
    decoded = verifyPasswordResetToken(Token);
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Password reset token has expired. Please request a new one.', StatusCodes.BAD_REQUEST);
    }
    throw new AppError('Invalid or expired password reset token', StatusCodes.BAD_REQUEST);
  }

  // Find user
  const user = await User.findByPk(decoded.userId);
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }

  // Hash new password
  const PasswordHash = await hashPassword(Password);

  // Update password
  user.PasswordHash = PasswordHash;
  await user.save();

  // Send confirmation email
  try {
    await sendPasswordResetConfirmation(
      user.Email,
      `${user.FirstName} ${user.LastName}`
    );
  } catch (error) {
    console.error('Failed to send password reset confirmation email:', error);
    // Don't fail the request if email fails
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Password has been reset successfully. You can now login with your new password.'
  });
});

module.exports = {
  register,
  login,
  getProfile,
  logout,
  forgotPassword,
  resetPassword
};

