const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medical_info = sequelize.define('Medical_info', {
  PatientID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Name: {
    type: DataTypes.ENUM(
      'Diabetes',
      'Hypertension',
      'Asthma',
      'Medication',
      'Environmental',
      'Food',
      'Other'
    ),
    primaryKey: true,
  },
  InfoType: {
    type: DataTypes.ENUM('Chronic illness','Allergy'),
    primaryKey: true
  },

  
}, {
  tableName: 'medical_info',
  timestamps: false
});

module.exports = Medical_info;