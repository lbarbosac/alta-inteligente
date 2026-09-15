// Arquivo: src/modules/patient-portal/patientPortal.controller.js
const service       = require('./patientPortal.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * GET /api/v1/patient/access/:token
 *
 * O service retorna sempre um objeto com `status`:
 * 'invalido' | 'encerrado' | 'consentimento_pendente' | 'ativo'.
 * O frontend usa esse campo para decidir qual tela renderizar.
 */
async function access(req, res) {
  const { token } = req.params;
  const dados = await service.validateAccess(token);
  return ApiResponse.success(res, dados, 'Portal consultado.');
}

/**
 * POST /api/v1/patient/access/:token/consentimento
 * Body: { aceitaLembretes: boolean }
 */
async function consent(req, res) {
  const consentimento = await service.registrarConsentimento(req.params.token, req.body, req);
  return ApiResponse.created(res, consentimento, 'Termo aceito.');
}

module.exports = { access, consent };
