const authService = require('./auth.service');
const audit = require('../audit/audit.service');
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

  let resultado;
  try {
    resultado = await authService.login(email, senha, perfil);
  } catch (err) {
    await audit.registrar({ req, atorTipo: 'sistema', acao: 'login.falha', entidade: 'sessao' });
    throw err;
  }

  await audit.registrar({
    req,
    atorTipo: resultado.usuario.role === 'admin' ? 'admin' : 'profissional',
    atorId: resultado.usuario.id,
    acao: 'login.sucesso',
    entidade: 'sessao',
  });
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

/**
 * POST /api/v1/auth/esqueci-senha
 * Body: { email, perfil }. Responde igual exista a conta ou não.
 */
async function esqueciSenha(req, res) {
  await authService.solicitarRedefinicao(req.body.email, req.body.perfil);
  return ApiResponse.success(res, null, 'Se o e-mail estiver cadastrado, enviaremos um link para redefinir a senha.');
}

/**
 * POST /api/v1/auth/redefinir-senha
 * Body: { token, senha }
 */
async function redefinirSenha(req, res) {
  const { perfil, usuarioId } = await authService.redefinirSenha(req.body.token, req.body.senha);
  await audit.registrar({ req, atorTipo: perfil, atorId: usuarioId, acao: 'senha.redefinir', entidade: 'sessao' });
  return ApiResponse.success(res, null, 'Senha redefinida. Entre com a nova senha.');
}

module.exports = { login, logout, me, esqueciSenha, redefinirSenha };