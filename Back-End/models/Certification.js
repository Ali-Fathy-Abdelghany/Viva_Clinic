const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certification = sequelize.define('Certification', {
  DoctorID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Title: {
    type: DataTypes.STRING(100),
    primaryKey: true
  },
  Description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
}, {
  tableName: 'certifications',
  timestamps: false
});

module.exports = Certification;
