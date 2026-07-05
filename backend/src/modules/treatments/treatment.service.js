const repository = require('./treatment.repository');
const patientRepository = require('../patients/patient.repository');
const { generateSecureToken } = require('../../shared/utils/generateSecureToken');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

/**
 * Verifica se o tratamento existe e pertence a um paciente do profissional logado.
 * Reutilizado por getTreatmentById e funções futuras (ex: finalizar tratamento).
 *
 * @param {string} id            - ID do tratamento
 * @param {string} profissionalId - req.usuario.id
 * @returns {object} tratamento
 */
async function assertTratamentoDoUsuario(id, profissionalId) {
  const tratamento = await repository.findById(id);

  if (!tratamento) {
    throw new NotFoundError('Tratamento não encontrado.');
  }

  // A verificação é feita via tratamento → paciente → profissionalId
  if (tratamento.paciente.profissionalId !== profissionalId) {
    throw new ForbiddenError('Acesso negado. Este tratamento não pertence aos seus pacientes.');
  }

  return tratamento;
}

/**
 * Cria um novo tratamento vinculando paciente, protocolo e profissional.
 *
 * Fluxo de segurança e criação:
 *  1. Valida que o paciente existe e pertence ao profissional logado.
 *  2. Busca a versão mais recente do protocolo informado.
 *  3. Valida que o protocolo existe e tem ao menos uma versão.
 *  4. Gera o tokenPaciente exclusivo (link seguro de 64 chars hex).
 *  5. Persiste o tratamento com versaoProtocoloId (não protocoloId diretamente).
 *
 * doc 03-arquitetura.md seção 18 — Funcionamento do Link Seguro:
 * "Ao cadastrar um paciente, o sistema gera automaticamente um identificador único."
 *
 * @param {{ pacienteId, protocoloId, nomeProcedimento, dataProcedimento }} dados
 * @param {string} profissionalId - req.usuario.id
 */
async function createTreatment(dados, profissionalId) {
  const { pacienteId, protocoloId, nomeProcedimento, dataProcedimento } = dados;

  // ── 1. Valida posse do paciente ─────────────────────────────────────────
  const paciente = await patientRepository.findById(pacienteId);

  if (!paciente) {
    throw new NotFoundError('Paciente não encontrado.');
  }

  if (paciente.profissionalId !== profissionalId) {
    throw new ForbiddenError('Acesso negado. Este paciente não pertence ao seu cadastro.');
  }

  if (!paciente.ativo) {
    throw new ValidationError('Não é possível criar um tratamento para um paciente arquivado.');
  }

  // ── 2. Resolve a versão mais recente do protocolo ───────────────────────
  const versao = await repository.findLatestProtocolVersion(protocoloId);

  if (!versao) {
    throw new NotFoundError(
      'Protocolo não encontrado ou sem versão cadastrada. ' +
      'Crie os dias e tarefas do protocolo antes de vinculá-lo a um tratamento.'
    );
  }

  // ── 3. Gera o token exclusivo do link seguro ────────────────────────────
  const tokenPaciente = generateSecureToken();

  // ── 4. Persiste o tratamento ────────────────────────────────────────────
  return repository.create({
    pacienteId,
    versaoProtocoloId: versao.id,
    nomeProcedimento,
    dataProcedimento,
    tokenPaciente,
  });
}

/**
 * Lista todos os tratamentos dos pacientes do profissional logado.
 *
 * @param {string} profissionalId
 */
async function listTreatments(profissionalId) {
  return repository.findByProfessionalId(profissionalId);
}

/**
 * Retorna um tratamento específico com dados completos.
 * Valida que o tratamento pertence a um paciente do profissional logado.
 *
 * @param {string} id
 * @param {string} profissionalId
 */
async function getTreatmentById(id, profissionalId) {
  return assertTratamentoDoUsuario(id, profissionalId);
}

module.exports = {
  createTreatment,
  listTreatments,
  getTreatmentById,
};