const { StatusCodes } = require('http-status-codes');
const { User, Doctor, Specialty, DoctorWorkingHours, Appointment, Patient } = require('../models');
const { Op } = require('sequelize');
const { asyncHandler, AppError } = require('../middleware/errorHandler');
const { hashPassword } = require('../utils/passwordUtils');

// ========== Doctor Management ==========

// Create doctor
const createDoctor = asyncHandler(async (req, res) => {
  const { FirstName, LastName, Email, Password, Phone, SpecialtyID, Bio } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ where: { Email } });
  if (existingUser) {
    throw new AppError('User with this email already exists', StatusCodes.BAD_REQUEST);
  }

  // Verify specialty exists
  const specialty = await Specialty.findByPk(SpecialtyID);
  if (!specialty) {
    throw new AppError('Specialty not found', StatusCodes.NOT_FOUND);
  }

  // Hash password
  const PasswordHash = await hashPassword(Password);

  // Create user with Doctor role
  const user = await User.create({
    FirstName,
    LastName,
    Email,
    PasswordHash,
    Phone,
    Role: 'Doctor'
  });

  // Create doctor profile
  const doctor = await Doctor.create({
    DoctorID: user.UserID,
    SpecialtyID,
    Bio
  });

  const doctorWithDetails = await Doctor.findByPk(doctor.DoctorID, {
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

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Doctor created successfully',
    data: { doctor: doctorWithDetails }
  });
});

// Update doctor
const updateDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { FirstName, LastName, Email, Phone, SpecialtyID, Bio, isActive } = req.body;

  const doctor = await Doctor.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  // Update user info
  if (FirstName) doctor.user.FirstName = FirstName;
  if (LastName) doctor.user.LastName = LastName;
  if (Email) {
    const emailExists = await User.findOne({ where: { Email, UserID: { [Op.ne]: id } } });
    if (emailExists) {
      throw new AppError('Email already in use', StatusCodes.BAD_REQUEST);
    }
    doctor.user.Email = Email;
  }
  if (Phone !== undefined) doctor.user.Phone = Phone;
  if (isActive !== undefined) doctor.user.isActive = isActive;
  await doctor.user.save();

  // Update doctor info
  if (SpecialtyID) {
    const specialty = await Specialty.findByPk(SpecialtyID);
    if (!specialty) {
      throw new AppError('Specialty not found', StatusCodes.NOT_FOUND);
    }
    doctor.SpecialtyID = SpecialtyID;
  }
  if (Bio !== undefined) doctor.Bio = Bio;
  await doctor.save();

  const updatedDoctor = await Doctor.findByPk(id, {
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
    message: 'Doctor updated successfully',
    data: { doctor: updatedDoctor }
  });
});

// Delete doctor (soft delete)
const deleteDoctor = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const doctor = await Doctor.findByPk(id, {
    include: [{ model: User, as: 'user' }]
  });

  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  // Soft delete
  doctor.user.isActive = false;
  await doctor.user.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Doctor deactivated successfully'
  });
});

// ========== Patient Management ==========

// Get all patients
const getPatients = asyncHandler(async (req, res) => {
  const { search } = req.query;

  const whereClause = { Role: 'Patient' };
  if (search) {
    whereClause[Op.or] = [
      { FirstName: { [Op.like]: `%${search}%` } },
      { LastName: { [Op.like]: `%${search}%` } },
      { Email: { [Op.like]: `%${search}%` } }
    ];
  }

  const patients = await User.findAll({
    where: whereClause,
    attributes: { exclude: ['PasswordHash'] },
    include: [
      {
        model: Patient,
        as: 'patientInfo'
      }
    ],
    order: [['createdAt', 'DESC']]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    count: patients.length,
    data: { patients }
  });
});

// Update patient (admin can update user info but not medical records)
const updatePatient = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { FirstName, LastName, Email, Phone, isActive } = req.body;

  const user = await User.findByPk(id);
  if (!user || user.Role !== 'Patient') {
    throw new AppError('Patient not found', StatusCodes.NOT_FOUND);
  }

  if (FirstName) user.FirstName = FirstName;
  if (LastName) user.LastName = LastName;
  if (Email) {
    const emailExists = await User.findOne({ where: { Email, UserID: { [Op.ne]: id } } });
    if (emailExists) {
      throw new AppError('Email already in use', StatusCodes.BAD_REQUEST);
    }
    user.Email = Email;
  }
  if (Phone !== undefined) user.Phone = Phone;
  if (isActive !== undefined) user.isActive = isActive;

  await user.save();

  const updatedPatient = await User.findByPk(id, {
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
    message: 'Patient updated successfully',
    data: { patient: updatedPatient }
  });
});

// ========== Specialty Management ==========

// Get all specialties
const getSpecialties = asyncHandler(async (req, res) => {
  const specialties = await Specialty.findAll({
    order: [['Name', 'ASC']]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    count: specialties.length,
    data: { specialties }
  });
});

// Create specialty
const createSpecialty = asyncHandler(async (req, res) => {
  const { Name, Description } = req.body;

  const specialty = await Specialty.create({
    Name,
    Description
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Specialty created successfully',
    data: { specialty }
  });
});

// Update specialty
const updateSpecialty = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { Name, Description } = req.body;

  const specialty = await Specialty.findByPk(id);
  if (!specialty) {
    throw new AppError('Specialty not found', StatusCodes.NOT_FOUND);
  }

  if (Name) specialty.Name = Name;
  if (Description !== undefined) specialty.Description = Description;

  await specialty.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Specialty updated successfully',
    data: { specialty }
  });
});

