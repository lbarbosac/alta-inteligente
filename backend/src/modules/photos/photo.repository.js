// Arquivo: backend/src/modules/photos/photo.repository.js
const { prisma } = require('../../shared/config/prismaClient');

async function findComDono(id) {
  return prisma.fotoCheckin.findUnique({
    where: { id },
    select: {
      id: true,
      arquivo: true,
      checkin: {
        select: {
          tratamentoId: true,
          tratamento: { select: { paciente: { select: { id: true, profissionalId: true } } } },
        },
      },
    },
  });
}

module.exports = { findComDono };
