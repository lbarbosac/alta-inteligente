const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { findAdminByEmail, findProfessionalByEmail } = require('./auth.repository');
const { env } = require('../../shared/config/env');
const { UnauthorizedError } = require('../../shared/errors/UnauthorizedError');
const { ForbiddenError } = require('../../shared/errors/ForbiddenError');

/**
 * Perfis de acesso aceitos.
 * Usados tanto na validação da entrada quanto no payload do JWT.
 */
const PERFIS = {
  ADMIN: 'admin',
  PROFESSIONAL: 'professional',
};

/**
 * Realiza o login de um Administrador ou Profissional.
 *
 * Fluxo:
 *  1. Valida o perfil recebido.
 *  2. Busca o usuário no banco conforme o perfil.
 *  3. Verifica se o usuário existe        → UnauthorizedError (mensagem genérica).
 *  4. Verifica se a conta está ativa      → ForbiddenError.
 *  5. Compara a senha com o hash (bcrypt) → UnauthorizedError (mensagem genérica).
 *  6. Gera o token JWT.
 *  7. Retorna os dados do usuário (sem a senha) + token.
 *
 * Segurança: os passos 3 e 5 retornam a MESMA mensagem genérica para não
 * revelar ao atacante se o e-mail existe ou não na base.
 *
 * @param {string} email
 * @param {string} senha
 * @param {'ADMIN'|'PROFESSIONAL'} perfil
 * @returns {Promise<{ token: string, usuario: object }>}
 */
async function login(email, senha, perfil) {
  // ── 1. Valida o perfil ──────────────────────────────────────────────────
  if (perfil !== 'ADMIN' && perfil !== 'PROFESSIONAL') {
    throw new UnauthorizedError('Perfil de acesso inválido.');
  }

  // ── 2. Busca o usuário conforme o perfil ────────────────────────────────
  let usuario = null;
  let role = null;

  if (perfil === 'ADMIN') {
    usuario = await findAdminByEmail(email);
    role = PERFIS.ADMIN;
  } else {
    usuario = await findProfessionalByEmail(email);
    role = PERFIS.PROFESSIONAL;
  }

  // ── 3. Verifica se o usuário existe ─────────────────────────────────────
  if (!usuario) {
    throw new UnauthorizedError('E-mail ou senha incorretos.');
  }

  // ── 4. Verifica se a conta está ativa ───────────────────────────────────
  if (!usuario.ativo) {
    throw new ForbiddenError('Sua conta está bloqueada. Entre em contato com o administrador.');
  }

  // ── 5. Compara a senha com o hash ───────────────────────────────────────
  const senhaCorreta = await bcrypt.compare(senha, usuario.senha);
  if (!senhaCorreta) {
    throw new UnauthorizedError('E-mail ou senha incorretos.');
  }

  // ── 6. Gera o token JWT ─────────────────────────────────────────────────
  const payload = {
    id:    usuario.id,
    nome:  usuario.nome,
    email: usuario.email,
    role,
  };

  const token = jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
  });

  // ── 7. Retorna dados sem a senha ─────────────────────────────────────────
  const { senha: _descartada, ...dadosPublicos } = usuario;

  return {
    token,
    usuario: {
      ...dadosPublicos,
      role,
    },
  };
}

module.exports = { login };