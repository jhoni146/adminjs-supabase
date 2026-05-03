import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Mensualidades = sequelize.define('Mensualidades', {
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
  miembroId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  reclutaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  nombre: {
  type: DataTypes.STRING,
  allowNull: false,
},
}, {
  tableName: 'Mensualidades',   // 👈 NOMBRE REAL DE LA TABLA
});

export default Mensualidades;
