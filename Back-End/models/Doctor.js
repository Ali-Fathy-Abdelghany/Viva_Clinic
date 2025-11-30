const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Doctor = sequelize.define('Doctor', {
  DoctorID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    references: {
      model: 'users',
      key: 'UserID'
    },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  SpecialtyID: {
    type: DataTypes.INTEGER,
    allowNull: true, 
    references: {
      model: 'specialties',
      key: 'SpecialtyID'
    },
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  },
  Bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  Image_url: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  Gender: {
    type: DataTypes.ENUM('M', 'F'),
    allowNull: true
  },
  Fee: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  Education: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  YearsOfExperience: {
    type: DataTypes.INTEGER,
    allowNull: true
  }
}, {
  tableName: 'doctors',
  timestamps: false
});

module.exports = Doctor;
