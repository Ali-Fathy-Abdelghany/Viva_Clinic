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
      model: 'patients',
      key: 'patientID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  DoctorID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'doctors',
      key: 'doctorID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
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
    type: DataTypes.ENUM('Booked', 'Cancelled', 'Rescheduled', 'Completed',),
    allowNull: false,
    defaultValue: 'Booked'
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
    },
    {
      unique: true,
      fields: ['DoctorID','AppointmentDate', 'StartTime']
    }
  ]
});

module.exports = Appointment;

