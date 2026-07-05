const repository = require('./protocol.repository');
const { NotFoundError }  = require('../../shared/errors/NotFoundError');
const { ForbiddenError } = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

/**
 * Verifica se o protocolo existe e pertence ao profissional logado.
 * Reutilizado por get, update e delete.
 *
 * Ordem das verificações:
 *  1. Protocolo não existe               → NotFoundError (404)
 *  2. Pertence a outro profissional       → ForbiddenError (403)
 *
 * @param {string} id
 * @param {string} profissionalId
 * @returns {object} protocolo
 */
async function assertProtocoloDoUsuario(id, profissionalId) {
  const protocolo = await repository.findById(id);

  if (!protocolo) {
    throw new NotFoundError('Protocolo não encontrado.');
  }

  if (protocolo.profissionalId !== profissionalId) {
    throw new ForbiddenError('Acesso negado. Este protocolo não pertence ao seu cadastro.');
  }

  return protocolo;
}

/**
 * Cria um protocolo com versão 1 automática.
 *
 * Se o array `dias` for fornecido, os dias e tarefas são criados
 * de forma aninhada em uma única transação (Prisma nested writes).
 *
 * Se `dias` estiver vazio (padrão), o protocolo e a versão 1 são
 * criados sem dias — a estrutura pode ser preenchida posteriormente.
 *
 * @param {object} dados  - Dados validados pelo middleware
 * @param {string} profissionalId - req.usuario.id
 */
async function createProtocol(dados, profissionalId) {
  return repository.create({ ...dados, profissionalId });
}

/**
 * Lista todos os protocolos do profissional logado (ativos e arquivados).
 *
 * @param {string} profissionalId
 */
async function listProtocols(profissionalId) {
  return repository.findAllByProfessional(profissionalId);
}

/**
 * Retorna um protocolo com a estrutura completa (versão atual + dias + tarefas).
 * Valida que o protocolo pertence ao profissional logado.
 *
 * @param {string} id
 * @param {string} profissionalId
 */
async function getProtocolById(id, profissionalId) {
  return assertProtocoloDoUsuario(id, profissionalId);
}

/**
 * Atualiza os metadados do protocolo (nome, descrição, diasPadrao).
 *
 * Regra de versionamento (doc 02-regras-negocio.md, seção 13):
 * "Protocolos poderão ser editados apenas antes de serem utilizados."
 * "Caso já esteja vinculado a pacientes, o sistema preserva a versão original."
 *
 * A lógica de criação de nova versão será acionada no módulo de Tratamentos
 * ao vincular um protocolo — aqui apenas os metadados são atualizados.
 *
 * @param {string} id
 * @param {object} dados
 * @param {string} profissionalId
 */
async function updateProtocol(id, dados, profissionalId) {
  await assertProtocoloDoUsuario(id, profissionalId);
  return repository.update(id, dados);
}

/**
 * Arquiva o protocolo (soft delete — campo `ativo = false`).
 *
 * Hard delete é proibido por integridade referencial (FK Restrict).
 * O protocolo arquivado não aparece na seleção de novos tratamentos,
 * mas permanece disponível para consulta e para tratamentos em andamento.
 *
 * Regra adicional: não permite arquivar um protocolo já arquivado.
 *
 * @param {string} id
 * @param {string} profissionalId
 */
async function deleteProtocol(id, profissionalId) {
  const protocolo = await assertProtocoloDoUsuario(id, profissionalId);

  if (!protocolo.ativo) {
    throw new ValidationError('Este protocolo já está arquivado.');
  }

  return repository.archive(id);
}

module.exports = {
  createProtocol,
  listProtocols,
  getProtocolById,
  updateProtocol,
  deleteProtocol,
};