const sequelize = require('../config/database');
const User = require('./User');
const Patient = require('./Patient');
const Doctor = require('./Doctor');
const Specialty = require('./Specialty');
const DoctorWorkingHours = require('./DoctorWorkingHours');
const Appointment = require('./Appointment');
const MedicalRecord = require('./MedicalRecord');
const Medical_info = require('./Medical_info');
const Award = require('./Award');
const Certification = require('./Certification');


// USER  PATIENT (1:1)
User.hasOne(Patient, {
  foreignKey: 'PatientID',
  as: 'patientInfo',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Patient.belongsTo(User, {
  foreignKey: 'PatientID',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// USER  DOCTOR (1:1)
User.hasOne(Doctor, {
  foreignKey: 'DoctorID',
  as: 'doctorInfo',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Doctor.belongsTo(User, {
  foreignKey: 'DoctorID',
  as: 'user',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// PATIENT  APPOINTMENT (1:M)
Patient.hasMany(Appointment, {
  foreignKey: 'PatientID',
  as: 'patientAppointments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Appointment.belongsTo(Patient, {
  foreignKey: 'PatientID',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// PATIENT  MEDICAL_INFO (1:M)
Patient.hasMany(Medical_info, {
  foreignKey: 'PatientID',
  as: 'patientMedicalInfo',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Medical_info.belongsTo(Patient, {
  foreignKey: 'PatientID',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// PATIENT  MEDICAL_RECORD (1:M)
Patient.hasMany(MedicalRecord, {
  foreignKey: 'PatientID',
  as: 'patientMedicalRecords',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

MedicalRecord.belongsTo(Patient, {
  foreignKey: 'PatientID',
  as: 'patient',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// DOCTOR  DOCTOR_WORKING_HOURS (1:M)
Doctor.hasMany(DoctorWorkingHours, {
  foreignKey: 'DoctorID',
  as: 'workingHours',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

DoctorWorkingHours.belongsTo(Doctor, {
  foreignKey: 'DoctorID',
  as: 'doctor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// DOCTOR  APPOINTMENT (1:M)
Doctor.hasMany(Appointment, {
  foreignKey: 'DoctorID',
  as: 'doctorAppointments',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Appointment.belongsTo(Doctor, {
  foreignKey: 'DoctorID',
  as: 'doctor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// DOCTOR  AWARD (1:M)
Doctor.hasMany(Award, {
  foreignKey: 'DoctorID',
  as: 'doctorAwards',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Award.belongsTo(Doctor, {
  foreignKey: 'DoctorID',
  as: 'doctor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// DOCTOR  CERTIFICATION (1:M)
Doctor.hasMany(Certification, {
  foreignKey: 'DoctorID',
  as: 'doctorCertifications',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

Certification.belongsTo(Doctor, {
  foreignKey: 'DoctorID',
  as: 'doctor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// DOCTOR  MEDICAL_RECORD (1:M)
Doctor.hasMany(MedicalRecord, {
  foreignKey: 'DoctorID',
  as: 'doctorMedicalRecords',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

MedicalRecord.belongsTo(Doctor, {
  foreignKey: 'DoctorID',
  as: 'doctor',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


// SPECIALTY  DOCTOR (1:M)
Specialty.hasMany(Doctor, {
  foreignKey: 'SpecialtyID',
  as: 'doctors',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});

Doctor.belongsTo(Specialty, {
  foreignKey: 'SpecialtyID',
  as: 'specialty',
  onDelete: 'SET NULL',
  onUpdate: 'CASCADE'
});


// APPOINTMENT  MEDICAL_RECORD (1:1)
Appointment.hasOne(MedicalRecord, {
  foreignKey: 'AppointmentID',
  as: 'medicalRecord',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});

MedicalRecord.belongsTo(Appointment, {
  foreignKey: 'AppointmentID',
  as: 'appointment',
  onDelete: 'CASCADE',
  onUpdate: 'CASCADE'
});


module.exports = {
  sequelize,
  User,
  Patient,
  Doctor,
  Specialty,
  DoctorWorkingHours,
  Appointment,
  MedicalRecord,
  Medical_info,
  Award,
  Certification
};
