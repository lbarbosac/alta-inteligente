// Arquivo: backend/src/modules/notifications/notification.scheduler.js
// Roda dentro do próprio servidor, a cada 5 minutos. Exige servidor sempre ligado
// (VPS, Railway, Render pago…). Em hospedagem que "dorme", o lembrete não sai.
const service = require('./notification.service');
const { env } = require('../../shared/config/env');

const INTERVALO_MS = 5 * 60 * 1000;

function iniciarLembretes() {
  if (!env.LEMBRETES_ATIVOS) {
    console.log('⏸️  Lembretes automáticos desligados (LEMBRETES_ATIVOS=false).');
    return null;
  }

  const rodar = async () => {
    try {
      const { enviados, simulados, falhas } = await service.enviarLembretesPendentes();
      if (enviados || simulados || falhas) console.log(`[lembretes] enviados: ${enviados} · simulados: ${simulados} · falhas: ${falhas}`);
    } catch (err) {
      console.error('[lembretes] erro ao processar:', err.message);
    }
  };

  setTimeout(rodar, 10_000);
  return setInterval(rodar, INTERVALO_MS);
}

module.exports = { iniciarLembretes };
