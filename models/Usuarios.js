import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Usuarios = sequelize.define('Usuarios', {
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

export default Usuarios;
