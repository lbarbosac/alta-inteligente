/**
 * Middleware de log de requisições.
 * Ativo apenas em desenvolvimento — em produção use uma solução
 * dedicada (ex: Winston, Pino) para não poluir os logs.
 *
 * Formato: [METHOD] /caminho — Xms (statusCode)
 */
function requestLogger(req, res, next) {
  if (process.env.NODE_ENV !== 'development') return next();

  const inicio = Date.now();

  res.on('finish', () => {
    const duracao = Date.now() - inicio;
    const status  = res.statusCode;
    const cor     = status >= 500 ? '\x1b[31m'   // vermelho
                  : status >= 400 ? '\x1b[33m'   // amarelo
                  : status >= 200 ? '\x1b[32m'   // verde
                  : '\x1b[0m';

    console.log(
      `${cor}[${req.method}]\x1b[0m ${req.originalUrl} — ${duracao}ms (${status})`
    );
  });

  next();
}

module.exports = { requestLogger };