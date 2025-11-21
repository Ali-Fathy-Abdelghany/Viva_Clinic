const { StatusCodes } = require("http-status-codes");
const { Appointment, User, Doctor, Specialty, Patient } = require("../models");
const { Op } = require("sequelize");
const { asyncHandler, AppError } = require("../middleware/errorHandler");
const {
    validateAppointmentBooking,
} = require("../services/appointmentService");
const {
    sendAppointmentConfirmation,
    sendAppointmentCancellation,
} = require("../services/notificationService");

// Book new appointment
const bookAppointment = asyncHandler(async (req, res) => {
    const { DoctorID, AppointmentDate, StartTime, EndTime, Notes } = req.body;
    const PatientID = req.userId;

    // Validate appointment booking
    await validateAppointmentBooking(
        PatientID,
        DoctorID,
        AppointmentDate,
        StartTime,
        EndTime
    );

    // Create appointment
    const appointment = await Appointment.create({
        PatientID,
        DoctorID,
        AppointmentDate,
        StartTime,
        EndTime,
        Status: "Booked",
        Notes,
    });

    // Fetch appointment with related data for email
    const appointmentWithDetails = await Appointment.findByPk(
        appointment.AppointmentID,
        {
            include: [
                {
                    model: User,
                    as: "patient",
                    attributes: ["FirstName", "LastName", "Email"],
                },
                {
                    model: Doctor,
                    as: "doctor",
                    include: [
                        {
                            model: User,
                            as: "user",
                            attributes: ["FirstName", "LastName"],
                        },
                        {
                            model: Specialty,
                            as: "specialty",
                            attributes: ["Name"],
                        },
                    ],
                },
            ],
        }
    );

    // Send confirmation email
    try {
        await sendAppointmentConfirmation(
            appointmentWithDetails.patient.Email,
            `${appointmentWithDetails.patient.FirstName} ${appointmentWithDetails.patient.LastName}`,
            {
                date: AppointmentDate,
                startTime: StartTime,
                endTime: EndTime,
                doctorName: `${appointmentWithDetails.doctor.user.FirstName} ${appointmentWithDetails.doctor.user.LastName}`,
                specialty:
                    appointmentWithDetails.doctor.specialty?.Name || "N/A",
            }
        );
    } catch (error) {
        console.error("Failed to send confirmation email:", error);
        // Don't fail the request if email fails
    }

    res.status(StatusCodes.CREATED).json({
        success: true,
        message: "Appointment booked successfully",
        data: { appointment: appointmentWithDetails },
    });
});

// Get all appointments (with filters)
const getAppointments = asyncHandler(async (req, res) => {
    const { status, date, doctorId, patientId } = req.query;
    const userId = req.userId;
    const userRole = req.userRole;

    const whereClause = {};

    // Role-based filtering
    if (userRole === "Patient") {
        whereClause.PatientID = userId;
    } else if (userRole === "Doctor") {
        whereClause.DoctorID = userId;
    } else if (userRole === "Admin") {
        // Admin can see all, but can filter
        if (patientId) whereClause.PatientID = patientId;
        if (doctorId) whereClause.DoctorID = doctorId;
    }

    if (status) {
        whereClause.Status = status;
    }

    if (date) {
        whereClause.AppointmentDate = date;
    }

    const appointments = await Appointment.findAll({
        where: whereClause,
        include: [
            {
                model: User,
                as: "patient",
                attributes: ["FirstName", "LastName", "Email", "Phone"],
            },
            {
                model: Doctor,
                as: "doctor",
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["FirstName", "LastName"],
                    },
                    {
                        model: Specialty,
                        as: "specialty",
                        attributes: ["Name"],
                    },
                ],
            },
        ],
        order: [
            ["AppointmentDate", "DESC"],
            ["StartTime", "DESC"],
        ],
    });

    res.status(StatusCodes.OK).json({
        success: true,
        count: appointments.length,
        data: { appointments },
    });
});

