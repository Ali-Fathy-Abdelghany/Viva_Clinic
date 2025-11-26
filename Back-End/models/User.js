const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const User = sequelize.define('User', {
  UserID: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  FirstName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  LastName: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  Email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
      notEmpty: true
    }
  },
  PasswordHash: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  Phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
  },
  Role: {
    type: DataTypes.ENUM('Patient', 'Doctor', 'Admin'),
    allowNull: false,
    defaultValue: 'Patient'
  },
  
}, {
  tableName: 'users',
  timestamps: false
});

module.exports = User;

