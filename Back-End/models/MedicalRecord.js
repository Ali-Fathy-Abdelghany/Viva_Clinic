const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const MedicalRecord = sequelize.define('MedicalRecord', {
  
  RecordID: {
    type: DataTypes.INTEGER,
    primaryKey:true,
    autoIncrement: true
    
  },
  AppointmentID: {
    type: DataTypes.INTEGER,
    uniqe: true,
    references: {
      model: 'appointments',
      key: 'AppointmentID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  PatientID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'patients',
      key: 'PatientsID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  DoctorID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'DoctorID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
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
  tableName: 'medicalrecords',
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

