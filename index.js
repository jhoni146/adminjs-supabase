import 'dotenv/config';
import express from 'express';
import AdminJS from 'adminjs';
import AdminJSExpress from '@adminjs/express';
import AdminJSSequelize from '@adminjs/sequelize';
import { sequelize } from './db.js';
import Recluta from './models/Recluta.js';
import Usuario from './models/Usuario.js';

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
  resource: Usuario,
  options: {
    properties: {
      password: { type: 'password' }
    }
  }
},
{
  resource: Recluta,
  options: {
    properties: {
      // 🟩 La fecha se guarda como STRING
      fechaInicio: {
        type: 'string',
      },

      // 🟩 Multiselect de cursos
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
        ]
      }
    },

    // 🟩 Hooks para formatear la fecha ANTES de guardar
    actions: {
      new: {
        before: async (request) => {
          if (request.payload && request.payload.fechaInicio) {
            const raw = request.payload.fechaInicio;
            const date = new Date(raw);

            const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            const day = String(date.getDate()).padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();

            request.payload.fechaInicio = `${day}-${month}-${year}`;
          }
          return request;
        }
      },

      edit: {
        before: async (request) => {
          if (request.payload && request.payload.fechaInicio) {
            const raw = request.payload.fechaInicio;
            const date = new Date(raw);

            const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
            const day = String(date.getDate()).padStart(2, '0');
            const month = months[date.getMonth()];
            const year = date.getFullYear();

            request.payload.fechaInicio = `${day}-${month}-${year}`;
          }
          return request;
        }
      }
    }
  }
}


  ],

  rootPath: '/admin',

  branding: {
    companyName: 'Reclutas - Clan F.E.A.R',
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

dashboard: {
  handler: async () => {
    const totalReclutas = await Recluta.count();
    const totalUsuarios = await Usuario.count();

    return {
      mensaje: "Panel del Clan F.E.A.R",
      reclutas: totalReclutas,
      usuarios: totalUsuarios
    };
  }
},





locale: {
  language: 'es',
  translations: {
    labels: {
      navigation: 'Navegación',
      filters: 'Filtros',
      actions: 'Acciones',
      pages: 'Páginas',
      Recluta: 'Reclutas',
      Usuario: 'Usuarios',
    },

    resources: {
      Recluta: {
        properties: {
          nombre: 'Nombre',
          plataforma: 'Plataforma',
          fechaInicio: 'Fecha de inicio',
          cursos: 'Cursos',
        },
        actions: {
          new: 'Crear recluta',
          edit: 'Editar recluta',
          show: 'Ver recluta',
          delete: 'Eliminar recluta',
          list: 'Lista de reclutas',
        }
      },

      Usuario: {
        properties: {
          email: 'Correo electrónico',
          password: 'Contraseña',
        },
        actions: {
          new: 'Crear usuario',
          edit: 'Editar usuario',
          show: 'Ver usuario',
          delete: 'Eliminar usuario',
          list: 'Lista de usuarios',
        }
      }
    },

    messages: {
      loginWelcome: 'Panel del Clan Milsim',
      successfullyUpdated: 'Actualizado correctamente',
      successfullyCreated: 'Creado correctamente',
      successfullyDeleted: 'Eliminado correctamente',
      noRecordsInResource: 'No hay registros en este recurso',
    },

    buttons: {
      save: 'Guardar',
      addNewItem: 'Añadir nuevo',
      filter: 'Filtrar',
      applyChanges: 'Aplicar cambios',
      resetFilter: 'Reiniciar filtros',
      confirmRemovalMany: 'Confirmar eliminación',
      logout: 'Cerrar sesión',
      login: 'Iniciar sesión',
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
      // Buscar usuario en la base de datos
      const user = await Usuario.findOne({ where: { email } });
      if (!user) return null;

      // Comparación simple (sin encriptar)
      if (user.password === password) {
        return { email: user.email };
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
