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
  Image_url: {
    type: DataTypes.TEXT,
    allowNull:true
  },
  Gender:{
    type: DataTypes.Enum('Male','Female'),
    allowNull:false
  },
  Fee:{
    type: DataTypes.INTEGER,
    allowNull:false
  },
  Education:{
    type: DataTypes.TEXT,
    allowNull:true
  },
  YearsOfExperience:{
    type: DataTypes.INTEGER,
    allowNull:true
  },


}, {
  tableName: 'doctors',
  timestamps: false
});

module.exports = Doctor;

