const { Router } = require('express');
const rateLimit  = require('express-rate-limit');
const controller = require('./patientPortal.controller');

const router = Router();

/**
 * Rate limit específico para o portal do paciente.
 * Protege contra força bruta de tokens sem necessidade de JWT.
 * 30 requisições por IP a cada 15 minutos.
 */
const portalLimiter = rateLimit({
  windowMs:     15 * 60 * 1000,
  max:          30,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 15 minutos.',
  },
});

/**
 * GET /api/v1/patient/access/:token
 *
 * Rota pública — acessada pelo paciente via link seguro.
 * Não exige autenticação JWT pois o paciente não possui conta.
 *
 * O token de 64 chars identifica o tratamento de forma única.
 * doc 03-arquitetura.md seção 18: "O link deverá estar associado
 * ao tratamento do paciente."
 */
router.get('/access/:token', portalLimiter, controller.access);

module.exports = router;