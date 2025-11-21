const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const DoctorWorkingHours = sequelize.define('DoctorWorkingHours', {
  WorkingHourID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  DoctorID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Doctors',
      key: 'DoctorID'
    }
  },
  DayOfWeek: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 0, // Sunday
      max: 6  // Saturday
    },
    comment: '0 = Sunday, 1 = Monday, ..., 6 = Saturday'
  },
  StartTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  EndTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  createdAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  updatedAt: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'DoctorWorkingHours',
  timestamps: true,
  indexes: [
    {
      unique: true,
      fields: ['DoctorID', 'DayOfWeek']
    }
  ]
});

module.exports = DoctorWorkingHours;

