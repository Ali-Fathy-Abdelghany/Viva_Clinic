const { StatusCodes } = require('http-status-codes');
const { Appointment, DoctorWorkingHours} = require('../models');
const { Op } = require('sequelize');
const { AppError } = require('../middleware/errorHandler');

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

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


// Check if the appointment time is within the doctor's working hours
const checkWorkingHours = async (doctorId, appointmentDate, startTime, endTime) => {
  const dayIndex = new Date(appointmentDate).getDay();
  const dayName = DAY_NAMES[dayIndex];

  const workingHours = await DoctorWorkingHours.findOne({
    where: {
      DoctorID: doctorId,
      DayOfWeek: dayName
    }
  });

  if (!workingHours) return false;

  const workStart = workingHours.StartTime;
  const workEnd = workingHours.EndTime;

  return startTime >= workStart && endTime <= workEnd;
};


// Validate appointment booking
const validateAppointmentBooking = async (
  patientId,
  doctorId,
  appointmentDate,
  startTime,
  endTime,
  excludeAppointmentId = null
) => {
  // Check if patient already has an appointment at this time
  const patientWhere = {
    PatientID: patientId,
    AppointmentDate: appointmentDate,
    StartTime: startTime,
    EndTime: endTime,
    Status: { [Op.notIn]: ['Cancelled'] }
  };

  if (excludeAppointmentId) {
    patientWhere.AppointmentID = { [Op.ne]: excludeAppointmentId };
  }

  const patientConflict = await Appointment.findOne({ where: patientWhere });

  if (patientConflict) {
    throw new AppError(
      'You already have an appointment at this time',
      StatusCodes.BAD_REQUEST
    );
  }

  // Check doctor availability (exclude same appointment when rescheduling)
  const doctorConflict = await checkAppointmentConflict(
    doctorId,
    appointmentDate,
    startTime,
    endTime,
    excludeAppointmentId
  );

  if (doctorConflict) {
    throw new AppError(
      'Doctor is not available at this time',
      StatusCodes.BAD_REQUEST
    );
  }

  // Check working hours
  const withinWorkingHours = await checkWorkingHours(
    doctorId,
    appointmentDate,
    startTime,
    endTime
  );

  if (!withinWorkingHours) {
    throw new AppError(
      'Appointment time is outside doctor working hours',
      StatusCodes.BAD_REQUEST
    );
  }

  // Check if appointment is in the past
  const appointmentDateTime = new Date(`${appointmentDate}T${startTime}`);
  if (appointmentDateTime < new Date()) {
    throw new AppError(
      'Cannot book appointments in the past',
      StatusCodes.BAD_REQUEST
    );
  }

  return true;
};

// Get available time slots for a doctor on a specific date
const getAvailableTimeSlots = async (doctorId, date, slotDuration = 30) => {
  const dayIndex = new Date(date).getDay();
  const dayName = DAY_NAMES[dayIndex];

  const workingHours = await DoctorWorkingHours.findOne({
    where: {
      DoctorID: doctorId,
      DayOfWeek: dayName
    }
  });

  if (!workingHours) return [];

  const { StartTime, EndTime } = workingHours;

  const start = new Date(`${date}T${StartTime}`);
  const end = new Date(`${date}T${EndTime}`);

  const slots = [];

  let slotStart = new Date(start);

  while (slotStart < end) {
    let slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);

    if (slotEnd > end) break;

    const conflict = await Appointment.findOne({
      where: {
        DoctorID: doctorId,
        AppointmentDate: date,
        [Op.or]: [
          {
            StartTime: { [Op.lt]: slotEnd.toTimeString().slice(0, 8) },
            EndTime: { [Op.gt]: slotStart.toTimeString().slice(0, 8) }
          }
        ],
        Status: { [Op.notIn]: ["Cancelled"] }
      }
    });

    if (!conflict) {
      slots.push({
        startTime: slotStart.toTimeString().slice(0, 5),
        endTime: slotEnd.toTimeString().slice(0, 5)
      });
    }

    slotStart = new Date(slotStart.getTime() + slotDuration * 60000);
  }

  return slots;
};
const getAvailableTimeSlotsAllWeek = async (doctorId, slotDuration = 30) => {
    const availableSlots = {};
    for (let i = 0; i < 7; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        const dateString = date.toISOString().split('T')[0];
        const dateDayIndex = date.getDay();
        const dayName = DAY_NAMES[dateDayIndex];
        const slots = await getAvailableTimeSlots(doctorId, dateString, slotDuration);
        availableSlots[dayName] = slots;
    }
    return availableSlots;
};


module.exports = {
  checkAppointmentConflict,
  checkWorkingHours,
  validateAppointmentBooking,
  getAvailableTimeSlots,
  getAvailableTimeSlotsAllWeek
};

