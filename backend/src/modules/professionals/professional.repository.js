const { prisma } = require('../../shared/config/prismaClient');

/**
 * Campos públicos — retornados em todas as queries.
 * Senha nunca é exposta fora do repositório de autenticação.
 */
const CAMPOS_PUBLICOS = {
  id:            true,
  nome:          true,
  email:         true,
  especialidade: true,
  telefone:      true,
  ativo:         true,
  criadoEm:      true,
  atualizadoEm:  true,
};

/**
 * Cria um novo profissional.
 * O ID é gerado automaticamente pelo Prisma (@default(uuid())).
 *
 * @param {{ nome, email, senha, telefone, especialidade }} data
 */
async function create(data) {
  return prisma.profissional.create({
    data,
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Retorna todos os profissionais ordenados do mais recente ao mais antigo.
 * Inclui ativos e inativos para permitir gestão completa pelo admin.
 */
async function findAll() {
  return prisma.profissional.findMany({
    select: CAMPOS_PUBLICOS,
    orderBy: { criadoEm: 'desc' },
  });
}

/**
 * Busca um profissional pelo ID.
 * Retorna null se não encontrado.
 *
 * @param {string} id
 */
async function findById(id) {
  return prisma.profissional.findUnique({
    where: { id },
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Busca um profissional pelo e-mail.
 * Usado para verificar duplicidade antes de criar ou atualizar.
 * Retorna apenas os campos necessários para a verificação.
 *
 * @param {string} email
 */
async function findByEmail(email) {
  return prisma.profissional.findUnique({
    where: { email },
    select: { id: true, email: true },
  });
}

/**
 * Atualiza os dados cadastrais de um profissional.
 *
 * @param {string} id
 * @param {object} data - Apenas os campos que devem ser alterados
 */
async function update(id, data) {
  return prisma.profissional.update({
    where: { id },
    data,
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Alterna o status ativo/inativo de um profissional (soft delete funcional).
 * Em vez de remover do banco, apenas inverte o campo `ativo`.
 *
 * @param {string} id
 * @param {boolean} novoAtivo
 */
async function toggleStatus(id, novoAtivo) {
  return prisma.profissional.update({
    where: { id },
    data: { ativo: novoAtivo },
    select: CAMPOS_PUBLICOS,
  });
}

module.exports = { create, findAll, findById, findByEmail, update, toggleStatus };