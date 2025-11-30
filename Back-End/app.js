const { StatusCodes } = require("http-status-codes");
const express = require("express");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const { errorHandler } = require("./middleware/errorHandler");
const { apiLimiter, adminLimiter } = require("./middleware/rateLimit");
const config = require("./config/config");

const authRoutes = require("./routes/authRoutes");
const appointmentRoutes = require("./routes/appointmentRoutes");
const patientRoutes = require("./routes/patientRoutes");
const doctorRoutes = require("./routes/doctorRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const adminRoutes = require("./routes/adminRoutes");

const app = express();

// CORS configuration - allow credentials for cookies
app.use(
    cors({
        origin: config.FRONTEND_URL,
        credentials: true, // Allow cookies to be sent
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    })
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check route
app.get("/health", (req, res) => {
    res.status(StatusCodes.OK).json({
        success: true,
        message: "Clinic Backend API is running",
        timestamp: new Date().toISOString(),
    });
});

// API Routes with rate limiting
app.use("/api/auth", authRoutes);
app.use("/api/appointments", apiLimiter, appointmentRoutes);
app.use("/api/patients", apiLimiter, patientRoutes);
app.use("/api/doctors", apiLimiter, doctorRoutes);
app.use("/api/medical-records", apiLimiter, medicalRecordRoutes);
app.use("/api/admin", adminLimiter, adminRoutes);

// 404 handler
app.use((req, res) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Route not found",
    });
});

app.use(errorHandler);

module.exports = app;
