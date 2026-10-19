// Arquivo: src/modules/patient-portal/patientPortal.service.js
const repository                 = require('./patientPortal.repository');
const audit                      = require('../audit/audit.service');
const { calculateRecoveryDay }   = require('../../shared/utils/calculateRecoveryDay');
const { calculatePatientStatus } = require('../../shared/utils/calculatePatientStatus');
const { VERSAO_TERMO_PACIENTE }  = require('../../shared/config/legal');
const { NotFoundError }          = require('../../shared/errors/NotFoundError');
const { ValidationError }        = require('../../shared/errors/ValidationError');

/**
 * Valida o token e retorna dados do portal.
 * Sempre retorna um objeto com campo `status` — nunca lança erro.
 * O frontend usa o status para decidir qual tela renderizar.
 *
 * Antes do aceite do termo, o portal devolve só o necessário para mostrar o termo:
 * primeiro nome e profissional responsável. Tarefas e dados do tratamento vêm depois do aceite.
 */
async function validateAccess(token) {
  const tratamento = await repository.findTreatmentByToken(token);

  if (!tratamento) {
    return {
      status:   'invalido',
      mensagem: 'Link inválido, expirado ou não encontrado. Entre em contato com seu profissional de saúde.',
    };
  }

  if (tratamento.status !== 'ativo') {
    return {
      status:   'encerrado',
      mensagem: 'Este tratamento foi encerrado pelo seu profissional. Entre em contato para mais informações.',
    };
  }

  const consentimento = tratamento.consentimentos[0];
  if (consentimento?.versaoTermo !== VERSAO_TERMO_PACIENTE) {
    return {
      status: 'consentimento_pendente',
      versaoTermo: VERSAO_TERMO_PACIENTE,
      paciente: { nome: tratamento.paciente.nome.split(' ')[0] },
      profissional: tratamento.paciente.profissional,
    };
  }

  const diaAtual         = calculateRecoveryDay(tratamento.dataProcedimento);
  const totalDias        = tratamento.versaoProtocolo.totalDias;
  const diaProtocolo     = tratamento.versaoProtocolo.dias.find(d => d.numeroDia === diaAtual);
  const ultimoCheckin    = tratamento.checkins[0] ?? null;
  const checkinHojeFeito = ultimoCheckin?.diaRecuperacao === diaAtual;
  const statusClinico    = calculatePatientStatus(ultimoCheckin);

  return {
    status: 'ativo',
    tratamento: {
      id:               tratamento.id,
      nomeProcedimento: tratamento.nomeProcedimento,
      dataProcedimento: tratamento.dataProcedimento,
      status:           tratamento.status,
    },
    paciente:    { nome: tratamento.paciente.nome },
    profissional: tratamento.paciente.profissional,
    recuperacao: {
      diaAtual,
      totalDias,
      progresso: Math.min(Math.round((diaAtual / totalDias) * 100), 100),
    },
    tarefasHoje:      diaProtocolo?.tarefas ?? [],
    statusClinico,
    checkinHojeFeito,
    aceitaLembretes:  consentimento.aceitaLembretes,
  };
}

/**
 * Registra o aceite do termo pelo paciente, com data, versão, IP e navegador como prova.
 * `aceitaLembretes` é uma escolha separada e opcional — sem ela, nenhum lembrete é enviado.
 */
async function registrarConsentimento(token, { aceitaLembretes }, req) {
  const tratamento = await repository.findTreatmentByToken(token);
  if (!tratamento) throw new NotFoundError('Link inválido ou não encontrado.');
  if (tratamento.status !== 'ativo') throw new ValidationError('Este tratamento foi encerrado.');

  const consentimento = await repository.createConsent({
    tratamentoId:    tratamento.id,
    versaoTermo:     VERSAO_TERMO_PACIENTE,
    aceitaLembretes,
    ip:              audit.ipDe(req),
    userAgent:       req.get('user-agent')?.slice(0, 255) ?? null,
  });

  await audit.registrar({
    req, atorTipo: 'paciente', atorId: tratamento.paciente.id,
    acao: 'consentimento.aceitar', entidade: 'paciente', entidadeId: tratamento.paciente.id,
  });

  return consentimento;
}

module.exports = { validateAccess, registrarConsentimento };
