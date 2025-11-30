const express = require("express");
const router = express.Router();
const {
    createMedicalRecord,
    getMedicalRecord,
    updateMedicalRecord,
} = require("../controllers/medicalRecordController");
const { authenticate, authorize } = require("../middleware/auth");
const {
    validateMedicalRecord,
    validateId,
} = require("../middleware/validator");

// All routes require authentication
router.use(authenticate);

// Create medical record (Doctor only)
router.post(
    "/",
    authorize("Doctor"),
    validateMedicalRecord,
    createMedicalRecord
);

router
    .route("/:id")
    .all(validateId)
    .get(getMedicalRecord)
    .patch(authorize("Doctor"), validateMedicalRecord, updateMedicalRecord);


module.exports = router;
