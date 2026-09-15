// Arquivo: backend/src/modules/checkins/checkin.repository.js
const { prisma } = require('../../shared/config/prismaClient');

async function create(data) {
  const { respostas, fotos, ...dadosCheckin } = data;
  return prisma.checkin.create({
    data: {
      ...dadosCheckin,
      respostas: {
        create: (respostas ?? []).map(r => ({
          tarefaDiaProtocoloId: r.tarefaDiaProtocoloId,
          concluido:            r.concluido,
          concluidoEm:          r.concluido ? new Date() : null,
        })),
      },
      fotos: {
        create: (fotos ?? []).map(f => ({ arquivo: f.arquivo, tamanhoBytes: f.tamanhoBytes })),
      },
    },
    select: { id: true },
  });
}

async function findLatestByTreatment(tratamentoId) {
  return prisma.checkin.findFirst({
    where:   { tratamentoId },
    orderBy: { diaRecuperacao: 'desc' },
    select:  { id: true, diaRecuperacao: true, nivelDor: true, enviadoEm: true },
  });
}

async function findByDayAndTreatment(tratamentoId, diaRecuperacao) {
  return prisma.checkin.findUnique({
    where:  { tratamentoId_diaRecuperacao: { tratamentoId, diaRecuperacao } },
    select: { id: true },
  });
}

/**
 * Busca histórico de check-ins sem include aninhado para evitar erros de schema.
 * Buscamos as respostas com a tarefa em query separada.
 */
async function findByTreatmentId(tratamentoId) {
  const checkins = await prisma.checkin.findMany({
    where:   { tratamentoId },
    orderBy: { diaRecuperacao: 'asc' },
    include: { respostas: true, fotos: { select: { id: true }, orderBy: { criadoEm: 'asc' } } },
  });

  // Busca descrições das tarefas em paralelo para cada resposta única
  const tarefaIds = [...new Set(
    checkins.flatMap(c => c.respostas.map(r => r.tarefaDiaProtocoloId))
  )];

  let tarefasMap = {};
  if (tarefaIds.length > 0) {
    try {
      const tarefas = await prisma.tarefaDiaProtocolo.findMany({
        where:  { id: { in: tarefaIds } },
        select: { id: true, descricao: true, numeroOrdem: true },
      });
      tarefasMap = Object.fromEntries(tarefas.map(t => [t.id, t]));
    } catch (e) {
      console.error('[checkin.repository] Erro ao buscar tarefas:', e.message);
    }
  }

  return checkins.map(c => ({
    ...c,
    respostas: c.respostas
      .map(r => ({
        ...r,
        tarefaDiaProtocolo: tarefasMap[r.tarefaDiaProtocoloId] ?? null,
      }))
      .sort((a, b) =>
        (a.tarefaDiaProtocolo?.numeroOrdem ?? 99) -
        (b.tarefaDiaProtocolo?.numeroOrdem ?? 99)
      ),
  }));
}

module.exports = {
  create,
  findLatestByTreatment,
  findByDayAndTreatment,
  findByTreatmentId,
};