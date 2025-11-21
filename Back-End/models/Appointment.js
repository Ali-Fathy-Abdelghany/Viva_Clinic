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
      model: 'Users',
      key: 'UserID'
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
    type: DataTypes.ENUM('Booked', 'Cancelled', 'Rescheduled', 'Completed'),
    allowNull: false,
    defaultValue: 'Booked'
  },
  Notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  CreatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'Appointments',
  timestamps: true,
  indexes: [
    {
      fields: ['PatientID']
    },
    {
      fields: ['DoctorID']
    },
    {
      fields: ['AppointmentDate', 'StartTime']
    }
  ]
});

module.exports = Appointment;

