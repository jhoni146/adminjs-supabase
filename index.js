import 'dotenv/config';
import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import { sequelize } from './db.js';
import Recluta from './models/Recluta.js';

const app = express();

// Registrar adapter
AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

// Configuración AdminJS
const adminJs = new AdminJS({
  resources: [
{
  resource: Recluta,
  options: {
    properties: {
      fechaInicio: {
      type: 'date',
      components: {
        list: AdminJS.bundle('./components/date-format.jsx'),
        show: AdminJS.bundle('./components/date-format.jsx'),
      }
    },

      cursos: {
        type: 'string',
        isArray: true,   // 👈 permite seleccionar varios
        availableValues: [
          { value: 'Cibi', label: 'Cibi' },
          { value: 'Medico', label: 'Médico' },
          { value: 'Formaciones', label: 'Formaciones' },
          { value: 'Mout', label: 'MOUT' },
          { value: 'Cqb', label: 'CQB' },
          { value: 'Comunicaciones', label: 'Comunicaciones' },
          { value: 'Orientacion', label: 'Orientación' },
        ]
      }
    }
  }
}

  ],

  rootPath: '/admin',

  branding: {
    companyName: 'Clan Milsim',
    softwareBrothers: false,

    // 🟩 TU LOGO
    logo: 'https://i.ibb.co/LdBxr4zr/fear512.png',

    // 🟩 OPCIONAL: FAVICON
    favicon: 'https://i.ibb.co/LdBxr4zr/fear512.png',

    // 🟩 TEMA MILITAR
    theme: {
      colors: {
        primary100: '#1b2a16',   // verde militar oscuro
        primary80: '#2d3f21',
        primary60: '#3f5a2c',
        primary40: '#577a3c',
        primary20: '#7f9f5b',

        accent: '#c2b280',       // color arena
        hoverBg: '#2d3f21',
        filterBg: '#1b2a16',
      },

      // 🟩 Tipografía estilo militar
      fonts: {
        base: '"Roboto Condensed", sans-serif',
        headings: '"Roboto Condensed", sans-serif',
      }
    }
  },


  locale: {
    language: 'es',
    translations: {
      labels: {
        Recluta: 'Reclutas',
      },
      resources: {
        Recluta: {
          properties: {
            nombre: 'Nombre',
            plataforma: 'Plataforma',
            fechaInicio: 'Fecha de inicio',
            cursos: 'Cursos',
          }
        }
      },
      messages: {
        loginWelcome: 'Panel del Clan Milsim',
      }
    }
  }
});




// Autenticación
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@example.com';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123';

const router = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password) => {
      if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
        return { email };
      }
      return null;
    },
    cookiePassword: process.env.ADMINJS_COOKIE_SECRET || 'cookie-secret',
  }
);

app.use(adminJs.options.rootPath, router);

app.get('/', (req, res) => {
  res.send('AdminJS + Supabase + Render funcionando');
});

const port = process.env.PORT || 3000;

try {
  await sequelize.authenticate();
  console.log('Conectado a Supabase (Postgres)');
  await sequelize.sync();
  app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
    console.log(`AdminJS en http://localhost:${port}${adminJs.options.rootPath}`);
  });
} catch (err) {
  console.error('Error al iniciar:', err);
}
