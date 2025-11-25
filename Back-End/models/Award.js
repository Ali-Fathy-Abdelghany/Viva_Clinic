const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Award = sequelize.define('Award', {
  DoctorID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  Award_name: {
    type: DataTypes.STRING(100),
    primaryKey: true
  },
  Award_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  
}, {
  tableName: 'award',
  timestamps: false
});

module.exports = Award;
