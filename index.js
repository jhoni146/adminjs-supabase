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
import Mensualidades from './models/Mensualidades.js';
import Votaciones from './models/Votaciones.js';
import { iniciarBotDiscord, notificarNuevasVotaciones, notificarResultadoVotacion } from './discord.js';

Miembros.hasMany(Mensualidades, { foreignKey: 'miembroId' });
Mensualidades.belongsTo(Miembros, { foreignKey: 'miembroId' });
Reclutas.hasMany(Mensualidades, { foreignKey: 'reclutaId' });
Mensualidades.belongsTo(Reclutas, { foreignKey: 'reclutaId' });

Reclutas.hasOne(Votaciones, { foreignKey: 'reclutaId' });
Votaciones.belongsTo(Reclutas, { foreignKey: 'reclutaId' });

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const componentLoader = new ComponentLoader();

componentLoader.add(
  'Empty',
  path.join(__dirname, 'adminjs/components/empty.js')
);

const app = express();

AdminJS.registerAdapter({
  Resource: AdminJSSequelize.Resource,
  Database: AdminJSSequelize.Database,
});

// ─────────────────────────────────────────────────────────────────
// 🟩 PARSEAR FECHA RECLUTA
// Soporta: "15-ene-2024" | "15/01/2024" | "2024-01-15"
// ─────────────────────────────────────────────────────────────────
function parsearFechaRecluta(fechaStr) {
  if (!fechaStr) return null;

  const mesesAbrev = {
    ene: 0, feb: 1, mar: 2, abr: 3, may: 4, jun: 5,
    jul: 6, ago: 7, sep: 8, oct: 9, nov: 10, dic: 11,
  };

  const matchAbrev = fechaStr.match(/^(\d{1,2})-([a-z]{3})-(\d{4})$/i);
  if (matchAbrev) {
    const [, dia, mes, anio] = matchAbrev;
    const mesIdx = mesesAbrev[mes.toLowerCase()];
    if (mesIdx !== undefined) return new Date(parseInt(anio), mesIdx, parseInt(dia));
  }

  const matchSlash = fechaStr.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (matchSlash) {
    const [, dia, mes, anio] = matchSlash;
    return new Date(parseInt(anio), parseInt(mes) - 1, parseInt(dia));
  }

  const d = new Date(fechaStr);
  if (!isNaN(d)) return d;

  return null;
}


// ─────────────────────────────────────────────────────────────────
// 🟩 GENERAR MENSUALIDADES AUTOMÁTICAS
// ─────────────────────────────────────────────────────────────────
async function generarMensualidadesAutomaticas() {
  const fecha = new Date();
  const meses = [
    'enero','febrero','marzo','abril','mayo','junio',
    'julio','agosto','septiembre','octubre','noviembre','diciembre'
  ];
  const mesActual = meses[fecha.getMonth()];

  const existentes = await Mensualidades.findOne({ where: { mes: mesActual } });
  if (existentes) {
    console.log(`Mensualidades de ${mesActual} ya existen. No se generan.`);
    return;
  }

  const miembros = await Miembros.findAll();
  for (const m of miembros) {
    await Mensualidades.create({
      miembroId: m.id, reclutaId: null,
      nombre: m.nombre, mes: mesActual,
      cuota: 3.50, pagado: false, nota: '',
    });
  }

  const reclutas = await Reclutas.findAll();
  for (const r of reclutas) {
    await Mensualidades.create({
      miembroId: null, reclutaId: r.id,
      nombre: r.nombre, mes: mesActual,
      cuota: 3.50, pagado: false, nota: '',
    });
  }

  console.log(`Mensualidades de ${mesActual} generadas para ${miembros.length} miembros y ${reclutas.length} reclutas.`);
}


