const { StatusCodes } = require('http-status-codes');
const { body, param, query, validationResult } = require('express-validator');

// Validation result handler
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// User validation rules
const validateUserRegistration = [
  body('FirstName').trim().notEmpty().withMessage('First name is required'),
  body('LastName').trim().notEmpty().withMessage('Last name is required'),
  body('Email').isEmail().withMessage('Please provide a valid email'),
  body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('ConfirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.Password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  body('Phone').optional().isMobilePhone().withMessage('Please provide a valid phone number'),
  body('Role').optional().isIn(['Patient', 'Doctor', 'Admin']).withMessage('Invalid role'),
  validate
];

const validateUserLogin = [
  body('Email').isEmail().withMessage('Please provide a valid email'),
  body('Password').notEmpty().withMessage('Password is required'),
  validate
];

// Forgot password validation
const validateForgotPassword = [
  body('Email').isEmail().withMessage('Please provide a valid email'),
  validate
];

// Reset password validation
const validateResetPassword = [
  body('Token').notEmpty().withMessage('Reset token is required'),
  body('Password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('ConfirmPassword')
    .notEmpty().withMessage('Confirm password is required')
    .custom((value, { req }) => {
      if (value !== req.body.Password) {
        throw new Error('Passwords do not match');
      }
      return true;
    }),
  validate
];

// Patient validation rules
const validatePatientProfile = [
  body('DateOfBirth').optional().isISO8601().withMessage('Invalid date format enter as YYYY-MM-DD'),
  body('Gender').optional().isIn(['F', 'M']).withMessage('Gender must be F or M'),
  body('Address').optional().trim(),
  body('BloodType').optional().trim(),
  // ChronicDisease may be a string or an array of strings (from checkbox inputs)
  body('ChronicDisease').optional().custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') return true;
    throw new Error('ChronicDisease must be a string or array');
  }),
  // Allergies may be a string or an array of strings (from checkbox inputs)
  body('Allergies').optional().custom((value) => {
    if (Array.isArray(value)) return true;
    if (typeof value === 'string') return true;
    throw new Error('Allergies must be a string or array');
  }),
  validate
];

// Appointment validation rules
const validateAppointmentBooking = [
  body('DoctorID').isInt().withMessage('Doctor ID must be a valid integer'),
  body('AppointmentDate').isISO8601().withMessage('Invalid date format'),
  body('StartTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format (HH:MM)'),
  validate
];

const validateAppointmentUpdate = [
  body('Status').optional().isIn(['Booked', 'Cancelled', 'Rescheduled', 'Completed']).withMessage('Invalid status'),
  body('AppointmentDate').optional().isISO8601().withMessage('Invalid date format'),
  body('StartTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('EndTime').optional().matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  validate
];

// Medical Record validation rules
const validateMedicalRecord = [
  body('AppointmentID').isInt().withMessage('Appointment ID must be a valid integer'),
  body('Diagnosis').optional().trim(),
  body('Notes').optional().trim(),
  body('Prescription').optional().trim(),
  validate
];

// Doctor validation rules
const validateDoctorProfile = [
  body('SpecialtyID').optional().isInt().withMessage('Specialty ID must be a valid integer'),
  body('Bio').optional().trim(),
  body('Gender').optional().isIn(['M','F']).withMessage('Gender must be F or M'),
  validate
];

const validateWorkingHours = [
  body('DoctorID').isInt().withMessage('Doctor ID must be a valid integer'),
  body('DayOfWeek').isIn(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']).withMessage('Day of week must be one of Monday, Tuesday, Wednesday, Thursday, Friday, Saturday, Sunday'),
  body('StartTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  body('EndTime').matches(/^([0-1][0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Invalid time format'),
  validate
];

// ID parameter validation
const validateId = [
  param('id').isInt().withMessage('ID must be a valid integer'),
  validate
];

module.exports = {
  validate,
  validateUserRegistration,
  validateUserLogin,
  validateForgotPassword,
  validateResetPassword,
  validatePatientProfile,
  validateAppointmentBooking,
  validateAppointmentUpdate,
  validateMedicalRecord,
  validateDoctorProfile,
  validateWorkingHours,
  validateId
};

