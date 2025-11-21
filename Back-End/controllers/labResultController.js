const { StatusCodes } = require('http-status-codes');
const { LabResult, MedicalRecord } = require('../models');
const { asyncHandler, AppError } = require('../middleware/errorHandler');

// Create lab result
const createLabResult = asyncHandler(async (req, res) => {
  const { RecordID, TestName, ResultDetails, TestDate } = req.body;
  const userId = req.userId;
  const userRole = req.userRole;

  // Verify medical record exists
  const medicalRecord = await MedicalRecord.findByPk(RecordID);
  if (!medicalRecord) {
    throw new AppError('Medical record not found', StatusCodes.NOT_FOUND);
  }

  // Check permissions (only doctors and admins can create lab results)
  if (userRole === 'Patient') {
    throw new AppError('Access denied. Patients cannot create lab results.', StatusCodes.FORBIDDEN);
  }

  if (userRole === 'Doctor' && medicalRecord.DoctorID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  // Create lab result
  const labResult = await LabResult.create({
    RecordID,
    TestName,
    ResultDetails,
    TestDate: TestDate || new Date()
  });

  res.status(StatusCodes.CREATED).json({
    success: true,
    message: 'Lab result created successfully',
    data: { labResult }
  });
});

// Get lab results for a medical record
const getLabResults = asyncHandler(async (req, res) => {
  const { recordId } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  // Verify medical record exists and check permissions
  const medicalRecord = await MedicalRecord.findByPk(recordId);
  if (!medicalRecord) {
    throw new AppError('Medical record not found', StatusCodes.NOT_FOUND);
  }

  if (userRole === 'Patient' && medicalRecord.PatientID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }
  if (userRole === 'Doctor' && medicalRecord.DoctorID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  const labResults = await LabResult.findAll({
    where: { RecordID: recordId },
    order: [['TestDate', 'DESC']]
  });

  res.status(StatusCodes.OK).json({
    success: true,
    count: labResults.length,
    data: { labResults }
  });
});

// Get single lab result
const getLabResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  const labResult = await LabResult.findByPk(id, {
    include: [
      {
        model: MedicalRecord,
        as: 'medicalRecord'
      }
    ]
  });

  if (!labResult) {
    throw new AppError('Lab result not found', StatusCodes.NOT_FOUND);
  }

  const medicalRecord = labResult.medicalRecord;

  // Check permissions
  if (userRole === 'Patient' && medicalRecord.PatientID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }
  if (userRole === 'Doctor' && medicalRecord.DoctorID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  res.status(StatusCodes.OK).json({
    success: true,
    data: { labResult }
  });
});

// Update lab result
const updateLabResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { TestName, ResultDetails, TestDate } = req.body;
  const userId = req.userId;
  const userRole = req.userRole;

  const labResult = await LabResult.findByPk(id, {
    include: [
      {
        model: MedicalRecord,
        as: 'medicalRecord'
      }
    ]
  });

  if (!labResult) {
    throw new AppError('Lab result not found', StatusCodes.NOT_FOUND);
  }

  // Check permissions
  if (userRole === 'Patient') {
    throw new AppError('Access denied. Patients cannot update lab results.', StatusCodes.FORBIDDEN);
  }

  if (userRole === 'Doctor' && labResult.medicalRecord.DoctorID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  if (TestName !== undefined) labResult.TestName = TestName;
  if (ResultDetails !== undefined) labResult.ResultDetails = ResultDetails;
  if (TestDate !== undefined) labResult.TestDate = TestDate;

  await labResult.save();

  res.status(StatusCodes.OK).json({
    success: true,
    message: 'Lab result updated successfully',
    data: { labResult }
  });
});

// Delete lab result
const deleteLabResult = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.userId;
  const userRole = req.userRole;

  const labResult = await LabResult.findByPk(id, {
    include: [
      {
        model: MedicalRecord,
        as: 'medicalRecord'
      }
    ]
  });

  if (!labResult) {
    throw new AppError('Lab result not found', StatusCodes.NOT_FOUND);
  }

  // Check permissions
  if (userRole === 'Patient') {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  if (userRole === 'Doctor' && labResult.medicalRecord.DoctorID !== userId) {
    throw new AppError('Access denied', StatusCodes.FORBIDDEN);
  }

  await labResult.destroy();

  res.status(StatusCodes.NO_CONTENT).json({
    success: true,
    message: 'Lab result deleted successfully'
  });
});

module.exports = {
  createLabResult,
  getLabResults,
  getLabResult,
  updateLabResult,
  deleteLabResult
};

