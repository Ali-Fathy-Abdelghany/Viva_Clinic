const express = require("express");
const upload = require("../middleware/upload");
const router = express.Router();
const {
    getPatientProfile,
    updatePatientProfile,
    getPatientMedicalRecords,
    updateProfilePicture,
} = require("../controllers/patientController");
const { authenticate } = require("../middleware/auth");
const {
    validatePatientProfile,
    validateId,
} = require("../middleware/validator");

// All routes require authentication
router.use(authenticate);
router.patch(
    "/profile-picture",
    upload.single("image"),
    updateProfilePicture
);
router
    .route("/")
    .get(getPatientProfile)
    .patch(validatePatientProfile, updatePatientProfile);
router.route("/medical-records").get(getPatientMedicalRecords);

router
    .route("/:id")
    .all(validateId)
    .get(getPatientProfile)
    .patch(validatePatientProfile, updatePatientProfile);
router
    .route("/:id/medical-records")
    .all(validateId)
    .get(getPatientMedicalRecords);

router.patch("/:id/profile-picture", validateId, upload.single("image"), updateProfilePicture);

module.exports = router;
