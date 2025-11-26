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
    type: DataTypes.ENUM(
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday'
    ),
    allowNull:false
  },
  StartTime: {
    type: DataTypes.TIME,
    allowNull: false
  },
  EndTime: {
    type: DataTypes.TIME,
    allowNull: false
  },

}, {
  tableName: 'doctorworkinghours',
  timestamps: false,
  indexes: [
    {
      unique: true,
      fields: ['DoctorID', 'DayOfWeek']
    },
    {
      fields: ['DayOfWeek', 'StartTime']
    }
  ]
});

module.exports = DoctorWorkingHours;

