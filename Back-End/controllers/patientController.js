const path = require("path");
const fs = require("fs");
const { StatusCodes } = require("http-status-codes");
const { User, Patient, Medical_info } = require("../models");
const { asyncHandler, AppError } = require("../middleware/errorHandler");

// Get patient profile
const getPatientProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const requestedPatientId = req.params.id || userId;

    // Check permissions
    if (userRole === "Patient" && requestedPatientId != userId) {
        throw new AppError(
            "Access denied. You can only view your own profile.",
            StatusCodes.FORBIDDEN
        );
    }

    const patient = await User.findByPk(requestedPatientId, {
        attributes: { exclude: ["PasswordHash"] },
        include: [
            {
                model: Patient,
                as: "patientInfo",
                required: true,
                include: [
                    {
                        model: Medical_info,
                            as: "patientMedicalInfo",
                            required: false,
                            attributes: ['PatientID','Name','InfoType'],
                    },
                ],
            },
        ],
    });

    if (!patient || !patient.patientInfo) {
        throw new AppError("Patient not found", StatusCodes.NOT_FOUND);
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: { patient },
    });
});

// Update patient profile
const updatePatientProfile = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const requestedPatientId = req.params.id || userId;
    const {
        DateOfBirth,
        Gender,
        Address,
        BloodType,
        ChronicDisease,
        Allergies,
        FirstName,
        LastName,
        Phone,
        Image_url,
    } = req.body;

    // Check permissions
    if (userRole === "Patient" && requestedPatientId != userId) {
        throw new AppError(
            "Access denied. You can only update your own profile.",
            StatusCodes.FORBIDDEN
        );
    }

    const user = await User.findByPk(requestedPatientId);
    if (!user) {
        throw new AppError("User not found", StatusCodes.NOT_FOUND);
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

    if (DateOfBirth) patient.DateOfBirth = DateOfBirth;
    if (Gender) patient.Gender = Gender;
    if (Address) patient.Address = Address;
    if (BloodType) patient.BloodType = BloodType;
    if (Image_url) patient.Image_url = Image_url;

    await patient.save();

    // Persist medical info entries (chronic illnesses & allergies)
    // Accept either a single string or an array from the frontend
    const chronicValues = Array.isArray(ChronicDisease)
        ? ChronicDisease
        : ChronicDisease
        ? [ChronicDisease]
        : [];
    const allergyValues = Array.isArray(Allergies)
        ? Allergies
        : Allergies
        ? [Allergies]
        : [];

    // Map frontend checkbox values to DB enum names
    const chronicMap = {
        diabetes: "Diabetes",
        hypertension: "Hypertension",
        asthma: "Asthma",
        other: "ChronicOther",
    };
    const allergyMap = {
        medication: "Medication",
        environmental: "Environmental",
        food: "Food",
        other: "AllergyOther",
    };

    // Remove existing medical_info entries for this patient and recreate
    await Medical_info.destroy({ where: { PatientID: requestedPatientId } });

    const toCreate = [];
    chronicValues.forEach((v) => {
        const name = chronicMap[v] || v;
        toCreate.push({
            PatientID: requestedPatientId,
            Name: name,
            InfoType: "ChronicDisease",
        });
    });
    allergyValues.forEach((v) => {
        const name = allergyMap[v] || v;
        toCreate.push({
            PatientID: requestedPatientId,
            Name: name,
            InfoType: "Allergy",
        });
    });

    if (toCreate.length) {
        await Medical_info.bulkCreate(toCreate);
    }

    // Fetch updated patient
    const updatedPatient = await User.findByPk(requestedPatientId, {
        attributes: { exclude: ["PasswordHash"] },
        include: [
            {
                model: Patient,
                as: "patientInfo",
                include: [
                    { model: Medical_info, as: 'patientMedicalInfo', attributes: ['PatientID','Name','InfoType'], required: false }
                ]
            },
        ],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Patient profile updated successfully",
        data: { patient: updatedPatient },
    });
});

// Get patient medical records
const getPatientMedicalRecords = asyncHandler(async (req, res) => {
    const userId = req.userId;
    const userRole = req.userRole;
    const requestedPatientId = req.params.id || userId;

    // Check permissions
    if (userRole === "Patient" && requestedPatientId != userId) {
        throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }

    const { MedicalRecord, Appointment } = require("../models");
    const medicalRecords = await MedicalRecord.findAll({
        where: { PatientID: requestedPatientId },
        include: [
            {
                model: Appointment,
                as: "appointment",
                include: [
                    {
                        model: require("../models/Doctor"),
                        as: "doctor",
                        include: [
                            {
                                model: User,
                                as: "user",
                                attributes: ["FirstName", "LastName"],
                            },
                            {
                                model: require("../models/Specialty"),
                                as: "specialty",
                                attributes: ["Name"],
                            },
                        ],
                    },
                ],
            },
        ],
        // Order by nested appointment date using nested include reference
        order: [
            [
                { model: Appointment, as: "appointment" },
                "AppointmentDate",
                "DESC",
            ],
        ],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: medicalRecords.length,
        data: { medicalRecords },
    });
});

const updateProfilePicture = asyncHandler(async (req, res) => {
    const userId = req.userId; // Logged in user
    const userRole = req.userRole;

    // Multer ensures req.file exists

    if (!req.file) {
        throw new AppError("No image file uploaded", StatusCodes.BAD_REQUEST);
    }

    // Build full URL for image (served from /uploads)
    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${
        req.file.filename
    }`;
    // Get patient record
    const patient = await Patient.findByPk(userId);
    if (!patient) {
        throw new AppError("Patient not found", StatusCodes.NOT_FOUND);
    }

    // Update image url and delete old file
    const oldImageUrl = patient.Image_url;
    patient.Image_url = imageUrl;
    if (oldImageUrl) {
        const oldImagePath = path.join(__dirname, "..", "uploads", path.basename(oldImageUrl));
        fs.unlink(oldImagePath, (err) => {
            if (err) console.error("Failed to delete old image:", err);
        });
    }

    await patient.save();

    // Fetch updated data in SAME FORMAT as full profile
    const updatedPatient = await User.findByPk(userId, {
        attributes: { exclude: ["PasswordHash"] },
        include: [{ model: Patient, as: "patientInfo" }],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Profile picture updated successfully",
        data: { patient: updatedPatient },
    });
});

module.exports = {
    getPatientProfile,
    updatePatientProfile,
    getPatientMedicalRecords,
    updateProfilePicture,
};
