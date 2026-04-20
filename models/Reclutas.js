import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Reclutas = sequelize.define('Reclutas', {
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

export default Reclutas;
