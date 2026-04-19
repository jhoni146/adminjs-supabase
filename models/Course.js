import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Course = sequelize.define('Course', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

export default Course;
