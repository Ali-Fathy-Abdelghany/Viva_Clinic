const { StatusCodes } = require("http-status-codes");
const rateLimit = require("express-rate-limit");
// disable rate limiting in development  environment
if (true) {
    module.exports = {
        apiLimiter: (req, res, next) => next(),
        authLimiter: (req, res, next) => next(),
        passwordResetLimiter: (req, res, next) => next(),
        registerLimiter: (req, res, next) => next(),
        adminLimiter: (req, res, next) => next(),
    };
    return;
}
// General API rate limiter - 100 requests per 15 minutes
const apiLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // Limit each IP to 200 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
    handler: (req, res) => {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message: "Too many requests from this IP, please try again later.",
        });
    },
});

// Strict rate limiter for authentication routes - 5 requests per 15 minutes
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // Limit each IP to 5 requests per windowMs
    message: {
        success: false,
        message: "Too many authentication attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful requests
    handler: (req, res) => {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message:
                "Too many authentication attempts, please try again later.",
        });
    },
});

// Rate limiter for password reset - 3 requests per hour
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 requests per hour
    message: {
        success: false,
        message: "Too many password reset attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message:
                "Too many password reset attempts, please try again later.",
        });
    },
});

// Rate limiter for registration - 3 requests per hour
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // Limit each IP to 3 registrations per hour
    message: {
        success: false,
        message: "Too many registration attempts, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message: "Too many registration attempts, please try again later.",
        });
    },
});

// Rate limiter for admin routes - 50 requests per 15 minutes
const adminLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 50, // Limit each IP to 50 requests per windowMs
    message: {
        success: false,
        message:
            "Too many requests to admin endpoints, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
    handler: (req, res) => {
        res.status(StatusCodes.TOO_MANY_REQUESTS).json({
            success: false,
            message:
                "Too many requests to admin endpoints, please try again later.",
        });
    },
});

module.exports = {
    apiLimiter,
    authLimiter,
    passwordResetLimiter,
    registerLimiter,
    adminLimiter,
};
