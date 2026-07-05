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
    },
  });
}

module.exports = { findAdminByEmail, findProfessionalByEmail };