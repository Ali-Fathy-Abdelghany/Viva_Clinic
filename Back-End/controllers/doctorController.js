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
const updateProfilePicture = asyncHandler(async (req, res) => {
    const userId = req.params.id || req.userId;

    // Multer ensures req.file exists

    if (!req.file) {
        throw new AppError("No image file uploaded", StatusCodes.BAD_REQUEST);
    }

    // Build full URL for image (served from /uploads)
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
    }`;
    // Get patient record
    const doctor = await Doctor.findByPk(userId);
    if (!doctor) {
        throw new AppError("Doctor not found", StatusCodes.NOT_FOUND);
    }

    // Update image url and delete old file
    const oldImageUrl = doctor.Image_url;
    doctor.Image_url = imageUrl;
    if (oldImageUrl) {
        const oldImagePath = path.join(__dirname, "..", "uploads", path.basename(oldImageUrl));
        fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
        });
    }

    await doctor.save();

    // Fetch updated data in SAME FORMAT as full profile
    const updatedDoctor = await User.findByPk(userId, {
        attributes: { exclude: ["PasswordHash"] },
        include: [{ model: Doctor, as: "doctorInfo" }],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Profile picture updated successfully",
        data: { doctor: updatedDoctor },
    });
});
module.exports = {
    getDoctors,
    getDoctor,
    getDoctorAvailability,
    getDoctorAppointments,
    updateDoctorProfile,
    updateProfilePicture
};
