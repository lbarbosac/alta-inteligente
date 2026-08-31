// Arquivo: src/modules/patient-portal/patientPortal.controller.js
const service       = require('./patientPortal.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * GET /api/v1/patient/access/:token
 *
 * O service agora retorna sempre um objeto com `status`.
 * O frontend usa esse campo para decidir qual tela renderizar.
 * Nunca retorna 404 para o portal — apenas um status amigável.
 */
async function access(req, res) {
  const { token } = req.params;
  const dados = await service.validateAccess(token);
  return ApiResponse.success(res, dados, 'Portal consultado.');
}

module.exports = { access };