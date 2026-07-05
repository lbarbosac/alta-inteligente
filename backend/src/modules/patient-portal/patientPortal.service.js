const repository = require('./patientPortal.repository');
const { calculateRecoveryDay }    = require('../../shared/utils/calculateRecoveryDay');
const { calculatePatientStatus }  = require('../../shared/utils/calculatePatientStatus');
const { NotFoundError }           = require('../../shared/errors/NotFoundError');
const { UnauthorizedError }       = require('../../shared/errors/UnauthorizedError');

/**
 * Valida o acesso do paciente via tokenPaciente e monta os dados do portal.
 *
 * Fluxo:
 *  1. Busca o tratamento pelo token.
 *  2. Valida existência → NotFoundError (mensagem genérica — não revela se token existe).
 *  3. Valida que o tratamento está ativo → UnauthorizedError.
 *  4. Calcula o dia atual da recuperação (utilitário timezone-safe).
 *  5. Filtra as tarefas do dia atual na estrutura de dias do protocolo.
 *  6. Verifica se o check-in de hoje já foi enviado.
 *  7. Calcula o status clínico atual (último check-in).
 *
 * @param {string} token - tokenPaciente de 64 chars
 * @returns {object} Dados completos do portal para o dia atual
 */
async function validateAccess(token) {
  const tratamento = await repository.findTreatmentByToken(token);

  // ── 1. Valida existência ────────────────────────────────────────────────
  if (!tratamento) {
    throw new NotFoundError('Link inválido, expirado ou não encontrado.');
  }

  // ── 2. Valida status do tratamento ──────────────────────────────────────
  if (tratamento.status !== 'ativo') {
    throw new UnauthorizedError(
      'Este tratamento foi encerrado. Entre em contato com seu profissional de saúde.'
    );
  }

  // ── 3. Calcula o dia atual da recuperação ───────────────────────────────
  const diaAtual = calculateRecoveryDay(tratamento.dataProcedimento);
  const totalDias = tratamento.versaoProtocolo.totalDias;

  // ── 4. Filtra as tarefas do dia atual ───────────────────────────────────
  const diaProtocolo = tratamento.versaoProtocolo.dias.find(
    (d) => d.numeroDia === diaAtual
  );

  // ── 5. Verifica se o check-in de hoje já foi enviado ───────────────────
  const ultimoCheckin = tratamento.checkins[0] ?? null;
  const checkinHojeFeito = ultimoCheckin?.diaRecuperacao === diaAtual;

  // ── 6. Calcula o status clínico atual ───────────────────────────────────
  const statusClinico = calculatePatientStatus(ultimoCheckin);

  // ── 7. Monta e retorna a resposta do portal ─────────────────────────────
  return {
    tratamento: {
      id:               tratamento.id,
      nomeProcedimento: tratamento.nomeProcedimento,
      dataProcedimento: tratamento.dataProcedimento,
      status:           tratamento.status,
    },
    paciente: {
      nome: tratamento.paciente.nome,
    },
    recuperacao: {
      diaAtual,
      totalDias,
      progresso: Math.min(Math.round((diaAtual / totalDias) * 100), 100),
    },
    tarefasHoje:      diaProtocolo?.tarefas ?? [],
    statusClinico,
    checkinHojeFeito,
  };
}

module.exports = { validateAccess };