// Delete specialty
const deleteSpecialty = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const specialty = await Specialty.findByPk(id);
  if (!specialty) {
    throw new AppError('Specialty not found', StatusCodes.NOT_FOUND);
  }

  // Check if any doctors use this specialty
  const doctorsCount = await Doctor.count({ where: { SpecialtyID: id } });
  if (doctorsCount > 0) {
    throw new AppError('Cannot delete specialty. It is assigned to doctors.', StatusCodes.BAD_REQUEST);
  }

  await specialty.destroy();

  res.status(StatusCodes.NO_CONTENT).json({
    success: true,
    message: 'Specialty deleted successfully'
  });
});

// ========== Working Hours Management ==========

// Set doctor working hours
const setDoctorWorkingHours = asyncHandler(async (req, res) => {
  const { doctorId } = req.params;
  const { workingHours } = req.body; // Array of { DayOfWeek, StartTime, EndTime }

  const doctor = await Doctor.findByPk(doctorId);
  if (!doctor) {
    throw new AppError('Doctor not found', StatusCodes.NOT_FOUND);
  }

  // Delete existing working hours
  await DoctorWorkingHours.destroy({ where: { DoctorID: doctorId } });

  // Create new working hours
  const createdHours = await DoctorWorkingHours.bulkCreate(
    workingHours.map(hour => ({
      DoctorID: doctorId,
      DayOfWeek: hour.DayOfWeek,
      StartTime: hour.StartTime,
      EndTime: hour.EndTime
    }))
  );

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Working hours updated successfully',
    data: { workingHours: createdHours }
  });
});

// ========== Reports ==========

// Get daily appointment schedule
const getDailySchedule = asyncHandler(async (req, res) => {
  const { date } = req.query;
  const targetDate = date || new Date().toISOString().split('T')[0];

  const appointments = await Appointment.findAll({
    where: {
      AppointmentDate: targetDate,
      Status: { [Op.notIn]: ['Cancelled'] }
    },
    include: [
      {
        model: User,
        as: 'patient',
        attributes: ['FirstName', 'LastName', 'Phone']
      },
      {
        model: Doctor,
        as: 'doctor',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['FirstName', 'LastName']
          },
          {
            model: Specialty,
            as: 'specialty',
            attributes: ['Name']
          }
        ]
      }
    ],
    order: [['StartTime', 'ASC']]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      date: targetDate,
      count: appointments.length,
      appointments
    }
  });
});

// Get weekly appointment summary
const getWeeklySummary = asyncHandler(async (req, res) => {
  const { startDate } = req.query;
  const start = new Date(startDate || new Date());
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  end.setHours(23, 59, 59, 999);

  const appointments = await Appointment.findAll({
    where: {
      AppointmentDate: {
        [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
      }
    },
    include: [
      {
        model: Doctor,
        as: 'doctor',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['FirstName', 'LastName']
          }
        ]
      }
    ]
  });

  // Group by status
  const summary = {
    total: appointments.length,
    booked: appointments.filter(a => a.Status === 'Booked').length,
    completed: appointments.filter(a => a.Status === 'Completed').length,
    cancelled: appointments.filter(a => a.Status === 'Cancelled').length,
    rescheduled: appointments.filter(a => a.Status === 'Rescheduled').length,
    byDay: {}
  };

  // Group by day
  appointments.forEach(apt => {
    const day = apt.AppointmentDate;
    if (!summary.byDay[day]) {
      summary.byDay[day] = 0;
    }
    summary.byDay[day]++;
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      summary
    }
  });
});

// Get doctor workload statistics
const getDoctorWorkload = asyncHandler(async (req, res) => {
  const { doctorId, startDate, endDate } = req.query;

  const start = startDate || new Date(new Date().setDate(new Date().getDate() - 30));
  const end = endDate || new Date();

  const whereClause = {
    AppointmentDate: {
      [Op.between]: [start.toISOString().split('T')[0], end.toISOString().split('T')[0]]
    }
  };

  if (doctorId) {
    whereClause.DoctorID = doctorId;
  }

  const appointments = await Appointment.findAll({
    where: whereClause,
    include: [
      {
        model: Doctor,
        as: 'doctor',
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['FirstName', 'LastName']
          }
        ]
      }
    ]
  });

  // Group by doctor
  const workload = {};
  appointments.forEach(apt => {
    const docId = apt.DoctorID;
    if (!workload[docId]) {
      workload[docId] = {
        doctorId: docId,
        doctorName: `${apt.doctor.user.FirstName} ${apt.doctor.user.LastName}`,
        total: 0,
        completed: 0,
        cancelled: 0
      };
    }
    workload[docId].total++;
    if (apt.Status === 'Completed') workload[docId].completed++;
    if (apt.Status === 'Cancelled') workload[docId].cancelled++;
  });

  res.status(StatusCodes.OK).json({
    success: true,
    data: {
      period: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      },
      workload: Object.values(workload)
    }
  });
});

module.exports = {
  // Doctor Management
  createDoctor,
  updateDoctor,
  deleteDoctor,
  // Patient Management
  getPatients,
  updatePatient,
  // Specialty Management
  getSpecialties,
  createSpecialty,
  updateSpecialty,
  deleteSpecialty,
  // Working Hours
  setDoctorWorkingHours,
  // Reports
  getDailySchedule,
  getWeeklySummary,
  getDoctorWorkload
};

