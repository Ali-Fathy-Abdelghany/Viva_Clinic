const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Medical_info = sequelize.define('Medical_info', {
  PatientID: {
    type: DataTypes.INTEGER,
    references: {
          model: 'patients',
          key: 'PatientID',
        }
  },
  Name: {
    type: DataTypes.ENUM(
      'Diabetes',
      'Hypertension',
      'Asthma',
      'ChronicOther',
      'Medication',
      'Environmental',
      'Food',
      'AllergyOther'
    ),
    allownull: false,
   
  },
  InfoType: {
    type: DataTypes.ENUM('ChronicDisease','Allergy'),
    allownull: false,
    
  },

  
}, {
  tableName: 'medical_info',
  timestamps: false
});

module.exports = Medical_info;