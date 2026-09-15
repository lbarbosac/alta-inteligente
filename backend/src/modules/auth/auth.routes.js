const { Router } = require('express');

const { validateLogin, validateEsqueciSenha, validateRedefinirSenha } = require('./auth.validation');
const { login, logout, me, esqueciSenha, redefinirSenha } = require('./auth.controller');
const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { loginRateLimiter, senhaRateLimiter } = require('../../shared/middlewares/rateLimiter');

const router = Router();

/**
 * POST /api/v1/auth/login
 * Pública — valida o body antes de chegar no controller.
 */
router.post('/login', loginRateLimiter, validateLogin, login);

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

/**
 * POST /api/v1/auth/esqueci-senha e /redefinir-senha
 * Públicas, com limite de 5 pedidos por IP a cada 15 minutos.
 */
router.post('/esqueci-senha', senhaRateLimiter, validateEsqueciSenha, esqueciSenha);
router.post('/redefinir-senha', senhaRateLimiter, validateRedefinirSenha, redefinirSenha);

module.exports = router;