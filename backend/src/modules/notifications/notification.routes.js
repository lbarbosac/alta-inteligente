// Arquivo: backend/src/modules/notifications/notification.routes.js
// GET /api/v1/cron/lembretes — no site publicado não existe servidor sempre ligado para o
// setInterval do notification.scheduler. Quem dispara o lembrete é a Vercel, uma vez por dia
// ("crons" no vercel.json), mandando o CRON_SECRET no cabeçalho Authorization.
const { Router } = require('express');
const service = require('./notification.service');
const { env } = require('../../shared/config/env');

const router = Router();

router.get('/lembretes', async (req, res) => {
  if (!env.CRON_SECRET || req.headers.authorization !== `Bearer ${env.CRON_SECRET}`) {
    return res.status(401).json({ success: false, message: 'Não autorizado.' });
  }
  if (!env.LEMBRETES_ATIVOS) return res.json({ success: true, data: { desligados: true } });
  const resultado = await service.enviarLembretesPendentes();
  return res.json({ success: true, data: resultado });
});

module.exports = router;
