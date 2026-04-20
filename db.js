import { Sequelize } from 'sequelize';

export const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
  dialectOptions: {
    family: 4   // 👈 fuerza IPv4
  }
});

// 🟩 sincronización automática segura
sequelize.sync({ alter: true })
  .then(() => {
    console.log('Base de datos sincronizada automáticamente (alter: true)');
  })
  .catch((err) => {
    console.error('Error al sincronizar la base de datos:', err);
  });
