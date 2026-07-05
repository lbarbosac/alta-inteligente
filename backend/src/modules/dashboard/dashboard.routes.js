const { Router } = require('express');

const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware }  = require('../../shared/middlewares/roleMiddleware');
const controller = require('./dashboard.controller');

const router = Router();

/**
 * Todas as rotas do dashboard exigem JWT válido + perfil professional.
 * O admin possui seu próprio dashboard (módulo admins) — não este.
 */
router.use(authMiddleware, roleMiddleware(['professional']));

/**
 * GET /api/v1/dashboard
 * Retorna métricas, alertas críticos e feed de check-ins do profissional.
 */
router.get('/', controller.getSummary);

module.exports = router;