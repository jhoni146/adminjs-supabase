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
import Miembros from './models/Miembros.js';
import Mensualidad from './models/Mensualidad.js';

Miembros.hasMany(Mensualidad, { foreignKey: 'miembroId' });
Mensualidad.belongsTo(Miembros, { foreignKey: 'miembroId' });
Reclutas.hasMany(Mensualidad, { foreignKey: 'reclutaId' });
Mensualidad.belongsTo(Reclutas, { foreignKey: 'reclutaId' });


const __dirname = path.dirname(fileURLToPath(import.meta.url));

const componentLoader = new ComponentLoader();
const Components = {
  Dashboard: componentLoader.add(
  'Dashboard',
  path.join(__dirname, 'components', 'dashboard.jsx')
),
};

const app = express();

// Registrar adapter
AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

// 🟩 FUNCIÓN AUTOMÁTICA PARA GENERAR MENSUALIDADES
async function generarMensualidadesAutomaticas() {
  const fecha = new Date();
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];

  const mesActual = meses[fecha.getMonth()];

  // ¿Ya existen mensualidades de este mes?
  const existentes = await Mensualidad.findOne({ where: { mes: mesActual } });

  if (existentes) {
    console.log(`Mensualidades de ${mesActual} ya existen. No se generan.`);
    return;
  }

  // 🟩 GENERAR PARA MIEMBROS
  const miembros = await Miembros.findAll();

  for (const m of miembros) {
    await Mensualidad.create({
      miembroId: m.id,
      reclutaId: null,
      nombre: m.nombre,
      mes: mesActual,
      cuota: 3.50,
      pagado: false,
      nota: '',
    });
  }

  // 🟩 GENERAR PARA RECLUTAS
  const reclutas = await Reclutas.findAll();

  for (const r of reclutas) {
    await Mensualidad.create({
      miembroId: null,
      reclutaId: r.id,
      nombre: r.nombre,
      mes: mesActual,
      cuota: 3.50,
      pagado: false,
      nota: '',
    });
  }

  console.log(
    `Mensualidades de ${mesActual} generadas automáticamente para ${miembros.length} miembros y ${reclutas.length} reclutas.`
  );
}


// Configuración AdminJS
const adminJs = new AdminJS({
  dashboard: {
  component: Components.Dashboard,
  handler: async () => {
    const totalMiembros = await Miembros.count();
    const totalReclutas = await Reclutas.count();
    const totalGeneral = totalMiembros + totalReclutas;

    const fecha = new Date();
    const meses = [
      'enero','febrero','marzo','abril','mayo','junio',
      'julio','agosto','septiembre','octubre','noviembre','diciembre'
    ];
    const mesActual = meses[fecha.getMonth()];

    const pendientes = await Mensualidad.count({
      where: { pagado: false, mes: mesActual }
    });

    const pendientesMiembros = await Mensualidad.count({
      where: { pagado: false, mes: mesActual, miembroId: { not: null } }
    });

    const pendientesReclutas = await Mensualidad.count({
      where: { pagado: false, mes: mesActual, reclutaId: { not: null } }
    });

    return {
      totalMiembros,
      totalReclutas,
      totalGeneral,
      pendientes,
      pendientesMiembros,
      pendientesReclutas,
    };
  }
},

  componentLoader,

  resources: [
    // 🟩 USUARIOS
    {
      resource: Usuarios,
      options: {
        navigation: {
          name: 'MENU',
          icon: 'Menu',
        },
        properties: {
          password: { type: 'password' },
        },
      },
    },

    // 🟩 MIEMBROS
    {
      resource: Miembros,
      options: {
        navigation: {
          name: 'MENU',
          icon: 'User',
        },

        listProperties: ['nombre', 'fechaInicio', 'plataforma', 'id'],

        properties: {
          nombre: {
            isTitle: true,
          },
          plataforma: {
            type: 'string',
            availableValues: [
              { value: 'PLAYSTATION', label: 'PLAYSTATION' },
              { value: 'XBOX', label: 'XBOX' },
              { value: 'PC', label: 'PC' },
            ],
          },
        },
      },
    },

    // 🟩 MENSUALIDADES (SIN ACCIONES)
    {
      resource: Mensualidad,
      options: {
        navigation: {
          name: 'MENU',
          icon: 'Money',
        },

        listProperties: [
        'nombre',
        'mes',
        'cuota',
        'pagado',
        'nota',
        'id',
        ],

        properties: {
          miembroId: {
            reference: 'Miembros',
            isVisible: { list: true, edit: true, show: true, filter: true },
            populate: true,
          },

          reclutaId: {
            reference: 'Reclutas',
            isVisible: { list: true, edit: true, show: true, filter: true },
            populate: true,
          },
          nombre: {
          isTitle: true,
          isVisible: { list: true, edit: false, show: true, filter: true },
        },

          mes: {
            type: 'string',
            availableValues: [
              { value: 'enero', label: 'Enero' },
              { value: 'febrero', label: 'Febrero' },
              { value: 'marzo', label: 'Marzo' },
              { value: 'abril', label: 'Abril' },
              { value: 'mayo', label: 'Mayo' },
              { value: 'junio', label: 'Junio' },
              { value: 'julio', label: 'Julio' },
              { value: 'agosto', label: 'Agosto' },
              { value: 'septiembre', label: 'Septiembre' },
              { value: 'octubre', label: 'Octubre' },
              { value: 'noviembre', label: 'Noviembre' },
              { value: 'diciembre', label: 'Diciembre' },
            ],
          },

          pagado: {
            type: 'boolean',
            availableValues: [
              { value: true, label: 'Pagado' },
              { value: false, label: 'No pagado' },
            ],
          },
        },
      },
    },

    // 🟩 RECLUTAS
    {
      resource: Reclutas,
      options: {
        navigation: {
          name: 'MENU',
          icon: 'Menu',
        },
        listProperties: [
          'id',
          'nombre',
          'fechaInicio',
          'plataforma',
          'cursos',
          'nota',
          'evaluacion',
        ],
        properties: {
          nombre: {
            isTitle: true,
          },
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
          evaluacion: {
            type: 'string',
            availableValues: [
              { value: 'Apto', label: 'Apto' },
              { value: 'No apto', label: 'No apto' },
            ],
            isVisible: {
              list: true,
              edit: true,
              show: true,
              filter: true,
            },
          },
        },

        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.fechaInicio) {
                const [day, month, year] = request.payload.fechaInicio.split('/');

                const months = [
                  'ene','feb','mar','abr','may','jun',
                  'jul','ago','sep','oct','nov','dic'
                ];

                const monthName = months[parseInt(month) - 1];

                request.payload.fechaInicio = `${day}-${monthName}-${year}`;
              }
              return request;
            },
          },

          edit: {
            before: async (request) => {
              if (request.payload?.fechaInicio) {
                const value = request.payload.fechaInicio;

                if (value.includes('-')) {
                  return request;
                }

                const [day, month, year] = value.split('/');

                const months = [
                  'ene','feb','mar','abr','may','jun',
                  'jul','ago','sep','oct','nov','dic'
                ];

                const monthName = months[parseInt(month) - 1];

                request.payload.fechaInicio = `${day}-${monthName}-${year}`;
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

import { bundle } from '@adminjs/bundler';
bundle(adminJs);

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
  await sequelize.sync({ alter: true });

  // 🟩 GENERACIÓN AUTOMÁTICA AQUÍ
  await generarMensualidadesAutomaticas();

  app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
    console.log(`AdminJS en http://localhost:${port}${adminJs.options.rootPath}`);
  });
} catch (err) {
  console.error('Error al iniciar:', err);
}
