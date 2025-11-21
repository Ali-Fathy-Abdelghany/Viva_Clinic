const express = require('express');
const router = express.Router();
const {
  getPatientProfile,
  updatePatientProfile,
  getPatientMedicalRecords
} = require('../controllers/patientController');
const { authenticate, authorize } = require('../middleware/auth');
const { validatePatientProfile, validateId } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Get patient profile (with optional ID)
router.get('/:id', validateId, getPatientProfile);
router.get('/', getPatientProfile);

// Update patient profile (with optional ID)
router.put('/:id', validateId, validatePatientProfile, updatePatientProfile);
router.put('/', validatePatientProfile, updatePatientProfile);
router.patch('/:id', validateId, validatePatientProfile, updatePatientProfile);
router.patch('/', validatePatientProfile, updatePatientProfile);

// Get patient medical records
router.get('/:id/medical-records', validateId, getPatientMedicalRecords);

module.exports = router;

