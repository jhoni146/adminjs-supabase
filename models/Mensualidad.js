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
  miembroId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
<<<<<<< HEAD
=======

>>>>>>> 4b8717e9 (asddddddrr)
  reclutaId: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
}, {
  tableName: 'Mensualidades',   // 👈 NOMBRE REAL DE LA TABLA
});

export default Mensualidad;
