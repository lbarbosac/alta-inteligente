// Arquivo: backend/src/modules/checkins/checkin.service.js
const checkinRepository    = require('./checkin.repository');
const portalRepository     = require('../patient-portal/patientPortal.repository');
const treatmentRepository  = require('../treatments/treatment.repository');
const { calculateRecoveryDay } = require('../../shared/utils/calculateRecoveryDay');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

// O tratamento vem do token do link e o dia é calculado aqui. Aceitar tratamentoId e
// diaRecuperacao do cliente permitia enviar check-in de qualquer tratamento, em qualquer dia.
async function submitCheckin({ token, nivelDor, observacoes, respostas }) {
  const tratamento = await portalRepository.findTreatmentByToken(token);
  if (!tratamento) throw new NotFoundError('Link inválido ou não encontrado.');
  if (tratamento.status !== 'ativo') throw new ValidationError('Este tratamento foi encerrado.');

  const diaRecuperacao = calculateRecoveryDay(tratamento.dataProcedimento);
  const existente = await checkinRepository.findByDayAndTreatment(tratamento.id, diaRecuperacao);
  if (existente) throw new ValidationError(`O check-in do Dia ${diaRecuperacao} já foi realizado.`);

  // Só aceita respostas das tarefas de hoje. Se o dia virou com a página aberta, as tarefas são as de ontem.
  const diaProtocolo = tratamento.versaoProtocolo.dias.find(d => d.numeroDia === diaRecuperacao);
  const tarefasDeHoje = new Set((diaProtocolo?.tarefas ?? []).map(t => t.id));
  if (respostas.some(r => !tarefasDeHoje.has(r.tarefaDiaProtocoloId))) {
    throw new ValidationError('As orientações mudaram desde que você abriu a página. Recarregue e envie de novo.');
  }

  return checkinRepository.create({ tratamentoId:tratamento.id, diaRecuperacao, nivelDor, observacoes:observacoes??null, enviadoEm:new Date(), respostas });
}

async function getCheckinsByTreatment(tratamentoId, profissionalId) {
  const tratamento = await treatmentRepository.findById(tratamentoId);
  if (!tratamento) throw new NotFoundError('Tratamento não encontrado.');
  if (tratamento.paciente.profissionalId !== profissionalId) throw new ForbiddenError('Acesso negado.');
  return checkinRepository.findByTreatmentId(tratamentoId);
}

module.exports = { submitCheckin, getCheckinsByTreatment };
