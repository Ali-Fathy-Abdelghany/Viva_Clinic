const express = require("express");
const router = express.Router();
const {
    bookAppointment,
    getAppointments,
    getAppointment,
    updateAppointment,
    deleteAppointment,
} = require("../controllers/appointmentController");
const { authenticate, authorize } = require("../middleware/auth");
const {
    validateAppointmentBooking,
    validateAppointmentUpdate,
    validateId,
} = require("../middleware/validator");

// All routes require authentication
router.use(authenticate);
router
    .route("/")
    .post(authorize("Patient"), validateAppointmentBooking, bookAppointment)
    .get(getAppointments);
router
    .route("/:id")
    .all(validateId)
    .get(getAppointment)
    .patch(validateAppointmentUpdate, updateAppointment)
    .delete(deleteAppointment);

module.exports = router;
