import 'dotenv/config';
import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import { sequelize } from './db.js';
import Reclutas from './models/Reclutas.js';
import Usuarios from './models/Usuarios.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { ComponentLoader } from 'adminjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const componentLoader = new ComponentLoader();
const Components = {};



const app = express();

// Registrar adapter
AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

// Configuración AdminJS
const adminJs = new AdminJS({
  componentLoader,

  resources: [
    // 🟩 PRIMERO USUARIOS
    {
      resource: Usuarios,
      options: {
        parent: {
          name: 'Usuarios'
        },
        properties: {
          password: { type: 'password' },
        },
      },
    },

    // 🟩 LUEGO RECLUTAS
    {
      resource: Reclutas,
      options: {
        parent: {
          name: 'Reclutas'
        },
        properties: {
          fechaInicio: { type: 'string' },
          cursos: {
            type: 'string',
            isArray: true,
            availableValues: [
              { value: 'Cibi', label: 'Cibi' },
              { value: 'Medico', label: 'Médico' },
              { value: 'Formaciones', label: 'Formaciones' },
              { value: 'Mout', label: 'MOUT' },
              { value: 'Cqb', label: 'CQB' },
              { value: 'Comunicaciones', label: 'Comunicaciones' },
              { value: 'Orientacion', label: 'Orientación' },
            ],
          },
        },

        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.fechaInicio) {
                const date = new Date(request.payload.fechaInicio);
                const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const day = String(date.getDate()).padStart(2, '0');
                const month = months[date.getMonth()];
                const year = date.getFullYear();
                request.payload.fechaInicio = `${day}-${month}-${year}`;
              }
              return request;
            },
          },

          edit: {
            before: async (request) => {
              if (request.payload?.fechaInicio) {
                const date = new Date(request.payload.fechaInicio);
                const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                const day = String(date.getDate()).padStart(2, '0');
                const month = months[date.getMonth()];
                const year = date.getFullYear();
                request.payload.fechaInicio = `${day}-${month}-${year}`;
              }
              return request;
            },
          },
        },
      },
    },
  ],

  rootPath: '/admin',

  branding: {
    companyName: 'Reclutas - Clan F.E.A.R',
    softwareBrothers: false,
    logo: 'https://i.ibb.co/LdBxr4zr/fear512.png',
    favicon: 'https://i.ibb.co/LdBxr4zr/fear512.png',

    theme: {
      colors: {
        primary100: '#1b2a16',
        primary80: '#2d3f21',
        primary60: '#3f5a2c',
        primary40: '#577a3c',
        primary20: '#7f9f5b',
        accent: '#c2b280',
        hoverBg: '#2d3f21',
        filterBg: '#1b2a16',
      },
      fonts: {
        base: '"Roboto Condensed", sans-serif',
        headings: '"Roboto Condensed", sans-serif',
      },
    },
  },


  locale: {
    language: 'es',
    availableLanguages: ['es', 'en'],

    translations: {
      properties: {
        email: 'Correo electrónico',
        password: 'Contraseña',
        fechaInicio: 'Fecha de inicio',
      },

      actions: {
        new: 'Crear',
        edit: 'Editar',
        delete: 'Eliminar',
        show: 'Ver',
        list: 'Listado',
      },

      buttons: {
        save: 'Guardar',
        addNewItem: 'Añadir',
        filter: 'Filtrar',
        applyChanges: 'Aplicar cambios',
        resetFilter: 'Reiniciar filtros',
        logout: 'Cerrar sesión',
        login: 'Iniciar sesión',
      },

      messages: {
        successfullyCreated: 'Creado correctamente',
        successfullyUpdated: 'Actualizado correctamente',
        successfullyDeleted: 'Eliminado correctamente',
        noRecordsInResource: 'No hay registros en este recurso',
      },

      components: {
        DropZone: {
          placeholder: 'Arrastra tu archivo aquí o haz clic',
          acceptedSize: 'Tamaño máximo: {{maxSize}}',
          acceptedType: 'Tipos permitidos: {{mimeTypes}}',
          unsupportedSize: 'El archivo {{fileName}} es demasiado grande',
          unsupportedType: 'El archivo {{fileName}} tiene un tipo no permitido',
        },
      },
    },
  },
});

// Autenticación
const router = AdminJSExpress.buildAuthenticatedRouter(
  adminJs,
  {
    authenticate: async (email, password) => {
      const user = await Usuarios.findOne({ where: { email } });
      if (!user) return null;
      if (user.password === password) return { email: user.email };
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
