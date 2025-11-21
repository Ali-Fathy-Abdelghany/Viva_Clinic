const { StatusCodes } = require("http-status-codes");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const { asyncHandler } = require("./errorHandler");
const { User } = require("../models");

// Verify JWT token - supports both Authorization header and cookies
const authenticate = asyncHandler(async (req, res, next) => {
        // Try to get token from Authorization header first (for Postman)
        let token = req.header("Authorization")?.replace("Bearer ", "");

        // If no token in header, try to get from cookie (for client-side)
        if (!token) {
            token = req.cookies[config.JWT_COOKIE_NAME];
        }

        if (!token) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Access denied. No token provided.",
            });
        }

        const decoded = jwt.verify(token, config.JWT_SECRET);
        const user = await User.findByPk(decoded.userId);

        if (!user || !user.isActive) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Invalid token or user not active.",
            });
        }

        req.user = user;
        req.userId = user.UserID;
        req.userRole = user.Role;
        next();
    } 
);

// Check if user has required role
const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(StatusCodes.UNAUTHORIZED).json({
                success: false,
                message: "Authentication required.",
            });
        }

        if (!roles.includes(req.userRole)) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message: "Access denied. Insufficient permissions.",
            });
        }

        next();
    };
};

// Middleware to check if user owns the resource or is admin/doctor
const authorizeResource = (resourceUserId) => {
    return (req, res, next) => {
        if (req.userRole === "Admin" || req.userRole === "Doctor") {
            return next();
        }

        if (req.userId !== resourceUserId) {
            return res.status(StatusCodes.FORBIDDEN).json({
                success: false,
                message:
                    "Access denied. You can only access your own resources.",
            });
        }

        next();
    };
};

module.exports = {
    authenticate,
    authorize,
    authorizeResource,
};
