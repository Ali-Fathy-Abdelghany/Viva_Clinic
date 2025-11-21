const { StatusCodes } = require('http-status-codes');
const { Appointment, Doctor, DoctorWorkingHours, User, Specialty } = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

// Check if appointment time conflicts with existing appointments
const checkAppointmentConflict = async (doctorId, appointmentDate, startTime, endTime, excludeAppointmentId = null) => {
  const whereClause = {
    DoctorID: doctorId,
    AppointmentDate: appointmentDate,
    Status: {
      [Op.notIn]: ['Cancelled']
    },
    [Op.or]: [
      {
        [Op.and]: [
          { StartTime: { [Op.lte]: startTime } },
          { EndTime: { [Op.gt]: startTime } }
        ]
      },
      {
        [Op.and]: [
          { StartTime: { [Op.lt]: endTime } },
          { EndTime: { [Op.gte]: endTime } }
        ]
      },
      {
        [Op.and]: [
          { StartTime: { [Op.gte]: startTime } },
          { EndTime: { [Op.lte]: endTime } }
        ]
      }
    ]
  };

  if (excludeAppointmentId) {
    whereClause.AppointmentID = { [Op.ne]: excludeAppointmentId };
  }

  const conflictingAppointment = await Appointment.findOne({ where: whereClause });
  return conflictingAppointment !== null;
};

// Check if appointment time is within doctor's working hours
const checkWorkingHours = async (doctorId, appointmentDate, startTime, endTime) => {
  const dayOfWeek = new Date(appointmentDate).getDay();
  
  const workingHours = await DoctorWorkingHours.findOne({
    where: {
      DoctorID: doctorId,
      DayOfWeek: dayOfWeek
    }
  });

  if (!workingHours) {
    return false;
  }

  const workStart = workingHours.StartTime;
  const workEnd = workingHours.EndTime;

  return startTime >= workStart && endTime <= workEnd;
};

// Validate appointment booking
const validateAppointmentBooking = async (patientId, doctorId, appointmentDate, startTime, endTime) => {
  // Check if patient already has an appointment at this time
  const patientConflict = await Appointment.findOne({
    where: {
      PatientID: patientId,
      AppointmentDate: appointmentDate,
      StartTime: startTime,
      EndTime: endTime,
      Status: { [Op.notIn]: ['Cancelled'] }
    }
  });

  if (patientConflict) {
    throw new AppError('You already have an appointment at this time', StatusCodes.BAD_REQUEST);
  }

  // Check doctor availability
  const doctorConflict = await checkAppointmentConflict(doctorId, appointmentDate, startTime, endTime);
  if (doctorConflict) {
    throw new AppError('Doctor is not available at this time', StatusCodes.BAD_REQUEST);
  }

  // Check working hours
  const withinWorkingHours = await checkWorkingHours(doctorId, appointmentDate, startTime, endTime);
  if (!withinWorkingHours) {
    throw new AppError('Appointment time is outside doctor working hours', StatusCodes.BAD_REQUEST);
  }

  // Check if appointment is in the past
  const appointmentDateTime = new Date(`${appointmentDate}T${startTime}`);
  if (appointmentDateTime < new Date()) {
    throw new AppError('Cannot book appointments in the past', StatusCodes.BAD_REQUEST);
  }

  return true;
};

// Get available time slots for a doctor on a specific date
const getAvailableTimeSlots = async (doctorId, date, slotDuration = 30) => {
  const dayOfWeek = new Date(date).getDay();
  
  const workingHours = await DoctorWorkingHours.findOne({
    where: {
      DoctorID: doctorId,
      DayOfWeek: dayOfWeek
    }
  });

  if (!workingHours) {
    return [];
  }

  // Get existing appointments for the day
  const existingAppointments = await Appointment.findAll({
    where: {
      DoctorID: doctorId,
      AppointmentDate: date,
      Status: { [Op.notIn]: ['Cancelled'] }
    },
    order: [['StartTime', 'ASC']]
  });

  // Generate time slots
  const slots = [];
  const start = new Date(`${date}T${workingHours.StartTime}`);
  const end = new Date(`${date}T${workingHours.EndTime}`);

  let currentTime = new Date(start);
  while (currentTime < end) {
    const slotStart = new Date(currentTime);
    const slotEnd = new Date(currentTime.getTime() + slotDuration * 60000);

    if (slotEnd <= end) {
      // Check if slot conflicts with existing appointments
      const conflicts = existingAppointments.some(apt => {
        const aptStart = new Date(`${date}T${apt.StartTime}`);
        const aptEnd = new Date(`${date}T${apt.EndTime}`);
        return (slotStart < aptEnd && slotEnd > aptStart);
      });

      if (!conflicts) {
        slots.push({
          startTime: slotStart.toTimeString().slice(0, 5),
          endTime: slotEnd.toTimeString().slice(0, 5)
        });
      }
    }

    currentTime = new Date(currentTime.getTime() + slotDuration * 60000);
  }

  return slots;
};

module.exports = {
  checkAppointmentConflict,
  checkWorkingHours,
  validateAppointmentBooking,
  getAvailableTimeSlots
};