// Get single appointment
const getAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const appointment = await Appointment.findByPk(id, {
        include: [
            {
                model: User,
                as: "patient",
                attributes: ["FirstName", "LastName", "Email", "Phone"],
            },
            {
                model: Doctor,
                as: "doctor",
                include: [
                    {
                        model: User,
                        as: "user",
                        attributes: ["FirstName", "LastName"],
                    },
                    {
                        model: Specialty,
                        as: "specialty",
                        attributes: ["Name"],
                    },
                ],
            },
        ],
    });

    if (!appointment) {
        throw new AppError("Appointment not found", StatusCodes.NOT_FOUND);
    }

    // Check access permissions
    if (userRole === "Patient" && appointment.PatientID !== userId) {
        throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }
    if (userRole === "Doctor" && appointment.DoctorID !== userId) {
        throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }

    res.status(StatusCodes.OK).json({
        success: true,
        data: { appointment },
    });
});

// Update appointment (cancel, reschedule, complete)
const updateAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const { Status, AppointmentDate, StartTime, EndTime, Notes } = req.body;
    const userId = req.userId;
    const userRole = req.userRole;

    const appointment = await Appointment.findByPk(id, {
        include: [
            {
                model: User,
                as: "patient",
                attributes: ["FirstName", "LastName", "Email"],
            },
        ],
    });

    if (!appointment) {
        throw new AppError("Appointment not found", StatusCodes.NOT_FOUND);
    }

    // Check permissions
    if (userRole === "Patient" && appointment.PatientID !== userId) {
        throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }
    if (
        userRole === "Doctor" &&
        appointment.DoctorID !== userId &&
        Status !== "Completed"
    ) {
        throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }

    // Validate rescheduling
    if (AppointmentDate || StartTime || EndTime) {
        const newDate = AppointmentDate || appointment.AppointmentDate;
        const newStartTime = StartTime || appointment.StartTime;
        const newEndTime = EndTime || appointment.EndTime;

        if (userRole === "Patient") {
            await validateAppointmentBooking(
                appointment.PatientID,
                appointment.DoctorID,
                newDate,
                newStartTime,
                newEndTime,
                id
            );
        }
    }

    // Prevent cancelling past appointments
    if (Status === "Cancelled") {
        const appointmentDateTime = new Date(
            `${appointment.AppointmentDate}T${appointment.StartTime}`
        );
        if (appointmentDateTime < new Date()) {
            throw new AppError(
                "Cannot cancel past appointments",
                StatusCodes.BAD_REQUEST
            );
        }
    }

    // Update appointment
    if (Status) appointment.Status = Status;
    if (AppointmentDate) appointment.AppointmentDate = AppointmentDate;
    if (StartTime) appointment.StartTime = StartTime;
    if (EndTime) appointment.EndTime = EndTime;
    if (Notes !== undefined) appointment.Notes = Notes;

    await appointment.save();

    // Send cancellation email if cancelled
    if (Status === "Cancelled") {
        try {
            await sendAppointmentCancellation(
                appointment.patient.Email,
                `${appointment.patient.FirstName} ${appointment.patient.LastName}`,
                {
                    date: appointment.AppointmentDate,
                    startTime: appointment.StartTime,
                    endTime: appointment.EndTime,
                    doctorName: "Doctor",
                }
            );
        } catch (error) {
            console.error("Failed to send cancellation email:", error);
        }
    }

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Appointment updated successfully",
        data: { appointment },
    });
});

// Delete appointment (soft delete by cancelling)
const deleteAppointment = asyncHandler(async (req, res) => {
    const { id } = req.params;
    const userId = req.userId;
    const userRole = req.userRole;

    const appointment = await Appointment.findByPk(id);

    if (!appointment) {
        throw new AppError("Appointment not found", StatusCodes.NOT_FOUND);
    }

    // Check permissions
    if (userRole === "Patient" && appointment.PatientID !== userId) {
        throw new AppError("Access denied", StatusCodes.FORBIDDEN);
    }

    // Cancel instead of delete
    appointment.Status = "Cancelled";
    await appointment.save();

    res.status(StatusCodes.OK).json({
        success: true,
        message: "Appointment cancelled successfully",
    });
});

module.exports = {
    bookAppointment,
    getAppointments,
    getAppointment,
    updateAppointment,
    deleteAppointment,
};
