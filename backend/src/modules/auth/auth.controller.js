const authService = require('./auth.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * POST /api/v1/auth/login
 *
 * Body (já validado pelo middleware):
 *   { email, senha, perfil: 'ADMIN' | 'PROFESSIONAL' }
 *
 * Express 5: erros lançados dentro de funções async propagam
 * automaticamente para o errorHandler global. Não é necessário try/catch.
 */
async function login(req, res) {
  const { email, senha, perfil } = req.body;

  const resultado = await authService.login(email, senha, perfil);

  return ApiResponse.success(res, resultado, 'Login realizado com sucesso.');
}

/**
 * POST /api/v1/auth/logout
 *
 * O logout no padrão JWT é stateless: o token é simplesmente
 * descartado pelo cliente. No MVP, apenas confirmamos a ação.
 * Futuramente pode ser expandido com blacklist de tokens.
 */
function logout(req, res) {
  return ApiResponse.success(res, null, 'Logout realizado com sucesso.');
}

/**
 * GET /api/v1/auth/me
 *
 * Retorna os dados do usuário autenticado a partir do token JWT.
 * req.usuario é populado pelo authMiddleware antes de chegar aqui.
 */
function me(req, res) {
  return ApiResponse.success(res, req.usuario, 'Usuário autenticado.');
}

module.exports = { login, logout, me };