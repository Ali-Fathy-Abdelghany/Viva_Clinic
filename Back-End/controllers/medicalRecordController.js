const { StatusCodes } = require('http-status-codes');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { sendPrescriptionUpdate } = require('../services/notificationService');
const { MedicalRecord, Appointment, Patient,User } = require('../models');

// Create medical record
const createMedicalRecord = asyncHandler(async (req, res) => {
  const { AppointmentID, Diagnosis, Notes, Prescription,Drug } = req.body;
  const doctorId = req.userId;

  // Verify appointment exists and belongs to this doctor
  const appointment = await Appointment.findByPk(AppointmentID);
  if (!appointment) {
    throw new AppError('Appointment not found', StatusCodes.NOT_FOUND);
  }

  if (appointment.DoctorID !== doctorId) {
    throw new AppError('You can only create medical records for your own appointments', StatusCodes.FORBIDDEN);
  }

  if (appointment.Status !== 'Completed') {
    throw new AppError('Appointment must be completed before creating a medical record', StatusCodes.BAD_REQUEST);
  }

  // Check if record already exists
  const existingRecord = await MedicalRecord.findOne({ where: { AppointmentID } });
  if (existingRecord) {
    console.log(existingRecord);
    throw new AppError('Medical record already exists for this appointment', StatusCodes.BAD_REQUEST);
  }

  // Create medical record
  const medicalRecord = await MedicalRecord.create({
    AppointmentID,
    PatientID: appointment.PatientID,
    DoctorID: doctorId,
    Diagnosis,
    Notes,
    Prescription,
    Drug
  });

  // Fetch with related data
  const recordWithDetails = await MedicalRecord.findByPk(medicalRecord.RecordID, {
    include: [
      {
        model: Appointment,
        as: 'appointment'
      },
      {
        model: Patient,
        as: 'patient',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['FirstName', 'LastName', 'Email']
          }
        ]
      }
    ]
  });

  // Send prescription update notification if prescription exists
  if (Prescription) {
    try {
      await sendPrescriptionUpdate(
        recordWithDetails.patient.Email,
        `${recordWithDetails.patient.FirstName} ${recordWithDetails.patient.LastName}`,
        {
          prescription: Prescription
        }
      );
    } catch (error) {
      console.error('Failed to send prescription notification:', error);
    }
  }

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Medical record created successfully',
    data: { medicalRecord: recordWithDetails }
  });
});

// Get medical record
const getMedicalRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  const medicalRecord = await MedicalRecord.findByPk(id, {
    include: [
      {
        model: Appointment,
        as: 'appointment',
        include: [
          {
            model: require('../models/Doctor'),
            as: 'doctor',
            include: [
              {
                model: require('../models/User'),
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
    ]
  });

  // if (!medicalRecord) {
  //   throw new AppError('Medical record not found', StatusCodes.NOT_FOUND);
  // }

  // Check permissions
  if (userRole === 'Patient' && medicalRecord.PatientID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }
  // if (userRole === 'Doctor' && medicalRecord.DoctorID !== userId) {
  //   throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  // }

  res.status(StatusCodes.OK).json({
    success: true,
    data: { medicalRecord }
  });
});

// Update medical record
const updateMedicalRecord = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const {  Diagnosis, Notes, Prescription,Drug } = req.body;
  const doctorId = req.userId;

  const medicalRecord = await MedicalRecord.findByPk(id);
  if (!medicalRecord) {
    throw new AppError('Medical record not found', StatusCodes.NOT_FOUND);
  }

  if (medicalRecord.DoctorID !== doctorId) {
    throw new AppError('You can only update your own medical records', StatusCodes.FORBIDDEN);
  }

  if (Diagnosis ) medicalRecord.Diagnosis = Diagnosis;
  if (Notes) medicalRecord.Notes = Notes;
  if (Prescription ) medicalRecord.Prescription = Prescription;
  if (Drug ) medicalRecord.Drug = Drug;
  await medicalRecord.save();

  // Send notification if prescription was updated
  if (Prescription) {
    try {
      const recordWithPatient = await MedicalRecord.findByPk(id, {
        include: [
          {
            model: Patient,
            as: 'patient',
            include: [
              {
                model: User,
                as: 'user',
                attributes: ['FirstName', 'LastName', 'Email']
              }
            ]
          }
        ]
      });

      await sendPrescriptionUpdate(
        recordWithPatient.patient.Email,
        `${recordWithPatient.patient.FirstName} ${recordWithPatient.patient.LastName}`,
        {
          prescription: Prescription
        }
      );
    } catch (error) {
      console.error('Failed to send prescription notification:', error);
    }
  }

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Medical record updated successfully',
    data: { medicalRecord }
  });
});

module.exports = {
  createMedicalRecord,
  getMedicalRecord,
  updateMedicalRecord
};

