import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Usuario = sequelize.define('Usuario', {
  email: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
});

export default Usuario;
