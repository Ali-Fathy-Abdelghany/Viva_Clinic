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
  // Table has no primary key column; prevent Sequelize from expecting default `id`.
  Award.removeAttribute('id');

module.exports = Award;
