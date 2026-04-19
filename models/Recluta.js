import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Recluta = sequelize.define('Recluta', {
  nombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  plataforma: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  fechaInicio: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  cursos: {
    type: DataTypes.TEXT,
    allowNull: true, // puedes poner lista separada por comas
  }
});

export default Recluta;
