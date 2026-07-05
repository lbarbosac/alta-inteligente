const repository = require('./dashboard.repository');
const { calculatePatientStatus } = require('../../shared/utils/calculatePatientStatus');

/**
 * Consolida todas as métricas do dashboard do profissional em um único objeto.
 *
 * As 4 queries rodam em paralelo (Promise.all) para minimizar
 * o tempo de resposta — nenhuma delas depende do resultado de outra.
 *
 * Estrutura da resposta:
 * {
 *   cards: {                    → métricas para os cards superiores
 *     totalTratamentosAtivos,
 *     totalAlertas,
 *     semCheckinRecente,
 *   },
 *   alertasCriticos: [...],     → pacientes que precisam de atenção imediata
 *   checkinsRecentes: [...],    → feed dos últimos 5 check-ins
 * }
 *
 * @param {string} profissionalId - req.usuario.id
 */
async function getProfessionalDashboard(profissionalId) {
  const [
    totalAtivos,
    alertasRaw,
    checkinsRaw,
    semCheckin,
  ] = await Promise.all([
    repository.getActiveTreatmentsCount(profissionalId),
    repository.getCriticalAlerts(profissionalId),
    repository.getRecentCheckins(profissionalId),
    repository.getPatientsWithoutRecentCheckin(profissionalId),
  ]);

  // Formata alertas com status clínico calculado
  const alertasCriticos = alertasRaw.map((checkin) => ({
    checkinId:      checkin.id,
    diaRecuperacao: checkin.diaRecuperacao,
    nivelDor:       checkin.nivelDor,
    observacoes:    checkin.observacoes,
    enviadoEm:      checkin.enviadoEm,
    statusClinico:  calculatePatientStatus({
      nivelDor:  checkin.nivelDor,
      enviadoEm: checkin.enviadoEm,
    }),
    paciente: {
      id:       checkin.tratamento.paciente.id,
      nome:     checkin.tratamento.paciente.nome,
      telefone: checkin.tratamento.paciente.telefone,
    },
    tratamento: {
      id:               checkin.tratamento.id,
      nomeProcedimento: checkin.tratamento.nomeProcedimento,
    },
  }));

  // Formata feed de check-ins recentes
  const checkinsRecentes = checkinsRaw.map((checkin) => ({
    checkinId:      checkin.id,
    diaRecuperacao: checkin.diaRecuperacao,
    nivelDor:       checkin.nivelDor,
    observacoes:    checkin.observacoes,
    enviadoEm:      checkin.enviadoEm,
    statusClinico:  calculatePatientStatus({
      nivelDor:  checkin.nivelDor,
      enviadoEm: checkin.enviadoEm,
    }),
    paciente: {
      id:   checkin.tratamento.paciente.id,
      nome: checkin.tratamento.paciente.nome,
    },
    tratamento: {
      id:               checkin.tratamento.id,
      nomeProcedimento: checkin.tratamento.nomeProcedimento,
    },
  }));

  return {
    cards: {
      totalTratamentosAtivos: totalAtivos,
      totalAlertas:           alertasCriticos.length,
      semCheckinRecente:      semCheckin,
    },
    alertasCriticos,
    checkinsRecentes,
  };
}

module.exports = { getProfessionalDashboard };