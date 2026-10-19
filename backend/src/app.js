// A aplicação Express, sem "ligar" o servidor.
// O server.js usa este arquivo para rodar no computador (app.listen) e o
// api/index.js da raiz usa o mesmo app como função da Vercel, no site publicado.
const express = require('express');
const cors    = require('cors');
const helmet  = require('helmet');

const { env }               = require('./shared/config/env');
const { router }            = require('./routes/index');
const { errorHandler }      = require('./shared/middlewares/errorHandler');
const { requestLogger }     = require('./shared/middlewares/requestLogger');
const { globalRateLimiter } = require('./shared/middlewares/rateLimiter');

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

// ─── Health check ──────────────────────────────────────────────────────────
// /api/v1/health também, porque no site publicado só /api/* chega no backend
app.get(['/health', '/api/v1/health'], (req, res) => {
  res.json({
    status:    'ok',
    project:   'AltaInteligente',
    version:   '1.0.0',
    timestamp: new Date().toISOString(),
  });
});

// ─── Rotas ─────────────────────────────────────────────────────────────────
app.use('/api/v1', router);

// ─── Tratamento de erros (sempre por último) ───────────────────────────────
app.use(errorHandler);

module.exports = app;
