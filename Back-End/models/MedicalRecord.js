const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  
  AppointmentID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Appointments',
      key: 'AppointmentID'
    }
  },
  PatientID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    primaryKey: true,
    references: {
      model: 'Patients',
      key: 'PatientsID'
    }
  },
  DoctorID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'DoctorID'
    }
  },
  Diagnosis: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Drug: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
}, {
  tableName: 'medicalRecords',
  timestamps: false,
  indexes: [
    {
      fields: ['PatientID']
    },
    {
      fields: ['DoctorID']
    },
    {
      fields: ['AppointmentID'],
}
  ]
});

module.exports = MedicalRecord;

