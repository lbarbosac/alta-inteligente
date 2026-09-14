// Arquivo: backend/src/modules/treatments/treatment.service.js
const repository      = require('./treatment.repository');
const patientRepository = require('../patients/patient.repository');
const { generateSecureToken } = require('../../shared/utils/generateSecureToken');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

async function assertTratamentoDoUsuario(id, profissionalId) {
  const tratamento = await repository.findById(id);
  if (!tratamento) throw new NotFoundError('Tratamento não encontrado.');
  if (tratamento.paciente.profissionalId !== profissionalId) {
    throw new ForbiddenError('Acesso negado. Este tratamento não pertence aos seus pacientes.');
  }
  return tratamento;
}

async function createTreatment(dados, profissionalId) {
  const { pacienteId, protocoloId, nomeProcedimento, dataProcedimento } = dados;

  const paciente = await patientRepository.findById(pacienteId);
  if (!paciente) throw new NotFoundError('Paciente não encontrado.');
  if (paciente.profissionalId !== profissionalId) {
    throw new ForbiddenError('Acesso negado. Este paciente não pertence ao seu cadastro.');
  }
  if (!paciente.ativo) {
    throw new ValidationError('Não é possível criar um tratamento para um paciente arquivado.');
  }

  const versao = await repository.findLatestProtocolVersion(protocoloId);
  if (!versao) {
    throw new NotFoundError(
      'Protocolo não encontrado ou sem versão cadastrada. Crie os dias e tarefas do protocolo antes de vinculá-lo.'
    );
  }
  if (versao.protocolo.profissionalId !== profissionalId) {
    throw new ForbiddenError('Acesso negado. Este protocolo não pertence ao seu cadastro.');
  }
  if (!versao.protocolo.ativo) {
    throw new ValidationError('Este protocolo está arquivado. Reative-o antes de vincular a um tratamento.');
  }

  const tokenPaciente = generateSecureToken();

  return repository.create({
    pacienteId,
    versaoProtocoloId: versao.id,
    nomeProcedimento,
    dataProcedimento,
    tokenPaciente,
  });
}

async function listTreatments(profissionalId) {
  return repository.findByProfessionalId(profissionalId);
}

async function getTreatmentById(id, profissionalId) {
  return assertTratamentoDoUsuario(id, profissionalId);
}

/**
 * Atualiza nomeProcedimento e/ou status do tratamento.
 * Valores de status aceitos: 'ativo' | 'finalizado' | 'cancelado'
 */
async function updateTreatment(id, dados, profissionalId) {
  await assertTratamentoDoUsuario(id, profissionalId);

  const { nomeProcedimento, status } = dados;
  const dataUpdate = {};

  if (nomeProcedimento) dataUpdate.nomeProcedimento = nomeProcedimento.trim();
  if (status)           dataUpdate.status           = status;

  if (Object.keys(dataUpdate).length === 0) {
    throw new ValidationError('Nenhum campo válido para atualizar.');
  }

  return repository.update(id, dataUpdate);
}

module.exports = {
  createTreatment,
  listTreatments,
  getTreatmentById,
  updateTreatment,
};