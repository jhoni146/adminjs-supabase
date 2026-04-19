import { DataTypes } from 'sequelize';
import { sequelize } from '../db.js';
import Member from './Member.js';
import Course from './Course.js';

const MemberCourse = sequelize.define('MemberCourse', {
  completedAt: {
    type: DataTypes.DATEONLY,
    allowNull: false,
  },
  instructor: {
    type: DataTypes.STRING,
    allowNull: true,
  }
});

// Relaciones
Member.belongsToMany(Course, { through: MemberCourse });
Course.belongsToMany(Member, { through: MemberCourse });

export default MemberCourse;
