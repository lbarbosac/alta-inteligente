const checkinRepository  = require('./checkin.repository');
const { prisma }         = require('../../shared/config/prismaClient');
const { NotFoundError }  = require('../../shared/errors/NotFoundError');
const { ValidationError } = require('../../shared/errors/ValidationError');

/**
 * Registra o check-in diário do paciente.
 *
 * Regras de negócio (doc 02-regras-negocio.md, seção 15):
 *  1. O tratamento deve existir e estar ativo.
 *  2. Apenas um check-in por dia é permitido (@@unique no banco).
 *     A verificação no service fornece uma mensagem amigável antes
 *     de a constraint do banco ser acionada.
 *  3. nivelDor deve estar entre 1 e 10 (validado no schema Zod).
 *  4. enviadoEm é definido pelo servidor — nunca pelo cliente.
 *
 * @param {{ tratamentoId, diaRecuperacao, nivelDor, observacoes, respostas }} dados
 */
async function submitCheckin(dados) {
  const { tratamentoId, diaRecuperacao, nivelDor, observacoes, respostas } = dados;

  // ── 1. Valida o tratamento ──────────────────────────────────────────────
  const tratamento = await prisma.tratamento.findUnique({
    where:  { id: tratamentoId },
    select: { id: true, status: true },
  });

  if (!tratamento) {
    throw new NotFoundError('Tratamento não encontrado.');
  }

  if (tratamento.status !== 'ativo') {
    throw new ValidationError(
      'Este tratamento foi encerrado. Não é possível enviar check-ins.'
    );
  }

  // ── 2. Verifica duplicidade do check-in do dia ──────────────────────────
  const checkinExistente = await checkinRepository.findByDayAndTreatment(
    tratamentoId,
    diaRecuperacao
  );

  if (checkinExistente) {
    throw new ValidationError(
      `O check-in do Dia ${diaRecuperacao} já foi realizado. Volte amanhã!`
    );
  }

  // ── 3. Persiste o check-in com respostas aninhadas ──────────────────────
  return checkinRepository.create({
    tratamentoId,
    diaRecuperacao,
    nivelDor,
    observacoes: observacoes ?? null,
    enviadoEm:   new Date(), // servidor define o horário — nunca o cliente
    respostas,
  });
}

module.exports = { submitCheckin };