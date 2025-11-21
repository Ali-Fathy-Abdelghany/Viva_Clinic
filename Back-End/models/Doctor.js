const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  DoctorID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'Users',
      key: 'UserID'
    }
  },
  SpecialtyID: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Specialties',
      key: 'SpecialtyID'
    }
  },
  Bio: {
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
  tableName: 'Doctors',
  timestamps: true
});

module.exports = Doctor;

