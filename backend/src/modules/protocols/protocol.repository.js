const { prisma } = require('../../shared/config/prismaClient');

/**
 * Campos retornados nas listagens (sem a estrutura aninhada completa).
 * Inclui apenas a versão mais recente com totalDias para exibir no card.
 */
const CAMPOS_LISTA = {
  id:          true,
  profissionalId: true,
  nome:        true,
  descricao:   true,
  diasPadrao:  true,
  ativo:       true,
  criadoEm:    true,
  atualizadoEm: true,
};

/**
 * Include aninhado completo para busca por ID.
 * Retorna a versão mais recente com todos os dias ordenados
 * e as tarefas de cada dia ordenadas por numeroOrdem.
 */
const INCLUDE_COMPLETO = {
  versoes: {
    orderBy: { versao: 'desc' },
    take: 1,
    include: {
      dias: {
        orderBy: { numeroDia: 'asc' },
        include: {
          tarefas: {
            orderBy: { numeroOrdem: 'asc' },
          },
        },
      },
    },
  },
};

/**
 * Cria um protocolo com versão 1 e estrutura de dias/tarefas aninhados.
 * Toda a operação ocorre em uma única transação do Prisma.
 *
 * @param {{ nome, descricao, diasPadrao, profissionalId, dias }} data
 */
async function create(data) {
  const { nome, descricao, diasPadrao, profissionalId, dias } = data;

  return prisma.protocolo.create({
    data: {
      nome,
      descricao,
      diasPadrao,
      profissionalId,
      versoes: {
        create: {
          versao:    1,
          totalDias: diasPadrao,
          dias: {
            create: dias.map((dia) => ({
              numeroDia: dia.numeroDia,
              titulo:    dia.titulo ?? null,
              tarefas: {
                create: (dia.tarefas ?? []).map((tarefa) => ({
                  descricao:   tarefa.descricao,
                  numeroOrdem: tarefa.numeroOrdem,
                })),
              },
            })),
          },
        },
      },
    },
    include: INCLUDE_COMPLETO,
  });
}

/**
 * Lista todos os protocolos do profissional (ativos e arquivados).
 * Retorna metadados básicos + versão mais recente para exibição nos cards.
 *
 * @param {string} profissionalId
 */
async function findAllByProfessional(profissionalId) {
  return prisma.protocolo.findMany({
    where:   { profissionalId },
    select: {
      ...CAMPOS_LISTA,
      versoes: {
        orderBy: { versao: 'desc' },
        take: 1,
        select: { versao: true, totalDias: true },
      },
    },
    orderBy: { criadoEm: 'desc' },
  });
}

/**
 * Busca um protocolo pelo ID com a estrutura completa aninhada.
 * Retorna null se não encontrado.
 *
 * @param {string} id
 */
async function findById(id) {
  return prisma.protocolo.findUnique({
    where:   { id },
    include: INCLUDE_COMPLETO,
  });
}

/**
 * Atualiza apenas os metadados do protocolo (nome, descricao, diasPadrao).
 * Alterações estruturais (dias/tarefas) criam nova versão — responsabilidade
 * da camada de Tratamentos quando o versionamento for acionado.
 *
 * @param {string} id
 * @param {{ nome?, descricao?, diasPadrao? }} data
 */
async function update(id, data) {
  return prisma.protocolo.update({
    where:   { id },
    data,
    include: INCLUDE_COMPLETO,
  });
}

/**
 * Arquiva o protocolo (soft delete via campo `ativo`).
 *
 * Hard delete é inviável: todos os FK usam onDelete: Restrict.
 * Protocolos com versões ou tratamentos vinculados lançariam erro de integridade.
 *
 * Protocolos arquivados (doc 02-regras-negocio.md, seção 13):
 *  - Não aparecem na seleção de novos tratamentos.
 *  - Permanecem visíveis para consulta.
 *  - Continuam vinculados a tratamentos existentes.
 *
 * @param {string} id
 */
async function archive(id) {
  return prisma.protocolo.update({
    where:   { id },
    data:    { ativo: false },
    include: INCLUDE_COMPLETO,
  });
}

module.exports = { create, findAllByProfessional, findById, update, archive };