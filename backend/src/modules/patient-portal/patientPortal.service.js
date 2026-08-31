// Arquivo: src/modules/patient-portal/patientPortal.service.js
const repository                 = require('./patientPortal.repository');
const { calculateRecoveryDay }   = require('../../shared/utils/calculateRecoveryDay');
const { calculatePatientStatus } = require('../../shared/utils/calculatePatientStatus');

/**
 * Valida o token e retorna dados do portal.
 * Sempre retorna um objeto com campo `status` — nunca lança erro.
 * O frontend usa o status para decidir qual tela renderizar.
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