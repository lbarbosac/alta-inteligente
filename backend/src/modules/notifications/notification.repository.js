// Arquivo: backend/src/modules/notifications/notification.repository.js
const { prisma } = require('../../shared/config/prismaClient');

/**
 * Reserva a mensagem antes de enviar. A `referencia` é única: se outra execução já reservou
 * (lembrete do dia, alerta daquele check-in), devolve null e ninguém envia duas vezes.
 */
async function reservar({ tipo, canal, referencia, tratamentoId }) {
  // Checagem antes do insert: o caso comum (já enviado hoje) não vira erro no log a cada 5 minutos.
  // O catch do P2002 cobre a corrida entre duas execuções simultâneas.
  const existente = await prisma.notificacao.findUnique({ where: { referencia }, select: { id: true } });
  if (existente) return null;
  try {
    return await prisma.notificacao.create({
      data: { tipo, canal, referencia, tratamentoId, status: 'falhou', erro: 'Envio em andamento.' },
      select: { id: true },
    });
  } catch (err) {
    if (err.code === 'P2002') return null;
    throw err;
  }
}

async function concluir(id, { status, erro = null }) {
  return prisma.notificacao.update({ where: { id }, data: { status, erro } });
}

async function dadosParaAlerta(tratamentoId) {
  return prisma.tratamento.findUnique({
    where: { id: tratamentoId },
    select: {
      nomeProcedimento: true,
      paciente: {
        select: {
          id: true,
          nome: true,
          profissional: { select: { nome: true, email: true, ativo: true, alertasEmail: true } },
        },
      },
    },
  });
}

/** Tratamentos que podem receber lembrete hoje. O filtro fino (horário, check-in do dia) fica no service. */
async function candidatosLembrete() {
  return prisma.tratamento.findMany({
    where: {
      status: 'ativo',
      paciente: { ativo: true, anonimizadoEm: null, profissional: { ativo: true } },
    },
    select: {
      id: true,
      tokenPaciente: true,
      dataProcedimento: true,
      versaoProtocolo: { select: { totalDias: true } },
      paciente: {
        select: {
          nome: true,
          telefone: true,
          profissional: { select: { horaLembrete: true } },
        },
      },
      consentimentos: { orderBy: { aceitoEm: 'desc' }, take: 1, select: { aceitaLembretes: true } },
      checkins: { orderBy: { diaRecuperacao: 'desc' }, take: 1, select: { diaRecuperacao: true } },
    },
  });
}

module.exports = { reservar, concluir, dadosParaAlerta, candidatosLembrete };
