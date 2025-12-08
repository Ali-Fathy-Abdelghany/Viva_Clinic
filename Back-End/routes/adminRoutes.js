const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload");
const {
    createDoctor,
    updateDoctor,
    deleteDoctor,
    getPatients,
    updatePatient,
    getSpecialties,
    createSpecialty,
    updateSpecialty,
    deleteSpecialty,
    setDoctorWorkingHours,
    getDailySchedule,
    getWeeklySummary,
    getDoctorWorkload,
    getAdmins,
    createAdmin,
    updateAdmin,
    deleteAdmin,
} = require("../controllers/adminController");
const { authenticate, authorize } = require("../middleware/auth");
const { validateId } = require("../middleware/validator");

// All routes require admin authentication
router.use(authenticate);
router.use(authorize("Admin"));

// Doctor Management
router.route("/doctors/").post(upload.single("image"), createDoctor);
router
    .route("/doctors/:id")
    .all(validateId)
    .patch(updateDoctor)
    .delete(deleteDoctor);

// Patient Management
router.get("/patients", getPatients);
router.patch("/patients/:id", validateId, updatePatient);

// Admin Management

router.get("/admins", getAdmins);
router.post("/admins", createAdmin);
router.patch("/admins/:id", validateId, updateAdmin);
router.delete("/admins/:id", validateId, deleteAdmin);

// Working Hours Management
router.post("/doctors/:id/working-hours", validateId, setDoctorWorkingHours);
// Specialty Management
router.route("/specialties").get(getSpecialties).post(createSpecialty);
router
    .route("/specialties/:id")
    .all(validateId)
    .patch(updateSpecialty)
    .delete(deleteSpecialty);

// Reports
router.get("/reports/daily-schedule", getDailySchedule);
router.get("/reports/weekly-summary", getWeeklySummary);
router.get("/reports/doctor-workload", getDoctorWorkload);

module.exports = router;
