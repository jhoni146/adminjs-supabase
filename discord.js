import { Client, GatewayIntentBits, Events } from 'discord.js';

// ─────────────────────────────────────────────────────────────────
// Cliente Discord — se inicializa una vez al arrancar el servidor
// ─────────────────────────────────────────────────────────────────
const DISCORD_TOKEN   = process.env.DISCORD_TOKEN;
const DISCORD_CANAL   = process.env.DISCORD_CANAL_ID;   // ID del canal de texto
const DISCORD_ROL     = process.env.DISCORD_ROL_ID;     // ID del rol a mencionar

let clienteListo = false;
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, (c) => {
  clienteListo = true;
  console.log(`🤖 [Discord] Bot conectado como "${c.user.tag}"`);
});

// Función interna: enviar mensaje al canal configurado
async function enviarMensaje(texto) {
  if (!DISCORD_TOKEN || !DISCORD_CANAL) {
    console.warn('⚠️  [Discord] DISCORD_TOKEN o DISCORD_CANAL_ID no configurados — notificación omitida.');
    return;
  }

  if (!clienteListo) {
    console.warn('⚠️  [Discord] Bot aún no listo — notificación omitida.');
    return;
  }

  try {
    const canal = await client.channels.fetch(DISCORD_CANAL);
    if (!canal || !canal.isTextBased()) {
      console.warn('⚠️  [Discord] Canal no encontrado o no es de texto.');
      return;
    }
    await canal.send(texto);
  } catch (err) {
    console.error('❌ [Discord] Error al enviar mensaje:', err.message);
  }
}

// Mención del rol si está configurado, vacío si no
function mencionRol() {
  return DISCORD_ROL ? `<@&${DISCORD_ROL}>` : '';
}


// ─────────────────────────────────────────────────────────────────
// 🟩 NOTIFICACIÓN: nueva(s) votación(es) generada(s)
// Llamar con un array de nombres de reclutas
// ─────────────────────────────────────────────────────────────────
export async function notificarNuevasVotaciones(nombresReclutas) {
  if (!nombresReclutas || nombresReclutas.length === 0) return;

  const lista = nombresReclutas.map(n => `• **${n}**`).join('\n');
  const rol   = mencionRol();

  const mensaje =
    `${rol ? rol + '\n' : ''}` +
    `⚔️ **Nueva votación de admisión** ⚔️\n` +
    `Los siguientes reclutas han cumplido 2 meses y están listos para ser evaluados:\n\n` +
    `${lista}\n\n` +
    `Entrad en el panel de administración y emitid vuestro voto ✅ / ❌`;

  await enviarMensaje(mensaje);
}


// ─────────────────────────────────────────────────────────────────
// 🟩 NOTIFICACIÓN: votación finalizada — resultado
// resultado: 'apto' | 'no_apto'
// votos: { "admin@x.com": "Apto", ... }
// ─────────────────────────────────────────────────────────────────
export async function notificarResultadoVotacion(nombreRecluta, resultado, votos) {
  const rol = mencionRol();

  // Construir resumen de votos con nombres (antes del @)
  const resumen = Object.entries(votos || {})
    .map(([email, voto]) => {
      const nombre = email.split('@')[0];
      const icono  = voto === 'Apto' ? '✅' : voto === 'No apto' ? '❌' : '⏳';
      return `  ${icono} ${nombre}: **${voto}**`;
    })
    .join('\n');

  const aptos   = Object.values(votos || {}).filter(v => v === 'Apto').length;
  const noAptos = Object.values(votos || {}).filter(v => v === 'No apto').length;

  let mensaje;
  if (resultado === 'apto') {
    mensaje =
      `${rol ? rol + '\n' : ''}` +
      `🎖️ **Votación finalizada — APTO** 🎖️\n` +
      `El recluta **${nombreRecluta}** ha sido aprobado por mayoría y promovido a **Miembro**.\n\n` +
      `📊 Resultado (${aptos} Apto / ${noAptos} No apto):\n${resumen}`;
  } else {
    mensaje =
      `${rol ? rol + '\n' : ''}` +
      `🚫 **Votación finalizada — NO APTO** 🚫\n` +
      `El recluta **${nombreRecluta}** no ha alcanzado la mayoría necesaria.\n\n` +
      `📊 Resultado (${aptos} Apto / ${noAptos} No apto):\n${resumen}`;
  }

  await enviarMensaje(mensaje);
}


// ─────────────────────────────────────────────────────────────────
// Iniciar el bot — llamar una sola vez al arrancar el servidor
// ─────────────────────────────────────────────────────────────────
export function iniciarBotDiscord() {
  if (!DISCORD_TOKEN) {
    console.warn('⚠️  [Discord] DISCORD_TOKEN no definido — bot desactivado.');
    return;
  }
  client.login(DISCORD_TOKEN).catch(err => {
    console.error('❌ [Discord] Error al conectar el bot:', err.message);
  });
}
