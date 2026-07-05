const service = require('./checkin.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * POST /api/v1/checkins
 *
 * Recebe e persiste o check-in diário do paciente.
 * Rota pública — o paciente não possui JWT.
 * A segurança é garantida pelo tratamentoId (UUID) + constraint @@unique do banco.
 */
async function create(req, res) {
  const checkin = await service.submitCheckin(req.body);
  return ApiResponse.created(res, checkin, 'Check-in enviado com sucesso! Continue assim.');
}

module.exports = { create };