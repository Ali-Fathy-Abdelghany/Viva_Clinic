require("dotenv").config();

const toNumber = (value, fallback) =>
    value !== undefined && value !== null && value !== ""
        ? Number(value)
        : fallback;

module.exports = {
    // Server Configuration
    PORT: toNumber(process.env.PORT, 3000),
    NODE_ENV: process.env.NODE_ENV || "development",

    // JWT Configuration
    JWT_SECRET:
        process.env.JWT_SECRET || "your-secret-key-change-in-production",
    JWT_EXPIRE: process.env.JWT_EXPIRE || "7d",
    JWT_COOKIE_NAME: process.env.JWT_COOKIE_NAME || "token",
    JWT_COOKIE_EXPIRE: toNumber(
        process.env.JWT_COOKIE_EXPIRE || 7 * 24 * 60 * 60 * 1000
    ), // 7 days in milliseconds

    // Email Configuration
    EMAIL_HOST: process.env.EMAIL_HOST || "smtp.gmail.com",
    EMAIL_PORT: toNumber(process.env.EMAIL_PORT, 587),
    EMAIL_USER: process.env.EMAIL_USER || "",
    EMAIL_PASS: process.env.EMAIL_PASS || "",
    EMAIL_FROM: process.env.EMAIL_FROM || "",

    CLINIC_NAME: process.env.CLINIC_NAME || "Viva Clinics",

    // App Configuration
    APP_URL: process.env.APP_URL || "http://localhost:3000",
    FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:3000",
};
