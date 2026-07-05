const { prisma } = require('../../shared/config/prismaClient');

/**
 * Conta quantos tratamentos ativos o profissional possui.
 * Usado no card "Tratamentos Ativos" do dashboard.
 *
 * @param {string} profissionalId
 * @returns {Promise<number>}
 */
async function getActiveTreatmentsCount(profissionalId) {
  return prisma.tratamento.count({
    where: {
      status:   'ativo',
      paciente: { profissionalId },
    },
  });
}

/**
 * Busca check-ins críticos das últimas 48 horas (nivelDor >= 7).
 *
 * Ordenados do maior nível de dor para o menor para que o
 * profissional veja imediatamente os casos mais graves.
 *
 * Inclui nome e telefone do paciente para contato rápido.
 *
 * Critérios (doc 02-regras-negocio.md, seção 17):
 *  - nivelDor >= 7 → estado "Atenção" ou "Crítico"
 *  - Janela de 48 horas para evitar alertas de dias anteriores
 *    já resolvidos
 *
 * @param {string} profissionalId
 * @returns {Promise<Array>}
 */
async function getCriticalAlerts(profissionalId) {
  const quarentaOitoHorasAtras = new Date(Date.now() - 48 * 60 * 60 * 1000);

  return prisma.checkin.findMany({
    where: {
      nivelDor:  { gte: 7 },
      enviadoEm: { gte: quarentaOitoHorasAtras },
      tratamento: {
        status:   'ativo',
        paciente: { profissionalId },
      },
    },
    select: {
      id:             true,
      diaRecuperacao: true,
      nivelDor:       true,
      observacoes:    true,
      enviadoEm:      true,
      tratamento: {
        select: {
          id:               true,
          nomeProcedimento: true,
          paciente: {
            select: {
              id:       true,
              nome:     true,
              telefone: true,
            },
          },
        },
      },
    },
    orderBy: [
      { nivelDor:  'desc' },   // mais grave primeiro
      { enviadoEm: 'desc' },   // mais recente como critério de desempate
    ],
  });
}

/**
 * Retorna os últimos 5 check-ins dos pacientes do profissional.
 * Exibido na seção "Últimos Check-ins" do dashboard.
 *
 * Filtra apenas tratamentos ativos para não poluir o feed
 * com dados de tratamentos encerrados.
 *
 * @param {string} profissionalId
 * @returns {Promise<Array>}
 */
async function getRecentCheckins(profissionalId) {
  return prisma.checkin.findMany({
    where: {
      tratamento: {
        status:   'ativo',
        paciente: { profissionalId },
      },
    },
    select: {
      id:             true,
      diaRecuperacao: true,
      nivelDor:       true,
      observacoes:    true,
      enviadoEm:      true,
      tratamento: {
        select: {
          id:               true,
          nomeProcedimento: true,
          paciente: {
            select: {
              id:   true,
              nome: true,
            },
          },
        },
      },
    },
    orderBy: { enviadoEm: 'desc' },
    take: 5,
  });
}

/**
 * Conta pacientes sem check-in nas últimas 48 horas.
 * Usado no card "Sem Check-in" do dashboard.
 *
 * Estratégia: busca tratamentos ativos cujo ID não aparece
 * em nenhum check-in das últimas 48h.
 *
 * @param {string} profissionalId
 * @returns {Promise<number>}
 */
async function getPatientsWithoutRecentCheckin(profissionalId) {
  const quarentaOitoHorasAtras = new Date(Date.now() - 48 * 60 * 60 * 1000);

  return prisma.tratamento.count({
    where: {
      status:   'ativo',
      paciente: { profissionalId },
      checkins: {
        none: {
          enviadoEm: { gte: quarentaOitoHorasAtras },
        },
      },
    },
  });
}

module.exports = {
  getActiveTreatmentsCount,
  getCriticalAlerts,
  getRecentCheckins,
  getPatientsWithoutRecentCheckin,
};