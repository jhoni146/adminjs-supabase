import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Mensualidad = sequelize.define('Mensualidad', {
  cuota: {
    type: DataTypes.FLOAT,
    allowNull: false,
  },
  mes: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  pagado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  nota: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

export default Mensualidad;
