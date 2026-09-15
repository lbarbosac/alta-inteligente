const rateLimit = require('express-rate-limit');

const mensagem = (texto) => ({ success: false, message: texto });

/**
 * Rate limiter global — aplicado a todas as rotas via server.js.
 * Limites mais restritivos ficam nas rotas públicas (portal, check-in, login, senha).
 *
 * 600 requisições por IP a cada 15 minutos. O limite antigo (100) derrubava uma clínica
 * inteira atrás do mesmo IP: cada tela do painel faz várias chamadas.
 */
const globalRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             600,
  standardHeaders: true,
  legacyHeaders:   false,
  message: mensagem('Muitas requisições. Tente novamente em alguns minutos.'),
});

/**
 * Login: 10 tentativas erradas por IP a cada 15 minutos (as certas não contam).
 * Freia tentativa de adivinhar senha.
 */
const loginRateLimiter = rateLimit({
  windowMs:               15 * 60 * 1000,
  max:                    10,
  skipSuccessfulRequests: true,
  standardHeaders:        true,
  legacyHeaders:          false,
  message: mensagem('Muitas tentativas de login. Aguarde 15 minutos e tente de novo.'),
});

/** Recuperação de senha: 5 pedidos por IP a cada 15 minutos. */
const senhaRateLimiter = rateLimit({
  windowMs:        15 * 60 * 1000,
  max:             5,
  standardHeaders: true,
  legacyHeaders:   false,
  message: mensagem('Muitas solicitações. Aguarde 15 minutos e tente de novo.'),
});

module.exports = { globalRateLimiter, loginRateLimiter, senhaRateLimiter };
