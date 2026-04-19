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
  type: DataTypes.STRING,
  allowNull: false,
},
cursos: {
  type: DataTypes.JSON,
  allowNull: true,
}
});

export default Recluta;
