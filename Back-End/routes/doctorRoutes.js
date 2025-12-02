const express = require('express');
const router = express.Router();
const {
  getDoctors,
  getDoctor,
  getDoctorAvailability,
  getDoctorAppointments,
  updateDoctorProfile
} = require('../controllers/doctorController');
const {getSpecialties}=require('../controllers/adminController')
const { authenticate, authorize } = require('../middleware/auth');
const { validateDoctorProfile, validateId } = require('../middleware/validator');

// Public route - get all doctors
router.get('/', getDoctors);

// Public route - get all specialties
router.get('/specialties', getSpecialties);

// Public route - get single doctor
router.get('/:id', validateId, getDoctor);

// Public route - get doctor availability
router.get('/:id/availability', validateId, getDoctorAvailability);

// Protected routes
router.use(authenticate);

// Get doctor's appointments (Doctor and Admin)
router.get('/:id/appointments', authorize('Doctor','Admin'), validateId, getDoctorAppointments);

// Update doctor profile (Doctor and Admin)
router.patch('/profile', authorize('Doctor','Admin'), validateDoctorProfile, updateDoctorProfile);

module.exports = router;

