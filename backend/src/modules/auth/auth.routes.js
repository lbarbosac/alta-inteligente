const { Router } = require('express');

const { validateLogin } = require('./auth.validation');
const { login, logout, me } = require('./auth.controller');
const { authMiddleware } = require('../../shared/middlewares/authMiddleware');

const router = Router();

/**
 * POST /api/v1/auth/login
 * Pública — valida o body antes de chegar no controller.
 */
router.post('/login', validateLogin, login);

/**
 * POST /api/v1/auth/logout
 * Protegida — exige token JWT válido.
 */
router.post('/logout', authMiddleware, logout);

/**
 * GET /api/v1/auth/me
 * Protegida — retorna os dados do usuário autenticado.
 */
router.get('/me', authMiddleware, me);

module.exports = router;