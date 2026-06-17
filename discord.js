import { REST, Routes } from 'discord.js';

const DISCORD_TOKEN = process.env.DISCORD_TOKEN;
const DISCORD_CANAL = process.env.DISCORD_CANAL_ID;
const DISCORD_ROL   = process.env.DISCORD_ROL_ID;
const APP_URL       = (process.env.APP_URL || 'https://reclutas.clanfear.es').replace(/\/$/, '');

function mencionRol() {
  return DISCORD_ROL ? `<@&${DISCORD_ROL}>` : '';
}

async function enviarMensaje(content) {
  // 🔍 LOG: mostrar estado de las variables al intentar enviar
  console.log('[Discord] Intentando enviar mensaje...');
  console.log(`[Discord] TOKEN definido: ${!!DISCORD_TOKEN} | CANAL: ${DISCORD_CANAL ?? 'NO DEFINIDO'} | ROL: ${DISCORD_ROL ?? 'no definido'}`);

  if (!DISCORD_TOKEN || !DISCORD_CANAL) {
    console.warn('⚠️  [Discord] DISCORD_TOKEN o DISCORD_CANAL_ID no configurados — notificación omitida.');
    return;
  }

  try {
    const rest = new REST({ version: '10' }).setToken(DISCORD_TOKEN);
    console.log(`[Discord] Enviando al canal ${DISCORD_CANAL}...`);
    await rest.post(Routes.channelMessages(DISCORD_CANAL), { body: { content } });
    console.log('✅ [Discord] Mensaje enviado correctamente.');
  } catch (err) {
    // Log completo del error para ver el código y mensaje de Discord
    console.error('❌ [Discord] Error al enviar mensaje:');
    console.error(`   Código: ${err.code ?? 'sin código'}`);
    console.error(`   Status: ${err.status ?? 'sin status'}`);
    console.error(`   Mensaje: ${err.message}`);
    if (err.rawError) console.error(`   Raw: ${JSON.stringify(err.rawError)}`);
  }
}

// ─────────────────────────────────────────────────────────────────
// 🟩 Nueva(s) votación(es) generada(s)
// votaciones: [{ nombre, id }]
// ─────────────────────────────────────────────────────────────────
export async function notificarNuevasVotaciones(votaciones) {
  if (!votaciones?.length) return;

  console.log(`[Discord] notificarNuevasVotaciones llamada con: ${votaciones.map(v => v.nombre).join(', ')}`);

  const lista = votaciones
    .map(v => `• **${v.nombre}** → ${APP_URL}/admin/resources/Votaciones/records/${v.id}/show`)
    .join('\n');
  const rol = mencionRol();

  await enviarMensaje(
    `${rol ? rol + '\n' : ''}` +
    `⚔️ **Nueva votación de admisión** ⚔️\n` +
    `Los siguientes reclutas han cumplido 2 meses y están listos para ser evaluados:\n\n` +
    `${lista}\n\n` +
    `Entrad en el enlace y emitid vuestro voto ✅ / ❌`
  );
}

// ─────────────────────────────────────────────────────────────────
// 🟩 Votación finalizada — resultado
// ─────────────────────────────────────────────────────────────────
export async function notificarResultadoVotacion(nombreRecluta, resultado, votos) {
  console.log(`[Discord] notificarResultadoVotacion llamada — recluta: ${nombreRecluta}, resultado: ${resultado}`);

  const rol = mencionRol();

  const resumen = Object.entries(votos || {})
    .map(([email, voto]) => {
      const nombre = email.split('@')[0];
      const icono  = voto === 'Apto' ? '✅' : voto === 'No apto' ? '❌' : '⏳';
      return `  ${icono} ${nombre}: **${voto}**`;
    })
    .join('\n');

  const aptos   = Object.values(votos || {}).filter(v => v === 'Apto').length;
  const noAptos = Object.values(votos || {}).filter(v => v === 'No apto').length;

  if (resultado === 'apto') {
    await enviarMensaje(
      `${rol ? rol + '\n' : ''}` +
      `🎖️ **Votación finalizada — APTO** 🎖️\n` +
      `El recluta **${nombreRecluta}** ha sido aprobado y promovido a **Miembro**.\n\n` +
      `📊 Resultado (${aptos} Apto / ${noAptos} No apto):\n${resumen}`
    );
  } else {
    await enviarMensaje(
      `${rol ? rol + '\n' : ''}` +
      `🚫 **Votación finalizada — NO APTO** 🚫\n` +
      `El recluta **${nombreRecluta}** no ha alcanzado la mayoría necesaria.\n\n` +
      `📊 Resultado (${aptos} Apto / ${noAptos} No apto):\n${resumen}`
    );
  }
}

// ─────────────────────────────────────────────────────────────────
// 🟩 Nuevo recluta creado
// ─────────────────────────────────────────────────────────────────
export async function notificarNuevoRecluta(nombre, fechaInicio) {
  console.log(`[Discord] notificarNuevoRecluta: ${nombre}`);
  await enviarMensaje(
    `🪖 **Nuevo recluta incorporado**\n` +
    `**${nombre}** se ha unido al clan como recluta.\n` +
    `📅 Fecha de inicio: **${fechaInicio || 'sin fecha'}**\n` +
    `La votación de admisión se generará automáticamente a los 2 meses.`
  );
}

// ─────────────────────────────────────────────────────────────────
// 🟩 Mensualidades generadas
// ─────────────────────────────────────────────────────────────────
export async function notificarMensualidadesGeneradas(mes, totalMiembros, totalReclutas) {
  console.log(`[Discord] notificarMensualidadesGeneradas: ${mes}`);
  await enviarMensaje(
    `💰 **Mensualidades de ${mes} generadas**\n` +
    `Se han creado las cuotas del mes para **${totalMiembros}** miembro(s) y **${totalReclutas}** recluta(s).\n` +
    `Recordad realizar el pago de 3,50€ 💸`
  );
}

// ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────
export function iniciarBotDiscord() {
  console.log('[Discord] iniciarBotDiscord llamada.');
  console.log(`[Discord] TOKEN definido: ${!!DISCORD_TOKEN} | CANAL: ${DISCORD_CANAL ?? 'NO DEFINIDO'} | ROL: ${DISCORD_ROL ?? 'no definido'}`);

  if (!DISCORD_TOKEN) {
    console.warn('⚠️  [Discord] DISCORD_TOKEN no definido — notificaciones desactivadas.');
    return;
  }
  console.log('🤖 [Discord] Notificaciones via REST activadas.');
}
