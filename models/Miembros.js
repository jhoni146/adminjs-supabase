import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Miembros = sequelize.define('Miembros', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaInicio: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plataforma: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

export default Miembros;
