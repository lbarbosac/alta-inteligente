// Arquivo: backend/src/modules/checkins/checkin.controller.js
const service = require('./checkin.service');
const audit = require('../audit/audit.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

async function create(req, res) {
  return ApiResponse.created(res, await service.submitCheckin(req.body, req.files ?? []), 'Check-in enviado com sucesso!');
}

async function listByTreatment(req, res) {
  const { pacienteId, checkins } = await service.getCheckinsByTreatment(req.params.tratamentoId, req.usuario.id);
  await audit.registrar({ req, acao: 'checkins.visualizar', entidade: 'paciente', entidadeId: pacienteId });
  return ApiResponse.success(res, checkins, 'Histórico carregado.');
}

module.exports = { create, listByTreatment };
