const { prisma } = require('../../shared/config/prismaClient');

/**
 * Cria um check-in com as respostas das tarefas de forma aninhada.
 * Toda a operação ocorre em uma única transação do Prisma.
 *
 * @param {{ tratamentoId, diaRecuperacao, nivelDor, observacoes, enviadoEm, respostas }} data
 */
async function create(data) {
  const { respostas, ...dadosCheckin } = data;

  return prisma.checkin.create({
    data: {
      ...dadosCheckin,
      respostas: {
        create: respostas.map((r) => ({
          tarefaDiaProtocoloId: r.tarefaDiaProtocoloId,
          concluido:            r.concluido,
          concluidoEm:          r.concluido ? new Date() : null,
        })),
      },
    },
    include: {
      respostas: {
        include: {
          tarefa: {
            select: { descricao: true, numeroOrdem: true },
          },
        },
      },
    },
  });
}

/**
 * Retorna o check-in mais recente de um tratamento.
 * Usado por calculatePatientStatus no dashboard e portal.
 *
 * @param {string} tratamentoId
 */
async function findLatestByTreatment(tratamentoId) {
  return prisma.checkin.findFirst({
    where:   { tratamentoId },
    orderBy: { diaRecuperacao: 'desc' },
    select: {
      id:             true,
      diaRecuperacao: true,
      nivelDor:       true,
      enviadoEm:      true,
    },
  });
}

/**
 * Verifica se já existe um check-in para um dia específico de um tratamento.
 * Usado para impedir duplicidade antes de tentar inserir
 * (evita depender apenas da constraint @@unique do banco para feedback amigável).
 *
 * @param {string} tratamentoId
 * @param {number} diaRecuperacao
 */
async function findByDayAndTreatment(tratamentoId, diaRecuperacao) {
  return prisma.checkin.findUnique({
    where: {
      tratamentoId_diaRecuperacao: { tratamentoId, diaRecuperacao },
    },
    select: { id: true },
  });
}

module.exports = { create, findLatestByTreatment, findByDayAndTreatment };