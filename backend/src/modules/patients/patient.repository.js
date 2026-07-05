const { prisma } = require('../../shared/config/prismaClient');

/**
 * Campos retornados em todas as queries de paciente.
 * Inclui o profissionalId para que o service possa
 * executar a verificação de propriedade (segurança).
 */
const CAMPOS_PUBLICOS = {
  id:             true,
  profissionalId: true,
  nome:           true,
  dataNascimento: true,
  telefone:       true,
  email:          true,
  observacoes:    true,
  ativo:          true,
  criadoEm:       true,
  atualizadoEm:   true,
};

/**
 * Cria um novo paciente associado ao profissional logado.
 * O ID é gerado automaticamente pelo Prisma (@default(uuid())).
 *
 * @param {{ nome, dataNascimento, telefone, email?, observacoes?, profissionalId }} data
 */
async function create(data) {
  return prisma.paciente.create({
    data,
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Lista todos os pacientes de um profissional específico.
 * Retorna ativos e inativos — o admin de listagem exibe o status.
 *
 * @param {string} profissionalId
 */
async function findByProfessionalId(profissionalId) {
  return prisma.paciente.findMany({
    where: { profissionalId },
    select: CAMPOS_PUBLICOS,
    orderBy: { criadoEm: 'desc' },
  });
}

/**
 * Busca um paciente pelo ID.
 * Retorna null se não encontrado — a verificação de NotFoundError
 * e ForbiddenError é responsabilidade do service.
 *
 * @param {string} id
 */
async function findById(id) {
  return prisma.paciente.findUnique({
    where: { id },
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Atualiza os dados cadastrais de um paciente.
 * Recebe apenas os campos que devem ser alterados.
 *
 * @param {string} id
 * @param {object} data
 */
async function update(id, data) {
  return prisma.paciente.update({
    where: { id },
    data,
    select: CAMPOS_PUBLICOS,
  });
}

module.exports = { create, findByProfessionalId, findById, update };