// Arquivo: backend/src/modules/checkins/checkin.service.js
const checkinRepository    = require('./checkin.repository');
const portalRepository     = require('../patient-portal/patientPortal.repository');
const treatmentRepository  = require('../treatments/treatment.repository');
const photoService         = require('../photos/photo.service');
const notificationService  = require('../notifications/notification.service');
const { calculateRecoveryDay } = require('../../shared/utils/calculateRecoveryDay');
const { VERSAO_TERMO_PACIENTE } = require('../../shared/config/legal');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

// O tratamento vem do token do link e o dia é calculado aqui. Aceitar tratamentoId e
// diaRecuperacao do cliente permitia enviar check-in de qualquer tratamento, em qualquer dia.
async function submitCheckin({ token, nivelDor, observacoes, respostas }, arquivos = []) {
  const tratamento = await portalRepository.findTreatmentByToken(token);
  if (!tratamento) throw new NotFoundError('Link inválido ou não encontrado.');
  if (tratamento.status !== 'ativo') throw new ValidationError('Este tratamento foi encerrado.');

  // LGPD: nada é gravado antes do paciente aceitar o termo da versão atual
  if (tratamento.consentimentos[0]?.versaoTermo !== VERSAO_TERMO_PACIENTE) {
    throw new ForbiddenError('Aceite o termo de privacidade antes de enviar o check-in.');
  }

  const diaRecuperacao = calculateRecoveryDay(tratamento.dataProcedimento);
  const existente = await checkinRepository.findByDayAndTreatment(tratamento.id, diaRecuperacao);
  if (existente) throw new ValidationError(`O check-in do Dia ${diaRecuperacao} já foi realizado.`);

  // Só aceita respostas das tarefas de hoje. Se o dia virou com a página aberta, as tarefas são as de ontem.
  const diaProtocolo = tratamento.versaoProtocolo.dias.find(d => d.numeroDia === diaRecuperacao);
  const tarefasDeHoje = new Set((diaProtocolo?.tarefas ?? []).map(t => t.id));
  if (respostas.some(r => !tarefasDeHoje.has(r.tarefaDiaProtocoloId))) {
    throw new ValidationError('As orientações mudaram desde que você abriu a página. Recarregue e envie de novo.');
  }

  const anterior = tratamento.checkins[0] ?? null;

  // Fotos primeiro: se alguma for inválida, o check-in nem é criado. Se o banco falhar, os arquivos somem.
  const { fotos, desfazer } = await photoService.salvarFotos(tratamento.id, arquivos);
  let checkin;
  try {
    checkin = await checkinRepository.create({ tratamentoId:tratamento.id, diaRecuperacao, nivelDor, observacoes:observacoes??null, enviadoEm:new Date(), respostas, fotos });
  } catch (err) {
    await desfazer();
    throw err;
  }

  // Alerta ao profissional sem prender a resposta do paciente
  notificationService
    .alertarDor({ tratamentoId: tratamento.id, checkinId: checkin.id, diaRecuperacao, nivelDor, nivelAnterior: anterior?.nivelDor ?? null })
    .catch(err => console.error('[alerta de dor] falhou:', err.message));

  return { id: checkin.id, diaRecuperacao, nivelDor, fotos: fotos.length };
}

async function getCheckinsByTreatment(tratamentoId, profissionalId) {
  const tratamento = await treatmentRepository.findById(tratamentoId);
  if (!tratamento) throw new NotFoundError('Tratamento não encontrado.');
  if (tratamento.paciente.profissionalId !== profissionalId) throw new ForbiddenError('Acesso negado.');

  const checkins = await checkinRepository.findByTreatmentId(tratamentoId);
  return {
    pacienteId: tratamento.paciente.id,
    checkins: checkins.map(({ fotos, ...c }) => ({
      ...c,
      fotos: fotos.map(f => ({ id: f.id, url: photoService.urlAssinada(f.id, profissionalId) })),
    })),
  };
}

module.exports = { submitCheckin, getCheckinsByTreatment };
