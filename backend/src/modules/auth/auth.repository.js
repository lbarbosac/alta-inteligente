const { prisma } = require('../../shared/config/prismaClient');

/**
 * Busca um Administrador pelo e-mail.
 * Retorna apenas os campos necessários para autenticação.
 * A senha é incluída aqui pois será comparada no Service e descartada em seguida.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findAdminByEmail(email) {
  return prisma.administrador.findUnique({
    where: { email },
    select: {
      id:    true,
      nome:  true,
      email: true,
      senha: true,
      ativo: true,
    },
  });
}

/**
 * Busca um Profissional pelo e-mail.
 * Retorna apenas os campos necessários para autenticação.
 *
 * @param {string} email
 * @returns {Promise<object|null>}
 */
async function findProfessionalByEmail(email) {
  return prisma.profissional.findUnique({
    where: { email },
    select: {
      id:           true,
      nome:         true,
      email:        true,
      senha:        true,
      especialidade: true,
      ativo:        true,
      termosVersao: true,
    },
  });
}

// ─── Redefinição de senha ──────────────────────────────────────────────────

/** Invalida links anteriores: só o pedido mais recente funciona. */
async function invalidateResetTokens(perfil, usuarioId) {
  return prisma.tokenRedefinicaoSenha.updateMany({
    where: { perfil, usuarioId, usadoEm: null },
    data:  { usadoEm: new Date() },
  });
}

async function createResetToken(data) {
  return prisma.tokenRedefinicaoSenha.create({ data, select: { id: true } });
}

async function findValidResetToken(tokenHash) {
  return prisma.tokenRedefinicaoSenha.findFirst({
    where:  { tokenHash, usadoEm: null, expiraEm: { gt: new Date() } },
    select: { id: true, perfil: true, usuarioId: true },
  });
}

/** Troca a senha e queima o token na mesma transação. */
async function resetPassword({ tokenId, perfil, usuarioId, senhaHash }) {
  const tabela = perfil === 'admin' ? prisma.administrador : prisma.profissional;
  return prisma.$transaction([
    tabela.update({ where: { id: usuarioId }, data: { senha: senhaHash }, select: { id: true } }),
    prisma.tokenRedefinicaoSenha.update({ where: { id: tokenId }, data: { usadoEm: new Date() } }),
  ]);
}

module.exports = {
  findAdminByEmail,
  findProfessionalByEmail,
  invalidateResetTokens,
  createResetToken,
  findValidResetToken,
  resetPassword,
};
