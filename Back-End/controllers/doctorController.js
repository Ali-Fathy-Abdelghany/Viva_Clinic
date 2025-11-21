const { StatusCodes } = require('http-status-codes');
const { User, Doctor, Specialty, DoctorWorkingHours, Appointment } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { getAvailableTimeSlots } = require('../services/appointmentService');

// Get all doctors
const getDoctors = asyncHandler(async (req, res) => {
  const { specialtyId, search } = req.query;

  const whereClause = {};
  if (specialtyId) {
    whereClause.SpecialtyID = specialtyId;
  }

  const doctors = await Doctor.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['FirstName', 'LastName', 'Email', 'Phone'],
        where: search ? {
          [Op.or]: [
            { FirstName: { [Op.like]: `%${search}%` } },
            { LastName: { [Op.like]: `%${search}%` } }
          ]
        } : undefined
      },
      {
        model: Specialty,
        as: 'specialty',
        attributes: ['Name', 'Description']
      },
      {
        model: DoctorWorkingHours,
        as: 'workingHours',
        attributes: ['DayOfWeek', 'StartTime', 'EndTime']
      }
    ]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    count: doctors.length,
    data: { doctors }
  });
});

// Get single doctor
const getDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor = await Doctor.findByPk(id, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['PasswordHash'] }
      },
      {
        model: Specialty,
        as: 'specialty'
      },
      {
        model: DoctorWorkingHours,
        as: 'workingHours',
        order: [['DayOfWeek', 'ASC']]
      }
    ]
  });

  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: { doctor }
  });
});

// Get doctor's available time slots
const getDoctorAvailability = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { date } = req.query;

  if (!date) {
    throw new AppError('Date parameter is required', StatusCodes.BAD_REQUEST);
  }

  const doctor = await Doctor.findByPk(id);
  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  const timeSlots = await getAvailableTimeSlots(id, date);

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      doctorId: id,
      date,
      availableSlots: timeSlots
    }
  });
});

// Get doctor's appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
  const doctorId = req.userId;
  const { status, date } = req.query;

  const whereClause = { DoctorID: doctorId };
  if (status) whereClause.Status = status;
  if (date) whereClause.AppointmentDate = date;

  const appointments = await Appointment.findAll({
    where: whereClause,
    include: [
      {
        model: User,
        as: 'patient',
        attributes: ['FirstName', 'LastName', 'Email', 'Phone'],
        include: [
          {
            model: Patient,
            as: 'patientInfo',
            attributes: ['DateOfBirth', 'Gender', 'BloodType']
          }
        ]
      }
    ],
    order: [['AppointmentDate', 'ASC'], ['StartTime', 'ASC']]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    count: appointments.length,
    data: { appointments }
  });
});

// Update doctor profile
const updateDoctorProfile = asyncHandler(async (req, res) => {
  const doctorId = req.userId;
  const { Bio, SpecialtyID } = req.body;

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    throw new AppError('Doctor profile not found', StatusCodes.NOT_FOUND);
  }

  if (Bio !== undefined) doctor.Bio = Bio;
  if (SpecialtyID !== undefined) {
    const specialty = await Specialty.findByPk(SpecialtyID);
    if (!specialty) {
      throw new AppError('Specialty not found', StatusCodes.NOT_FOUND);
    }
    doctor.SpecialtyID = SpecialtyID;
  }

  await doctor.save();

  const updatedDoctor = await Doctor.findByPk(doctorId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: { exclude: ['PasswordHash'] }
      },
      {
        model: Specialty,
        as: 'specialty'
      }
    ]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Doctor profile updated successfully',
    data: { doctor: updatedDoctor }
  });
});

module.exports = {
  getDoctors,
  getDoctor,
  getDoctorAvailability,
  getDoctorAppointments,
  updateDoctorProfile
};

