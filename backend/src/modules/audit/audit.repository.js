// Arquivo: backend/src/modules/audit/audit.repository.js
const { prisma } = require('../../shared/config/prismaClient');

async function create(data) {
  return prisma.registroAcesso.create({ data });
}

async function findByEntidade(entidade, entidadeId) {
  return prisma.registroAcesso.findMany({
    where:   { entidade, entidadeId },
    orderBy: { criadoEm: 'desc' },
    select:  { atorTipo: true, atorId: true, acao: true, criadoEm: true },
  });
}

module.exports = { create, findByEntidade };
