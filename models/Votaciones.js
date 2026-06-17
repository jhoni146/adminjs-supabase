import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Votaciones = sequelize.define('Votaciones', {

  // Recluta sobre el que se vota — una sola fila por recluta
  reclutaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
  },

  reclutaNombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // { "admin@fear.com": "Apto", "carlos@fear.com": "Pendiente", ... }
  // Los emails se recortan al mostrar mediante el hook after en AdminJS
  votos: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: false,
  },

  fechaLimite: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

}, {
  tableName: 'Votaciones',
  timestamps: true,
});

export default Votaciones;
