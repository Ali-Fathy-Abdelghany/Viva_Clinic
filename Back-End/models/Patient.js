const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  PatientID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'UserID'
    }
  },
  DateOfBirth: {
    type: DataTypes.DATE,
    allowNull: false
  },
  Gender: {
    type: DataTypes.ENUM('Male', 'Female'),
    allowNull: false
  },
  Image_url: {
    type: DataTypes.TEXT,
    allowNull:true
  },
  Address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  BloodType: {
    type: DataTypes.ENUM('A+','A-','B+','B-','O+','O-','AB+','AB-'),
    allowNull: true
  },
  
}, {
  tableName: 'patients',
  timestamps: false
});

module.exports = Patient;

