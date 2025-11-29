const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Certification = sequelize.define('Certification', {
  DoctorID: {
    type: DataTypes.INTEGER,
    references: {
          model: 'doctors',
          key: 'DoctorID',
        },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  Title: {
    type: DataTypes.STRING(255),
    allowNull:false
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
