const express = require('express');
const router = express.Router();
const {
  createLabResult,
  getLabResults,
  getLabResult,
  updateLabResult,
  deleteLabResult
} = require('../controllers/labResultController');
const { authenticate, authorize } = require('../middleware/auth');
const { validateLabResult, validateId } = require('../middleware/validator');

// All routes require authentication
router.use(authenticate);

// Create lab result (Doctor/Admin only)
router.post('/', authorize('Doctor', 'Admin'), validateLabResult, createLabResult);

// Get lab results for a medical record
router.get('/record/:recordId', validateId, getLabResults);

// Get single lab result
router.get('/:id', validateId, getLabResult);

// Update lab result (Doctor/Admin only)
router.put('/:id', authorize('Doctor', 'Admin'), validateId, validateLabResult, updateLabResult);
router.patch('/:id', authorize('Doctor', 'Admin'), validateId, validateLabResult, updateLabResult);

// Delete lab result (Doctor/Admin only)
router.delete('/:id', authorize('Doctor', 'Admin'), validateId, deleteLabResult);

module.exports = router;

