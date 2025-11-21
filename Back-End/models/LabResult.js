const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const LabResult = sequelize.define('LabResult', {
  LabResultID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  RecordID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'MedicalRecords',
      key: 'RecordID'
    }
  },
  TestName: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  ResultDetails: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  TestDate: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
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
  tableName: 'LabResults',
  timestamps: true,
  indexes: [
    {
      fields: ['RecordID']
    }
  ]
});

module.exports = LabResult;

