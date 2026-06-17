import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Votaciones = sequelize.define('Votaciones', {

  // Recluta sobre el que se vota
  reclutaId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,   // Solo UNA fila por recluta
  },

  reclutaNombre: {
    type: DataTypes.STRING,
    allowNull: false,
  },

  // Votos reales guardados con email completo como clave:
  // { "admin@fear.com": "Apto", "otro@fear.com": "Pendiente" }
  votos: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: false,
  },

  // Campo virtual: mismo contenido pero con claves recortadas al nombre (antes del @)
  // { "admin": "Apto", "otro": "Pendiente" }
  // Se usa SOLO para mostrar en AdminJS. No se persiste en BD.
  votosDisplay: {
    type: DataTypes.VIRTUAL,
    get() {
      const votos = this.getDataValue('votos') || {};
      const display = {};
      for (const [email, valor] of Object.entries(votos)) {
        const nombre = email.split('@')[0];
        display[nombre] = valor;
      }
      return display;
    },
  },

  // Fecha límite para votar
  fechaLimite: {
    type: DataTypes.DATEONLY,
    allowNull: true,
  },

}, {
  tableName: 'Votaciones',
  timestamps: true,
});

export default Votaciones;
