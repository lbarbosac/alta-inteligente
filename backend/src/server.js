const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { env }               = require('./shared/config/env');
const { router }            = require('./routes/index');
const { errorHandler }      = require('./shared/middlewares/errorHandler');
const { requestLogger }     = require('./shared/middlewares/requestLogger');
const { globalRateLimiter } = require('./shared/middlewares/rateLimiter');
const { connectDatabase, disconnectDatabase } = require('./shared/database/connection');
const { iniciarLembretes } = require('./modules/notifications/notification.scheduler');

const app = express();

// Atrás de proxy reverso o IP real vem no X-Forwarded-For (limites por IP e registro de acesso dependem disso)
if (env.TRUST_PROXY) app.set('trust proxy', /^\d+$/.test(env.TRUST_PROXY) ? Number(env.TRUST_PROXY) : env.TRUST_PROXY);

// ─── Segurança ─────────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors({ origin: env.FRONTEND_URL, credentials: true }));
app.use(globalRateLimiter);

// ─── Parsing ───────────────────────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─── Log de requisições (apenas em dev) ───────────────────────────────────
app.use(requestLogger);

// ─── Rotas ─────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ─── Health check ──────────────────────────────────────────────────────────
app.get('/health', (req, res) => {
  res.json({
    status:    'ok',
    project:   'AltaInteligente',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Tratamento de erros (sempre por último) ───────────────────────────────
app.use(errorHandler);

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