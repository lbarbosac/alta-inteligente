const bcrypt = require('bcrypt');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

const repository = require('./auth.repository');
const { findAdminByEmail, findProfessionalByEmail } = repository;
const emailProvider = require('../notifications/providers/email.provider');
const { env } = require('../../shared/config/env');
const { VERSAO_TERMOS_PROFISSIONAL } = require('../../shared/config/legal');
const { generateSecureToken } = require('../../shared/utils/generateSecureToken');
const { hashPassword } = require('../../shared/utils/hashPassword');
const { UnauthorizedError } = require('../../shared/errors/UnauthorizedError');
const { ForbiddenError } = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

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
  const { senha: _descartada, termosVersao, ...dadosPublicos } = usuario;

  return {
    token,
    usuario: {
      ...dadosPublicos,
      role,
      // Profissional precisa aceitar os termos da versão atual antes de usar o painel
      ...(role === PERFIS.PROFESSIONAL && { precisaAceitarTermos: termosVersao !== VERSAO_TERMOS_PROFISSIONAL }),
    },
  };
}

// ─── Recuperação de senha ──────────────────────────────────────────────────

const VALIDADE_LINK_MINUTOS = 60;
const hashDoToken = (token) => crypto.createHash('sha256').update(token).digest('hex');

/**
 * Pede o link de redefinição. A resposta é sempre a mesma, exista o e-mail ou não:
 * assim ninguém descobre quem tem conta testando e-mails.
 */
async function solicitarRedefinicao(email, perfil) {
  const ehAdmin = perfil === 'ADMIN';
  const usuario = ehAdmin ? await findAdminByEmail(email) : await findProfessionalByEmail(email);
  if (!usuario?.ativo) return;

  const perfilBanco = ehAdmin ? 'admin' : 'profissional';
  const token = generateSecureToken();
  await repository.invalidateResetTokens(perfilBanco, usuario.id);
  await repository.createResetToken({
    tokenHash: hashDoToken(token),
    perfil:    perfilBanco,
    usuarioId: usuario.id,
    expiraEm:  new Date(Date.now() + VALIDADE_LINK_MINUTOS * 60 * 1000),
  });

  const link = `${env.FRONTEND_URL}/redefinir-senha?token=${token}`;
  emailProvider.enviar({
    para: usuario.email,
    assunto: 'Redefinição de senha — AltaInteligente',
    texto: [
      `Olá, ${usuario.nome.split(' ')[0]}.`,
      '',
      `Recebemos um pedido para redefinir a sua senha. O link vale por ${VALIDADE_LINK_MINUTOS} minutos:`,
      link,
      '',
      'Se não foi você, ignore este e-mail. Sua senha continua a mesma.',
    ].join('\n'),
  })
    .then((r) => { if (r.status === 'falhou') console.error('[senha] e-mail não enviado:', r.erro); })
    .catch((err) => console.error('[senha] e-mail não enviado:', err.message));
}

async function redefinirSenha(token, novaSenha) {
  const registro = await repository.findValidResetToken(hashDoToken(token));
  if (!registro) throw new ValidationError('Link inválido ou expirado. Peça um novo link de redefinição.');

  await repository.resetPassword({
    tokenId:   registro.id,
    perfil:    registro.perfil,
    usuarioId: registro.usuarioId,
    senhaHash: await hashPassword(novaSenha),
  });
  return { perfil: registro.perfil, usuarioId: registro.usuarioId };
}

module.exports = { login, solicitarRedefinicao, redefinirSenha };