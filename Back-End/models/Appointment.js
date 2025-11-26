const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Appointment = sequelize.define('Appointment', {
  AppointmentID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  PatientID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Patients',
      key: 'PatientID'
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
  AppointmentDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  StartTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  EndTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  Status: {
    type: DataTypes.ENUM('Booked', 'Cancelled', 'Available', 'Completed',),
    allowNull: false,
    defaultValue: 'Available'
  },
  
}, {
  tableName: 'appointments',
  timestamps: false,
  indexes: [
    {
      fields: ['PatientID']
    },
    {
      fields: ['DoctorID']
    },
    {
      fields: ['AppointmentDate', 'StartTime']
    },
    {
      fields: ['AppointmentDate', 'PatientID']
    },
    {
      fields: ['AppointmentDate', 'DoctorID']
    }
  ]
});

module.exports = Appointment;

