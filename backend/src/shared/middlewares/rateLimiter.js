const rateLimit = require('express-rate-limit');

/**
 * Rate limiter global — aplicado a todas as rotas via server.js.
 * Limites mais restritivos são aplicados individualmente nas rotas
 * públicas (portal do paciente, check-ins).
 *
 * 100 requisições por IP a cada 15 minutos é generoso para uso normal
 * e suficientemente restritivo para limitar abuso.
 */
const globalRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             100,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.',
  },
});

module.exports = { globalRateLimiter };