// ─────────────────────────────────────────────────────────────────
// 🟩 GENERAR VOTACIONES AUTOMÁTICAS (≥2 meses)
// 1 fila por recluta. votos = { "email@x.com": "Pendiente", ... }
// ─────────────────────────────────────────────────────────────────
async function generarVotacionesAutomaticas() {
  const hoy = new Date();
  const reclutas = await Reclutas.findAll();
  const usuarios = await Usuarios.findAll();

  if (usuarios.length === 0) {
    console.log('Sin usuarios registrados, no se pueden generar votaciones.');
    return;
  }

  let generadas = 0;
  const votacionesNuevas = [];  // { nombre, id } para notificación Discord

  for (const recluta of reclutas) {
    const fechaInicio = parsearFechaRecluta(recluta.fechaInicio);
    if (!fechaInicio) continue;

    const diffMeses = (hoy - fechaInicio) / (1000 * 60 * 60 * 24 * 30.44);
    if (diffMeses < 2) continue;

    const yaExiste = await Votaciones.findOne({ where: { reclutaId: recluta.id } });
    if (yaExiste) continue;

    const votosIniciales = {};
    for (const u of usuarios) {
      votosIniciales[u.email] = 'Pendiente';
    }

    await Votaciones.create({
      reclutaId: recluta.id,
      reclutaNombre: recluta.nombre,
      votos: votosIniciales,
      fechaLimite: null,
    });

    generadas++;
    const votacionCreada = await Votaciones.findOne({ where: { reclutaId: recluta.id } });
    votacionesNuevas.push({ nombre: recluta.nombre, id: votacionCreada.id });
    console.log(`✅ Votación generada para "${recluta.nombre}" — usuarios: ${Object.keys(votosIniciales).join(', ')}`);
  }

  if (generadas === 0) {
    console.log('No hay nuevas votaciones que generar.');
  } else {
    console.log(`Total votaciones creadas: ${generadas}`);
    // Notificar a Discord con todos los reclutas nuevos de una sola vez
    await notificarNuevasVotaciones(votacionesNuevas);
  }
}


// ─────────────────────────────────────────────────────────────────
// 🟩 SCHEDULER DIARIO — comprueba a medianoche cada día
// ─────────────────────────────────────────────────────────────────
function iniciarSchedulerVotaciones() {
  function msHastaMedianoche() {
    const ahora = new Date();
    const maniana = new Date(
      ahora.getFullYear(), ahora.getMonth(), ahora.getDate() + 1,
      0, 0, 5
    );
    return maniana - ahora;
  }

  setTimeout(async () => {
    console.log('⏰ [Scheduler] Comprobación diaria de votaciones...');
    await generarVotacionesAutomaticas();

    setInterval(async () => {
      console.log('⏰ [Scheduler] Comprobación diaria de votaciones...');
      await generarVotacionesAutomaticas();
    }, 24 * 60 * 60 * 1000);

  }, msHastaMedianoche());

  const ms = msHastaMedianoche();
  const h = Math.floor(ms / 3600000);
  const m = Math.floor((ms % 3600000) / 60000);
  console.log(`⏰ [Scheduler] Próxima comprobación en ${h}h ${m}m (medianoche).`);
}


// ─────────────────────────────────────────────────────────────────
// 🟩 FUNCIÓN COMPARTIDA: lógica de mover recluta → miembro
// Usada tanto por el botón manual "Mover a Miembro" como por la
// promoción automática al alcanzar mayoría de votos Apto.
// ─────────────────────────────────────────────────────────────────
async function ejecutarMoverAMiembro(reclutaId) {
  const recluta = await Reclutas.findByPk(reclutaId);
  if (!recluta) throw new Error(`Recluta con id ${reclutaId} no encontrado.`);

  const nuevoMiembro = await Miembros.create({
    nombre:      recluta.nombre,
    fechaInicio: recluta.fechaInicio,
    plataforma:  recluta.plataforma,
  });

  const mensualidades = await Mensualidades.findAll({ where: { reclutaId: recluta.id } });
  for (const m of mensualidades) {
    await m.update({ miembroId: nuevoMiembro.id, reclutaId: null });
  }

  await Votaciones.destroy({ where: { reclutaId: recluta.id } });
  await Reclutas.destroy({ where: { id: recluta.id } });

  console.log(`🎖️  "${recluta.nombre}" movido a miembro (id: ${nuevoMiembro.id})`);
  return recluta.nombre;
}


