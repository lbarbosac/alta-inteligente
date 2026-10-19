// Servidor para rodar no computador (npm run dev). A configuração do Express fica no app.js.
const app = require('./app');
const { env } = require('./shared/config/env');
const { connectDatabase, disconnectDatabase } = require('./shared/database/connection');
const { iniciarLembretes } = require('./modules/notifications/notification.scheduler');

// ─── Inicialização ─────────────────────────────────────────────────────────
async function bootstrap() {
  await connectDatabase();
  iniciarLembretes();

  app.listen(env.PORT, () => {
    console.log(`🚀 AltaInteligente API rodando na porta ${env.PORT}`);
    console.log(`📡 Health: http://localhost:${env.PORT}/health`);
    console.log(`🌍 Ambiente: ${env.NODE_ENV}`);
  });
}

// ─── Encerramento gracioso ─────────────────────────────────────────────────
process.on('SIGINT',  async () => { await disconnectDatabase(); process.exit(0); });
process.on('SIGTERM', async () => { await disconnectDatabase(); process.exit(0); });

bootstrap();

module.exports = app;
