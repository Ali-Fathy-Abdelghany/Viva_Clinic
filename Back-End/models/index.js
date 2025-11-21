const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Specialty = require('./Specialty');
const DoctorWorkingHours = require('./DoctorWorkingHours');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const LabResult = require('./LabResult');

// Define Associations
User.hasOne(Patient, { foreignKey: 'PatientID', as: 'patientInfo' });
Patient.belongsTo(User, { foreignKey: 'PatientID', as: 'user' });

User.hasOne(Doctor, { foreignKey: 'DoctorID', as: 'doctorInfo' });
Doctor.belongsTo(User, { foreignKey: 'DoctorID', as: 'user' });

Specialty.hasMany(Doctor, { foreignKey: 'SpecialtyID', as: 'doctors' });
Doctor.belongsTo(Specialty, { foreignKey: 'SpecialtyID', as: 'specialty' });

Doctor.hasMany(DoctorWorkingHours, { foreignKey: 'DoctorID', as: 'workingHours' });
DoctorWorkingHours.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

User.hasMany(Appointment, { foreignKey: 'PatientID', as: 'patientAppointments' });
Appointment.belongsTo(User, { foreignKey: 'PatientID', as: 'patient' });

Doctor.hasMany(Appointment, { foreignKey: 'DoctorID', as: 'doctorAppointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

Appointment.hasOne(MedicalRecord, { foreignKey: 'AppointmentID', as: 'medicalRecord' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'AppointmentID', as: 'appointment' });

MedicalRecord.belongsTo(User, { foreignKey: 'PatientID', as: 'patient' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

MedicalRecord.hasMany(LabResult, { foreignKey: 'RecordID', as: 'labResults' });
LabResult.belongsTo(MedicalRecord, { foreignKey: 'RecordID', as: 'medicalRecord' });

module.exports = {
  sequelize,
  User,
  Patient,
  Doctor,
  Specialty,
  DoctorWorkingHours,
  Appointment,
  MedicalRecord,
  LabResult
};