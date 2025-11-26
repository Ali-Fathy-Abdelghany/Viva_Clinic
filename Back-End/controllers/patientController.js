const { StatusCodes } = require('http-status-codes');
const { User, Patient } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Get patient profile
const getPatientProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const userRole = req.userRole;
  const requestedPatientId = req.params.id || userId;

  // Check permissions
  if (userRole === 'Patient' && requestedPatientId != userId) {
    throw new AppError('Access denied. You can only view your own profile.', StatusCodes.FORBIDDEN);
  }

  const patient = await User.findByPk(requestedPatientId, {
    attributes: { exclude: ['PasswordHash'] },
    include: [
      {
        model: Patient,
        as: 'patientInfo',
        required: true
      }
    ]
  });

  if (!patient || !patient.patientInfo) {
    throw new AppError('Patient not found', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: { patient }
  });
});

// Update patient profile
const updatePatientProfile = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const userRole = req.userRole;
  const requestedPatientId = req.params.id || userId;
  const { DateOfBirth, Gender, Address, BloodType, ChronicDisease, FirstName, LastName, Phone } = req.body;

  // Check permissions
  if (userRole === 'Patient' && requestedPatientId != userId) {
    throw new AppError('Access denied. You can only update your own profile.', StatusCodes.FORBIDDEN);
  }

  const user = await User.findByPk(requestedPatientId);
  if (!user) {
    throw new AppError('User not found', StatusCodes.NOT_FOUND);
  }

  // Update user info
  if (FirstName) user.FirstName = FirstName;
  if (LastName) user.LastName = LastName;
  if (Phone) user.Phone = Phone;
  await user.save();

  // Update or create patient info
  let patient = await Patient.findByPk(requestedPatientId);
  if (!patient) {
    patient = await Patient.create({ PatientID: requestedPatientId });
  }

  if (DateOfBirth !== undefined) patient.DateOfBirth = DateOfBirth;
  if (Gender !== undefined) patient.Gender = Gender;
  if (Address !== undefined) patient.Address = Address;
  if (BloodType !== undefined) patient.BloodType = BloodType;
  if (ChronicDisease !== undefined) patient.ChronicDisease = ChronicDisease;

  await patient.save();

  // Fetch updated patient
  const updatedPatient = await User.findByPk(requestedPatientId, {
    attributes: { exclude: ['PasswordHash'] },
    include: [
      {
        model: Patient,
        as: 'patientInfo'
      }
    ]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Patient profile updated successfully',
    data: { patient: updatedPatient }
  });
});

// Get patient medical records
const getPatientMedicalRecords = asyncHandler(async (req, res) => {
  const userId = req.userId;
  const userRole = req.userRole;
  const requestedPatientId = req.params.id || userId;

  // Check permissions
  if (userRole === 'Patient' && requestedPatientId != userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  const { MedicalRecord } = require('../models');
  const medicalRecords = await MedicalRecord.findAll({
    where: { PatientID: requestedPatientId },
    include: [
      {
        model: require('../models/Appointment'),
        as: 'appointment',
        include: [
          {
            model: require('../models/Doctor'),
            as: 'doctor',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['FirstName', 'LastName']
              },
              {
                model: require('../models/Specialty'),
                as: 'specialty',
                attributes: ['Name']
              }
            ]
          }
        ]
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    count: medicalRecords.length,
    data: { medicalRecords }
  });
});

module.exports = {
  getPatientProfile,
  updatePatientProfile,
  getPatientMedicalRecords
};

