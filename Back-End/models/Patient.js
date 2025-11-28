const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Patient = sequelize.define('Patient', {
  PatientID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'UserID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  DateOfBirth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  Gender: {
    type: DataTypes.ENUM('M', 'F'),
    allowNull: true
  },
  Address: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  BloodType: {
    type: DataTypes.ENUM('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'),
    allowNull: true
  }
}, {
  tableName: 'patients',
  timestamps: false
});

module.exports = Patient;
