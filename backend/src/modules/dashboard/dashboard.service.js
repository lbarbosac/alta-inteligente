// Arquivo: backend/src/modules/dashboard/dashboard.service.js
const repository = require('./dashboard.repository');
const { calculatePatientStatus } = require('../../shared/utils/calculatePatientStatus');

async function getProfessionalDashboard(profissionalId) {
  const [totalAtivos,alertasRaw,checkinsRaw,checkinsHoje,semCheckin] = await Promise.all([
    repository.getActiveTreatmentsCount(profissionalId),
    repository.getCriticalAlerts(profissionalId),
    repository.getRecentCheckins(profissionalId),
    repository.getCheckinsHojeCount(profissionalId),
    repository.getPatientsWithoutRecentCheckin(profissionalId),
  ]);

  const mapCheckin = c => ({
    checkinId:c.id, diaRecuperacao:c.diaRecuperacao, nivelDor:c.nivelDor,
    observacoes:c.observacoes, enviadoEm:c.enviadoEm,
    statusClinico:calculatePatientStatus({nivelDor:c.nivelDor,enviadoEm:c.enviadoEm}),
    paciente:c.tratamento.paciente,
    tratamento:{ id:c.tratamento.id, nomeProcedimento:c.tratamento.nomeProcedimento },
  });

  return {
    cards:{ totalTratamentosAtivos:totalAtivos, totalAlertas:alertasRaw.length, checkinsHoje, semCheckinRecente:semCheckin },
    alertasCriticos: alertasRaw.map(mapCheckin),
    checkinsRecentes: checkinsRaw.map(mapCheckin),
  };
}

module.exports = { getProfessionalDashboard };