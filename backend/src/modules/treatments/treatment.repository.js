// Arquivo: backend/src/modules/treatments/treatment.repository.js
const { prisma } = require('../../shared/config/prismaClient');

const INCLUDE_PADRAO = {
  paciente: {
    select: {
      id: true,
      nome: true,
      telefone: true,
      email: true,
      dataNascimento: true,
      profissionalId: true,
    },
  },
  versaoProtocolo: {
    include: {
      protocolo: {
        select: { id: true, nome: true, descricao: true },
      },
    },
  },
  checkins: {
    orderBy: { diaRecuperacao: 'desc' },
    take: 1,
    select: {
      id: true,
      diaRecuperacao: true,
      nivelDor: true,
      observacoes: true,
      enviadoEm: true,
    },
  },
  // Último aceite do termo: o profissional vê se o paciente aceitou e se quer lembretes
  consentimentos: {
    orderBy: { aceitoEm: 'desc' },
    take: 1,
    select: { versaoTermo: true, aceitaLembretes: true, aceitoEm: true },
  },
};

async function create(data) {
  return prisma.tratamento.create({ data, include: INCLUDE_PADRAO });
}

async function findById(id) {
  return prisma.tratamento.findUnique({ where: { id }, include: INCLUDE_PADRAO });
}

async function findByProfessionalId(profissionalId) {
  return prisma.tratamento.findMany({
    where: { paciente: { profissionalId } },
    include: INCLUDE_PADRAO,
    orderBy: { criadoEm: 'desc' },
  });
}

// CORRIGIDO: Função update genérica para aceitar qualquer campo (status ou nomeProcedimento)
async function update(id, dados) {
  return prisma.tratamento.update({
    where: { id },
    data: dados,
    include: INCLUDE_PADRAO,
  });
}

async function findLatestProtocolVersion(protocoloId) {
  return prisma.versaoProtocolo.findFirst({
    where: { protocoloId },
    orderBy: { versao: 'desc' },
    select: {
      id: true,
      versao: true,
      totalDias: true,
      protocolo: { select: { profissionalId: true, ativo: true } },
    },
  });
}

module.exports = {
  create,
  findById,
  findByProfessionalId,
  update,
  findLatestProtocolVersion,
};