// Arquivo: backend/src/modules/checkins/checkin.controller.js
const service = require('./checkin.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

async function create(req, res) {
  return ApiResponse.created(res, await service.submitCheckin(req.body), 'Check-in enviado com sucesso!');
}

async function listByTreatment(req, res) {
  return ApiResponse.success(res, await service.getCheckinsByTreatment(req.params.tratamentoId, req.usuario.id), 'Histórico carregado.');
}

module.exports = { create, listByTreatment };