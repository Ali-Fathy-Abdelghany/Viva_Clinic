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




// Define Associations
User.hasOne(Patient, { foreignKey: 'UserID', as: 'patientInfo' });
Patient.belongsTo(User, { foreignKey: 'UserID', as: 'user' });

User.hasOne(Doctor, { foreignKey: 'DoctorID', as: 'doctorInfo' });
Doctor.belongsTo(User, { foreignKey: 'DoctorID', as: 'user' });

Patient.hasMany(Appointment, { foreignKey: 'PatientID', as: 'patientAppointments' });
Appointment.belongsTo(Patient, { foreignKey: 'PatientID', as: 'patient' });

Patient.hasMany(Medical_info, { foreignKey: 'PatientID', as: 'patientMedicalInfo' });
Medical_info.belongsTo(Patient, { foreignKey: 'PatientID', as: 'patient' });

Patient.hasMany(MedicalRecord, { foreignKey: 'PatientID', as: 'patientMedicalRecords' });
MedicalRecord.belongsTo(Patient, { foreignKey: 'PatientID', as: 'patient' });

Doctor.hasMany(DoctorWorkingHours, { foreignKey: 'DoctorID', as: 'workingHours' });
DoctorWorkingHours.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

Doctor.hasMany(Appointment, { foreignKey: 'DoctorID', as: 'doctorAppointments' });
Appointment.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

Doctor.hasMany(Award, { foreignKey: 'DoctorID', as: 'doctorAwards' });
Award.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

Doctor.hasMany(Certification, { foreignKey: 'DoctorID', as: 'doctorCertifications' });
Certification.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

Doctor.hasMany(MedicalRecord, { foreignKey: 'DoctorID', as: 'doctorMedicalRecords' });
MedicalRecord.belongsTo(Doctor, { foreignKey: 'DoctorID', as: 'doctor' });

Specialty.hasMany(Doctor, { foreignKey: 'SpecialtyID', as: 'doctors' });
Doctor.belongsTo(Specialty, { foreignKey: 'SpecialtyID', as: 'specialty' });

Appointment.hasOne(MedicalRecord, { foreignKey: 'AppointmentID', as: 'medicalRecord' });
MedicalRecord.belongsTo(Appointment, { foreignKey: 'AppointmentID', as: 'appointment' });



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