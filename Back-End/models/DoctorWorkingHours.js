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
      model: 'doctors',
      key: 'DoctorID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
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
      fields: ['DoctorID', 'DayOfWeek']
    },
    {
      fields: ['DayOfWeek', 'StartTime']
    },
    {
      unique: true,
      fields: ['DoctorID','DayOfWeek', 'StartTime']
    }
  ]
});

module.exports = DoctorWorkingHours;

