const repository = require('./patient.repository');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');

/**
 * Verifica se o paciente existe e pertence ao profissional logado.
 * Função interna reutilizada por getPatientById e updatePatient.
 *
 * Ordem das verificações (doc 02-regras-negocio.md, seção 3.2):
 *  1. Paciente não existe → NotFoundError (404)
 *  2. Paciente existe mas pertence a outro profissional → ForbiddenError (403)
 *     (Não revelamos que o paciente existe para evitar enumeração de IDs.)
 *
 * @param {string} id
 * @param {string} profissionalId - ID do profissional logado
 * @returns {object} paciente
 */
async function assertPacienteDoUsuario(id, profissionalId) {
  const paciente = await repository.findById(id);

  if (!paciente) {
    throw new NotFoundError('Paciente não encontrado.');
  }

  if (paciente.profissionalId !== profissionalId) {
    // Retorna 403, não 404 — o paciente existe mas o acesso é negado
    throw new ForbiddenError('Acesso negado. Este paciente não pertence ao seu cadastro.');
  }

  return paciente;
}

/**
 * Cadastra um novo paciente associado ao profissional logado.
 * O profissionalId vem do token JWT, nunca do body da requisição.
 *
 * @param {object} dados  - Dados validados pelo middleware
 * @param {string} profissionalId - req.usuario.id
 */
async function createPatient(dados, profissionalId) {
  return repository.create({
    ...dados,
    profissionalId,
  });
}

/**
 * Lista todos os pacientes do profissional logado.
 * Um profissional nunca visualiza pacientes de outro profissional.
 *
 * @param {string} profissionalId - req.usuario.id
 */
async function listPatientsByProfessional(profissionalId) {
  return repository.findByProfessionalId(profissionalId);
}

/**
 * Retorna um paciente específico.
 * Garante que o paciente pertence ao profissional logado.
 *
 * @param {string} id
 * @param {string} profissionalId - req.usuario.id
 */
async function getPatientById(id, profissionalId) {
  return assertPacienteDoUsuario(id, profissionalId);
}

/**
 * Atualiza os dados cadastrais de um paciente.
 * Executa a verificação de propriedade antes de qualquer alteração.
 *
 * @param {string} id
 * @param {object} dados
 * @param {string} profissionalId - req.usuario.id
 */
async function updatePatient(id, dados, profissionalId) {
  await assertPacienteDoUsuario(id, profissionalId);
  return repository.update(id, dados);
}

module.exports = {
  createPatient,
  listPatientsByProfessional,
  getPatientById,
  updatePatient,
};