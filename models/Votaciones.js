import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Votaciones = sequelize.define('Votaciones', {
  // Recluta sobre el que se vota
  reclutaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  reclutaNombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Miembro que emite el voto
  miembroId: {
    type: DataTypes.INTEGER,
    allowNull: true,      // null = voto manual sin miembro vinculado
  },

  votante: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // El voto
  voto: {
    type: DataTypes.ENUM('Apto', 'No apto', 'Pendiente'),
    defaultValue: 'Pendiente',
    allowNull: false,
  },

  // Fecha límite para votar (2 meses después del fechaInicio del recluta)
  fechaLimite: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

  nota: {
    type: DataTypes.TEXT,
    defaultValue: '',
  },
}, {
  tableName: 'Votaciones',
  timestamps: true,
});

export default Votaciones;
