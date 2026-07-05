const { Router } = require('express');
const rateLimit  = require('express-rate-limit');
const { validateCreate } = require('./checkin.validation');
const controller = require('./checkin.controller');

const router = Router();

/**
 * Rate limit para envio de check-ins.
 * Um paciente não faz mais de 1 check-in por dia na prática,
 * mas limitamos a 10 por hora para absorver retries sem abrir
 * a rota para abuso.
 */
const checkinLimiter = rateLimit({
  windowMs:     60 * 60 * 1000,
  max:          10,
  standardHeaders: true,
  legacyHeaders:   false,
  message: {
    success: false,
    message: 'Muitas tentativas. Tente novamente em 1 hora.',
  },
});

/**
 * POST /api/v1/checkins
 *
 * Rota pública — usada pelo portal do paciente.
 * O paciente não possui conta nem JWT.
 * A autenticidade da requisição é verificada pelo tratamentoId
 * e pelo status ativo do tratamento no service.
 *
 * doc 02-regras-negocio.md seção 15:
 * "Cada paciente poderá realizar apenas um check-in por dia."
 */
router.post('/', checkinLimiter, validateCreate, controller.create);

module.exports = router;