const service = require('./patientPortal.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * GET /api/v1/patient/access/:token
 *
 * Ponto de entrada do portal do paciente.
 * Recebe o token do link seguro via parâmetro de rota,
 * valida e retorna todos os dados necessários para renderizar
 * o portal: saudação, dia atual, tarefas e status clínico.
 *
 * Rota pública — não exige JWT (paciente não faz login).
 */
async function access(req, res) {
  const { token } = req.params;
  const dados = await service.validateAccess(token);
  return ApiResponse.success(res, dados, 'Acesso ao portal autorizado.');
}

module.exports = { access };