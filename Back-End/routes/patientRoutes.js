const express = require("express");
const router = express.Router();
const {
    getPatientProfile,
    updatePatientProfile,
    getPatientMedicalRecords,
} = require("../controllers/patientController");
const { authenticate } = require("../middleware/auth");
const {
    validatePatientProfile,
    validateId,
} = require("../middleware/validator");

// All routes require authentication
router.use(authenticate);

router
    .route("/")
    .get(getPatientProfile)
    .patch(validatePatientProfile, updatePatientProfile);
router
    .route("/:id")
    .all(validateId)
    .get(getPatientProfile)
    .patch(validatePatientProfile, updatePatientProfile);
router.route("/:id/medical-records").all(validateId).get(getPatientMedicalRecords);
module.exports = router;
