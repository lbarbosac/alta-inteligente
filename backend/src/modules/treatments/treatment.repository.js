const { prisma } = require('../../shared/config/prismaClient');

/**
 * Include padrão para todas as queries de tratamento.
 * Traz os dados do paciente (com profissionalId para verificação de posse)
 * e os dados da versão do protocolo usada.
 */
const INCLUDE_PADRAO = {
  paciente: {
    select: {
      id:             true,
      nome:           true,
      telefone:       true,
      email:          true,
      dataNascimento: true,
      profissionalId: true, // usado pela camada de serviço para validar posse
    },
  },
  versaoProtocolo: {
    include: {
      protocolo: {
        select: {
          id:        true,
          nome:      true,
          descricao: true,
        },
      },
    },
  },
};

/**
 * Cria um novo tratamento.
 * tokenPaciente e versaoProtocoloId são gerados/resolvidos pelo service
 * antes de chegar aqui.
 *
 * @param {{ pacienteId, versaoProtocoloId, nomeProcedimento, dataProcedimento, tokenPaciente }} data
 */
async function create(data) {
  return prisma.tratamento.create({
    data,
    include: INCLUDE_PADRAO,
  });
}

/**
 * Busca um tratamento pelo ID com dados completos do paciente e protocolo.
 * Retorna null se não encontrado.
 *
 * @param {string} id
 */
async function findById(id) {
  return prisma.tratamento.findUnique({
    where: { id },
    include: INCLUDE_PADRAO,
  });
}

/**
 * Lista todos os tratamentos cujos pacientes pertencem ao profissional logado.
 * O join é feito via relação Tratamento → Paciente → profissionalId.
 *
 * @param {string} profissionalId
 */
async function findByProfessionalId(profissionalId) {
  return prisma.tratamento.findMany({
    where: {
      paciente: { profissionalId },
    },
    include: INCLUDE_PADRAO,
    orderBy: { criadoEm: 'desc' },
  });
}

/**
 * Atualiza o status de um tratamento.
 * Valores válidos: 'ativo' | 'finalizado' | 'cancelado' (enum StatusTratamento).
 *
 * @param {string} id
 * @param {'ativo'|'finalizado'|'cancelado'} status
 */
async function updateStatus(id, status) {
  return prisma.tratamento.update({
    where: { id },
    data:  { status },
    include: INCLUDE_PADRAO,
  });
}

/**
 * Busca a versão mais recente de um protocolo pelo protocoloId.
 * Usado pelo service para resolver versaoProtocoloId ao criar um tratamento.
 *
 * @param {string} protocoloId
 */
async function findLatestProtocolVersion(protocoloId) {
  return prisma.versaoProtocolo.findFirst({
    where:   { protocoloId },
    orderBy: { versao: 'desc' },
    select:  { id: true, versao: true, totalDias: true },
  });
}

module.exports = {
  create,
  findById,
  findByProfessionalId,
  updateStatus,
  findLatestProtocolVersion,
};