// Arquivo: backend/src/modules/account/account.repository.js
const { prisma } = require('../../shared/config/prismaClient');

const CAMPOS_CONTA = {
  horaLembrete:    true,
  alertasEmail:    true,
  termosVersao:    true,
  termosAceitosEm: true,
};

async function findPreferencias(profissionalId) {
  return prisma.profissional.findUnique({ where: { id: profissionalId }, select: CAMPOS_CONTA });
}

async function updatePreferencias(profissionalId, data) {
  return prisma.profissional.update({ where: { id: profissionalId }, data, select: CAMPOS_CONTA });
}

module.exports = { findPreferencias, updatePreferencias };