// ─────────────────────────────────────────────────────────────────
// 🟩 HELPER: promover recluta a miembro si la mayoría votó Apto
// Se llama después de cada voto. Si todos han votado y la mayoría
// es Apto, ejecuta la promoción automáticamente.
// ─────────────────────────────────────────────────────────────────
async function promoverSiApto(votacion) {
  const votos = votacion.votos || {};
  const valores = Object.values(votos);

  // Esperar a que todos hayan votado
  const pendientes = valores.filter(v => v === 'Pendiente').length;
  if (pendientes > 0) return null;

  const aptos   = valores.filter(v => v === 'Apto').length;
  const noAptos = valores.filter(v => v === 'No apto').length;
  const nombre  = votacion.reclutaNombre;

  if (aptos > noAptos) {
    // ✅ Mayoría Apto → promover y notificar
    const promovido = await ejecutarMoverAMiembro(votacion.reclutaId);
    await notificarResultadoVotacion(nombre, 'apto', votos);
    return promovido;
  } else {
    // ❌ Mayoría No apto → solo notificar, la votación permanece
    await notificarResultadoVotacion(nombre, 'no_apto', votos);
    return null;
  }
}



// Entrada:  { "admin@fear.com": "Apto", "carlos@fear.com": "Pendiente" }
// Salida:   "admin: ✅ Apto | carlos: ⏳ Pendiente"
// ─────────────────────────────────────────────────────────────────
function formatearVotos(votos) {
  if (!votos || typeof votos !== 'object') return '—';
  const iconos = { 'Apto': '✅', 'No apto': '❌', 'Pendiente': '⏳' };
  return Object.entries(votos)
    .map(([email, valor]) => {
      const nombre = email.split('@')[0];
      const icono  = iconos[valor] ?? '❓';
      return `${nombre}: ${icono} ${valor}`;
    })
    .join(' | ');
}


