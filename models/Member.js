import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';

const Member = sequelize.define('Member', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  callsign: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  joinDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  rank: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Recluta',
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'Activo',
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  }
});

export default Member;
