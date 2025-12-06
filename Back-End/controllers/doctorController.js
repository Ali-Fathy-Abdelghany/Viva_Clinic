const { StatusCodes } = require("http-status-codes");
const {
    Patient,
    User,
    Doctor,
    Specialty,
    DoctorWorkingHours,
    Appointment,
    Certification,
    Award
} = require("../models");
const { Op } = require("sequelize");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const { getAvailableTimeSlots ,getAvailableTimeSlotsAllWeek} = require("../services/appointmentService");

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
                as: "user",
                attributes: ["FirstName", "LastName", "Email", "Phone"],
                where: search
                    ? {
                          [Op.or]: [
                              { FirstName: { [Op.like]: `%${search}%` } },
                              { LastName: { [Op.like]: `%${search}%` } },
                          ],
                      }
                    : undefined,
            },
            {
                model: Specialty,
                as: "specialty",
                attributes: ["Name", "Description"],
            },
            {
                model: DoctorWorkingHours,
                as: "workingHours",
                attributes: ["DayOfWeek", "StartTime", "EndTime"],
            },
            {
                model: Certification,
                as: "doctorCertifications",
                attributes  : ["Title", "Description"],
            },
            {
                model: Award,
                as: "doctorAwards",
                attributes: ["Award_name", "Award_description"],
            }
        ],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: doctors.length,
        data: { doctors },
    });
});

// Get single doctor
const getDoctor = asyncHandler(async (req, res) => {
    const { id } = req.params;

    const doctor = await Doctor.findByPk(id, {
        include: [
            {
                model: User,
                as: "user",
                attributes: { exclude: ["PasswordHash"] },
            },
            {
                model: Specialty,
                as: "specialty",
            },
            {
                model: DoctorWorkingHours,
                as: "workingHours",
                order: [["DayOfWeek", "ASC"]],
            },
            {
                model: Certification,
                as: "doctorCertifications",
            },
            {
                model: Award,
                as: "doctorAwards",
            }
        ],
    });

    if (!doctor) {
        throw new AppError("Doctor not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: { doctor },
    });
});

// Get doctor's available time slots
const getDoctorAvailability = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { date } = req.query;


    const doctor = await Doctor.findByPk(id);
    if (!doctor) {
        throw new AppError("Doctor not found", StatusCodes.NOT_FOUND);
    }

    const timeSlots = date ? await getAvailableTimeSlots(id, date) : await getAvailableTimeSlotsAllWeek(id);

    res.status(StatusCodes.OK).json({
        success: true,
        data: {
            doctorId: id,
            date,
            availableSlots: timeSlots,
        },
    });
});

// Get doctor's appointments
const getDoctorAppointments = asyncHandler(async (req, res) => {
    const doctorId = req.userRole == "Doctor" ? req.userId : req.params.id;
    const { status, date } = req.query;

    const whereClause = { DoctorID: doctorId };
    if (status) whereClause.Status = status;
    if (date) whereClause.AppointmentDate = date;

    const appointments = await Appointment.findAll({
        where: whereClause,
        include: [
            {
                model: Patient,
                as: "patient",
                attributes: ["DateOfBirth", "Gender", "BloodType"],
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["FirstName", "LastName", "Email", "Phone"],
                    },
                ],
            },
        ],
        order: [
            ["AppointmentDate", "ASC"],
            ["StartTime", "ASC"],
        ],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: appointments.length,
        data: { appointments },
    });
});

// Update doctor profile
const updateDoctorProfile = asyncHandler(async (req, res) => {
    const doctorId = req.userId;
    const { Bio, SpecialtyID, Gender ,Image_url,Fee,Education,YearsOfExperience, Awards, Certifications } = req.body;

    const doctor = await Doctor.findByPk(doctorId);
    if (!doctor) {
        throw new AppError("Doctor profile not found", StatusCodes.NOT_FOUND);
    }

    if (Bio) doctor.Bio = Bio;
    if (SpecialtyID) {
        const specialty = await Specialty.findByPk(SpecialtyID);
        if (!specialty) {
            throw new AppError("Specialty not found", StatusCodes.NOT_FOUND);
        }
        doctor.SpecialtyID = SpecialtyID;
    }
    if (Gender) doctor.Gender = Gender;
    if (Image_url) doctor.Image_url = Image_url;
    if (Fee) doctor.Fee = Fee;
    if (Education) doctor.Education = Education;
    if (YearsOfExperience) doctor.YearsOfExperience = YearsOfExperience;
    if (Awards) await Award.bulkCreate(Awards.map(award => ({ DoctorID: doctorId,Award_name: award.name,Award_description: award.description })));
    if (Certifications) await Certification.bulkCreate(Certifications.map(certification => ({ DoctorID: doctorId, Title: certification.name ,Description: certification.description })));
    await doctor.save();

    const updatedDoctor = await Doctor.findByPk(doctorId, {
        include: [
            {
                model: User,
                as: "user",
                attributes: { exclude: ["PasswordHash"] },
            },
            {
                model: Specialty,
                as: "specialty",
            },
        ],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Doctor profile updated successfully",
        data: { doctor: updatedDoctor },
    });
});

module.exports = {
    getDoctors,
    getDoctor,
    getDoctorAvailability,
    getDoctorAppointments,
    updateDoctorProfile,
};
