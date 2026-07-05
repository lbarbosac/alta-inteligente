const service = require('./dashboard.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * GET /api/v1/dashboard
 *
 * Retorna o resumo completo do dashboard do profissional logado:
 *  - Cards com métricas (tratamentos ativos, alertas, sem check-in)
 *  - Lista de pacientes em alerta crítico (nivelDor >= 7 nas últimas 48h)
 *  - Feed dos últimos 5 check-ins recebidos
 */
async function getSummary(req, res) {
  const dashboard = await service.getProfessionalDashboard(req.usuario.id);
  return ApiResponse.success(res, dashboard, 'Dashboard carregado com sucesso.');
}

module.exports = { getSummary };