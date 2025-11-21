const express = require('express');
const router = express.Router();
const {
  createMedicalRecord,
  getMedicalRecord,
  updateMedicalRecord
} = require('../controllers/medicalRecordController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateMedicalRecord, validateId } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Create medical record (Doctor only)
router.post('/', authorize('Doctor'), validateMedicalRecord, createMedicalRecord);

// Get medical record
router.get('/:id', validateId, getMedicalRecord);

// Update medical record (Doctor only)
router.put('/:id', authorize('Doctor'), validateId, validateMedicalRecord, updateMedicalRecord);
router.patch('/:id', authorize('Doctor'), validateId, validateMedicalRecord, updateMedicalRecord);

module.exports = router;

