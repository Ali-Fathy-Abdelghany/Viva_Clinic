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
    allowNull: true
  },
  Gender: {
    type: DataTypes.ENUM('F', 'M'),
    allowNull: true
  },
  Address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  BloodType: {
    type: DataTypes.STRING(10),
    allowNull: true
  },
  ChronicDisease: {
    type: DataTypes.TEXT,
    allowNull: true
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
  tableName: 'Patients',
  timestamps: true
});

module.exports = Patient;

