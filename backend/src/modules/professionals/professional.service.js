const bcrypt = require('bcrypt');

const repository = require('./professional.repository');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ValidationError } = require('../../shared/errors/ValidationError');

const SALT_ROUNDS = 10;

/**
 * Cria um novo profissional.
 *
 * Regras:
 *  - E-mail deve ser único na tabela de profissionais.
 *  - Senha é armazenada como hash bcrypt (nunca em texto puro).
 *
 * @param {{ nome, email, senha, telefone, especialidade }} dados
 */
async function createProfessional(dados) {
  const emailEmUso = await repository.findByEmail(dados.email);
  if (emailEmUso) {
    throw new ValidationError('Este e-mail já está cadastrado.');
  }

  const senhaHash = await bcrypt.hash(dados.senha, SALT_ROUNDS);

  return repository.create({
    nome:          dados.nome,
    email:         dados.email,
    senha:         senhaHash,
    telefone:      dados.telefone,
    especialidade: dados.especialidade,
  });
}

/**
 * Retorna todos os profissionais (ativos e inativos).
 * A senha nunca é incluída — filtrada na camada do repositório.
 */
async function listProfessionals() {
  return repository.findAll();
}

/**
 * Retorna um profissional pelo ID.
 *
 * @param {string} id
 * @throws {NotFoundError} Se o profissional não existir.
 */
async function getProfessional(id) {
  const profissional = await repository.findById(id);

  if (!profissional) {
    throw new NotFoundError('Profissional não encontrado.');
  }

  return profissional;
}

/**
 * Atualiza os dados cadastrais de um profissional.
 *
 * Regras:
 *  - O profissional deve existir.
 *  - Se o e-mail for alterado, não pode já estar em uso por outro profissional.
 *  - Senha não é alterada aqui (fluxo separado, não implementado no MVP).
 *
 * @param {string} id
 * @param {{ nome?, email?, telefone?, especialidade? }} dados
 */
async function updateProfessional(id, dados) {
  const profissional = await repository.findById(id);
  if (!profissional) {
    throw new NotFoundError('Profissional não encontrado.');
  }

  if (dados.email && dados.email !== profissional.email) {
    const emailEmUso = await repository.findByEmail(dados.email);
    if (emailEmUso) {
      throw new ValidationError('Este e-mail já está em uso por outro profissional.');
    }
  }

  return repository.update(id, dados);
}

/**
 * Alterna o status ativo/inativo de um profissional.
 *
 * Regras (doc 02-regras-negocio.md, seção 3.1):
 *  - Admin pode bloquear ou ativar profissionais.
 *  - O registro permanece no banco (sem exclusão física).
 *
 * @param {string} id
 * @throws {NotFoundError} Se o profissional não existir.
 */
async function toggleProfessionalStatus(id) {
  const profissional = await repository.findById(id);
  if (!profissional) {
    throw new NotFoundError('Profissional não encontrado.');
  }

  const novoAtivo = !profissional.ativo;
  return repository.toggleStatus(id, novoAtivo);
}

module.exports = {
  createProfessional,
  listProfessionals,
  getProfessional,
  updateProfessional,
  toggleProfessionalStatus,
};