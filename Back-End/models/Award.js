const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Award = sequelize.define('Award', {
  DoctorID: {
    type: DataTypes.INTEGER,
    references: {
          model: 'doctors',
          key: 'DoctorID',
        },
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  },
  Award_name: {
    type: DataTypes.TEXT,
    allowNull: false
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
