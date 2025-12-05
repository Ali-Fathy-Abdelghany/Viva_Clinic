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

  // Table has no primary key column; prevent Sequelize from expecting default `id`.
  Certification.removeAttribute('id');

module.exports = Certification;
