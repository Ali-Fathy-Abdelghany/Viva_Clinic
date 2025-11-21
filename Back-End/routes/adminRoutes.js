const express = require('express');
const router = express.Router();
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
  getDoctorWorkload
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateId } = require('../middleware/validator');

// All routes require admin authentication
router.use(authenticate);
router.use(authorize('Admin'));

// Doctor Management
router.post('/doctors', createDoctor);
router.put('/doctors/:id', validateId, updateDoctor);
router.patch('/doctors/:id', validateId, updateDoctor);
router.delete('/doctors/:id', validateId, deleteDoctor);

// Patient Management
router.get('/patients', getPatients);
router.put('/patients/:id', validateId, updatePatient);
router.patch('/patients/:id', validateId, updatePatient);

// Specialty Management
router.get('/specialties', getSpecialties);
router.post('/specialties', createSpecialty);
router.put('/specialties/:id', validateId, updateSpecialty);
router.patch('/specialties/:id', validateId, updateSpecialty);
router.delete('/specialties/:id', validateId, deleteSpecialty);

// Working Hours Management
router.post('/doctors/:doctorId/working-hours', validateId, setDoctorWorkingHours);

// Reports
router.get('/reports/daily-schedule', getDailySchedule);
router.get('/reports/weekly-summary', getWeeklySummary);
router.get('/reports/doctor-workload', getDoctorWorkload);

module.exports = router;