// ─────────────────────────────────────────────────────────────────
// CONFIGURACIÓN ADMINJS
// ─────────────────────────────────────────────────────────────────
const adminJs = new AdminJS({
  componentLoader,

  resources: [

    // ── USUARIOS ──────────────────────────────────────────────────
    {
      resource: Usuarios,
      options: {
        navigation: { name: 'MENU', icon: 'Menu' },
        properties: {
          password: { type: 'password' },
        },
      },
    },

    // ── MIEMBROS ──────────────────────────────────────────────────
    {
      resource: Miembros,
      options: {
        navigation: { name: 'MENU', icon: 'User' },
        listProperties: ['nombre', 'fechaInicio', 'plataforma', 'id'],
        properties: {
          nombre: { isTitle: true },
          plataforma: {
            type: 'string',
            availableValues: [
              { value: 'PLAYSTATION', label: 'PLAYSTATION' },
              { value: 'XBOX',        label: 'XBOX' },
              { value: 'PC',          label: 'PC' },
            ],
          },
        },
        actions: {
          new: {
            after: async (response, request, context) => {
              const { record } = context;
              if (!record) return response;

              const meses = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre'];
              const mesActual = meses[new Date().getMonth()];

              const existente = await Mensualidades.findOne({
                where: { miembroId: record.id(), mes: mesActual }
              });

              if (!existente) {
                await Mensualidades.create({
                  miembroId: record.id(), reclutaId: null,
                  nombre: record.param('nombre'), mes: mesActual,
                  cuota: 3.50, pagado: false, nota: ''
                });
                console.log(`Mensualidad creada para miembro ${record.param('nombre')}`);
              }
              return response;
            }
          }
        }
      }
    },

    // ── MENSUALIDADES ─────────────────────────────────────────────
    {
      resource: Mensualidades,
      options: {
        navigation: { name: 'MENU', icon: 'Money' },
        sort: { sortBy: 'mes', direction: 'desc' },
        listProperties: ['nombre', 'mes', 'cuota', 'pagado', 'nota', 'id'],
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
              { value: 'enero',      label: 'Enero' },
              { value: 'febrero',    label: 'Febrero' },
              { value: 'marzo',      label: 'Marzo' },
              { value: 'abril',      label: 'Abril' },
              { value: 'mayo',       label: 'Mayo' },
              { value: 'junio',      label: 'Junio' },
              { value: 'julio',      label: 'Julio' },
              { value: 'agosto',     label: 'Agosto' },
              { value: 'septiembre', label: 'Septiembre' },
              { value: 'octubre',    label: 'Octubre' },
              { value: 'noviembre',  label: 'Noviembre' },
              { value: 'diciembre',  label: 'Diciembre' },
            ],
          },
          pagado: {
            type: 'boolean',
            availableValues: [
              { value: true,  label: 'Pagado' },
              { value: false, label: 'No pagado' },
            ],
          },
        },
        actions: {
          marcarPagado: {
            actionType: 'bulk',
            icon: 'Check',
            label: 'Marcar como pagado',
            guard: '¿Marcar estas mensualidades como pagadas?',
            component: false,
            handler: async (request, response, context) => {
              const { records } = context;
              for (const record of records) await record.update({ pagado: true });
              return {
                redirectUrl: `${context.h.resourceUrl()}?refresh=${Date.now()}`,
                notice: { message: `Se marcaron ${records.length} mensualidades como pagadas`, type: 'success' },
              };
            }
          }
        }
      }
    },

    // ── RECLUTAS ──────────────────────────────────────────────────
    {
      resource: Reclutas,
      options: {
        navigation: { name: 'MENU', icon: 'UserCheck' },
        listProperties: ['nombre', 'fechaInicio', 'evaluacion', 'cursos', 'id'],
        properties: {
          nombre: { isTitle: true },
          fechaInicio: { type: 'string' },
          cursos: {
            type: 'string',
            isArray: true,
            availableValues: [
              { value: 'Cibi',           label: 'Cibi' },
              { value: 'Medico',         label: 'Médico' },
              { value: 'Formaciones',    label: 'Formaciones' },
              { value: 'Mout',           label: 'MOUT' },
              { value: 'Cqb',            label: 'CQB' },
              { value: 'Comunicaciones', label: 'Comunicaciones' },
              { value: 'Orientacion',    label: 'Orientación' },
            ],
          },
          evaluacion: {
            type: 'string',
            availableValues: [
              { value: 'Apto',    label: 'Apto' },
              { value: 'No apto', label: 'No apto' },
            ],
            isVisible: { list: true, edit: true, show: true, filter: true },
          },
        },
        actions: {
          new: {
            before: async (request) => {
              if (request.payload?.fechaInicio) {
                const [day, month, year] = request.payload.fechaInicio.split('/');
                const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                request.payload.fechaInicio = `${day}-${months[parseInt(month) - 1]}-${year}`;
              }
              return request;
            },
            after: async (response, request, context) => {
              const { record } = context;
              if (!record) return response;

              const meses = ['enero','febrero','marzo','abril','mayo','junio',
                'julio','agosto','septiembre','octubre','noviembre','diciembre'];
              const mesActual = meses[new Date().getMonth()];

              const existente = await Mensualidades.findOne({
                where: { reclutaId: record.id(), mes: mesActual }
              });
              if (!existente) {
                await Mensualidades.create({
                  reclutaId: record.id(), miembroId: null,
                  nombre: record.param('nombre'), mes: mesActual,
                  cuota: 3.50, pagado: false, nota: ''
                });
                console.log(`Mensualidad creada para recluta ${record.param('nombre')}`);
              }
              return response;
            }
          },

          edit: {
            before: async (request) => {
              if (request.payload?.fechaInicio) {
                const value = request.payload.fechaInicio;
                if (value.includes('-')) return request;
                const [day, month, year] = value.split('/');
                const months = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
                request.payload.fechaInicio = `${day}-${months[parseInt(month) - 1]}-${year}`;
              }
              return request;
            },
          },

          moverAMiembro: {
            actionType: 'record',
            icon: 'UserPlus',
            label: 'Mover a Miembro',
            guard: '¿Seguro que quieres convertir este recluta en miembro?',
            component: false,
            isAccessible: true,
            isVisible: true,
            handler: async (request, response, context) => {
              const { record } = context;
              if (!record) throw new Error('No se encontró el recluta.');

              // Usa la misma función compartida que la promoción automática
              await ejecutarMoverAMiembro(record.params.id);

              return {
                record: record.toJSON(),
                notice: { message: 'Recluta movido a miembro correctamente', type: 'success' },
              };
            }
          }
        }
      },
    },

    // ── VOTACIONES ────────────────────────────────────────────────
    {
      resource: Votaciones,
      options: {
        navigation: { name: 'MENU', icon: 'Ballot' },

        sort: { sortBy: 'fechaLimite', direction: 'asc' },

        listProperties:   ['reclutaNombre', 'votosDisplay', 'fechaLimite', 'id'],
        showProperties:   ['reclutaNombre', 'votosDisplay', 'fechaLimite', 'createdAt'],
        editProperties:   [],
        filterProperties: ['reclutaNombre', 'fechaLimite'],

        properties: {
          reclutaNombre: {
            isTitle: true,
            label: 'Recluta',
          },

          // Campo sintético inyectado en los hooks after — NO es campo de BD ni virtual Sequelize
          votosDisplay: {
            label: 'Votos',
            type: 'string',
            isVisible: { list: true, edit: false, show: true, filter: false },
          },

          votos: {
            isVisible: { list: false, edit: false, show: false, filter: false },
          },

          fechaLimite: {
            label: 'Fecha límite',
            type: 'date',
            isVisible: { list: true, edit: false, show: true, filter: true },
          },

          createdAt: {
            label: 'Generada el',
            isVisible: { list: false, edit: false, show: true, filter: false },
          },
        },

        actions: {
          new:    { isAccessible: false, isVisible: false },
          edit:   { isAccessible: false, isVisible: false },
          delete: { isAccessible: false, isVisible: false },

          // ── HELPER: construir texto de votos desde el objeto JSONB ──
          // Transforma { "admin@x.com": "Apto", "otro@x.com": "Pendiente" }
          // en "admin: ✅ Apto | otro: ⏳ Pendiente"
          // e inyecta el valor en record.params para que AdminJS lo muestre

          // ── LIST: inyectar votosDisplay en cada record ──────────
          list: {
            after: async (response) => {
              if (!response.records) return response;

              // Cargar todos los ids de esta página de una sola query
              const ids = response.records.map(r => r.params.id).filter(Boolean);
              const filas = await Votaciones.findAll({ where: { id: ids } });
              const porId = {};
              for (const f of filas) porId[f.id] = f.votos || {};

              response.records = response.records.map((record) => {
                const votos = porId[record.params.id] || {};
                record.params.votosDisplay = formatearVotos(votos);
                return record;
              });

              return response;
            },
          },

          // ── SHOW: inyectar votosDisplay en el record ─────────────
          show: {
            after: async (response) => {
              if (!response.record) return response;

              const id = response.record.params?.id;
              if (id) {
                const fila = await Votaciones.findByPk(id);
                const votos = fila?.votos || {};
                response.record.params.votosDisplay = formatearVotos(votos);
              }

              return response;
            },
          },

          // ── VOTAR APTO ──────────────────────────────────────────
          votarApto: {
            actionType: 'record',
            icon: 'ThumbsUp',
            label: '✅ Votar Apto',
            guard: '¿Registrar tu voto como APTO?',
            component: false,
            isVisible: true,
            isAccessible: true,

            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              if (!record) throw new Error('Votación no encontrada.');

              const email = currentAdmin?.email;
              if (!email) throw new Error('No se pudo identificar al usuario.');

              const votacion = await Votaciones.findByPk(record.params.id);
              const nuevosVotos = { ...(votacion.votos || {}), [email]: 'Apto' };
              await votacion.update({ votos: nuevosVotos });

              const nombre = email.split('@')[0];

              // ¿Mayoría alcanzada? → promoción automática
              const promovido = await promoverSiApto(votacion);
              if (promovido) {
                return {
                  record: record.toJSON(),
                  notice: {
                    message: `"${nombre}" votó APTO. ¡"${promovido}" ha sido promovido a miembro automáticamente! 🎖️`,
                    type: 'success',
                  },
                };
              }

              const recordJson = record.toJSON();
              recordJson.params.votos = nuevosVotos;
              recordJson.params.votosDisplay = formatearVotos(nuevosVotos);

              return {
                record: recordJson,
                notice: { message: `"${nombre}" ha votado APTO`, type: 'success' },
              };
            },
          },

          // ── VOTAR NO APTO ────────────────────────────────────────
          votarNoApto: {
            actionType: 'record',
            icon: 'ThumbsDown',
            label: '❌ Votar No apto',
            guard: '¿Registrar tu voto como NO APTO?',
            component: false,
            isVisible: true,
            isAccessible: true,

            handler: async (request, response, context) => {
              const { record, currentAdmin } = context;
              if (!record) throw new Error('Votación no encontrada.');

              const email = currentAdmin?.email;
              if (!email) throw new Error('No se pudo identificar al usuario.');

              const votacion = await Votaciones.findByPk(record.params.id);
              const nuevosVotos = { ...(votacion.votos || {}), [email]: 'No apto' };
              await votacion.update({ votos: nuevosVotos });

              const nombre = email.split('@')[0];

              // Aunque vote No apto, comprobamos igualmente por si ya hay mayoría
              const promovido = await promoverSiApto(votacion);
              if (promovido) {
                return {
                  record: record.toJSON(),
                  notice: {
                    message: `"${nombre}" votó NO APTO. ¡"${promovido}" ha sido promovido a miembro automáticamente! 🎖️`,
                    type: 'success',
                  },
                };
              }

              const recordJson = record.toJSON();
              recordJson.params.votos = nuevosVotos;
              recordJson.params.votosDisplay = formatearVotos(nuevosVotos);

              return {
                record: recordJson,
                notice: { message: `"${nombre}" ha votado NO APTO`, type: 'error' },
              };
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
        primary80:  '#2d3f21',
        primary60:  '#3f5a2c',
        primary40:  '#577a3c',
        primary20:  '#7f9f5b',
        accent:     '#c2b280',
        hoverBg:    '#2d3f21',
      },
      fonts: {
        base:     '"Roboto Condensed", sans-serif',
        headings: '"Roboto Condensed", sans-serif',
      },
    },
  },

  locale: {
    language: 'es',
    availableLanguages: ['es', 'en'],
    translations: {
      properties: {
        email:       'Correo electrónico',
        password:    'Contraseña',
        fechaInicio: 'Fecha de inicio',
      },
      actions: {
        new:    'Crear',
        edit:   'Editar',
        delete: 'Eliminar',
        show:   'Ver',
        list:   'Listado',
      },
      buttons: {
        save:           'Guardar',
        addNewItem:     'Añadir',
        filter:         'Filtrar',
        applyChanges:   'Aplicar cambios',
        resetFilter:    'Reiniciar filtros',
        logout:         'Cerrar sesión',
        login:          'Iniciar sesión',
      },
      messages: {
        successfullyCreated: 'Creado correctamente',
        successfullyUpdated: 'Actualizado correctamente',
        successfullyDeleted: 'Eliminado correctamente',
        noRecordsInResource: 'No hay registros en este recurso',
      },
      components: {
        DropZone: {
          placeholder:     'Arrastra tu archivo aquí o haz clic',
          acceptedSize:    'Tamaño máximo: {{maxSize}}',
          acceptedType:    'Tipos permitidos: {{mimeTypes}}',
          unsupportedSize: 'El archivo {{fileName}} es demasiado grande',
          unsupportedType: 'El archivo {{fileName}} tiene un tipo no permitido',
        },
      },
    },
  },
});

// ─────────────────────────────────────────────────────────────────
// AUTENTICACIÓN
// ─────────────────────────────────────────────────────────────────
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

app.get('/', (req, res) => res.redirect('/admin'));

const port = process.env.PORT || 3000;

try {
  await sequelize.authenticate();
  console.log('Conectado a Supabase (Postgres)');
  await sequelize.sync({ alter: { drop: false } });

  iniciarBotDiscord();  // 🤖 Conectar bot Discord
  await generarMensualidadesAutomaticas();
  await generarVotacionesAutomaticas();
  iniciarSchedulerVotaciones();

  app.listen(port, () => {
    console.log(`Servidor escuchando en puerto ${port}`);
    console.log(`AdminJS en http://localhost:${port}${adminJs.options.rootPath}`);
  });
} catch (err) {
  console.error('Error al iniciar:', err);
}
