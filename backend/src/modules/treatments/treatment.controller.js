// Arquivo: backend/src/modules/treatments/treatment.controller.js
const service       = require('./treatment.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

async function create(req, res) {
  const tratamento = await service.createTreatment(req.body, req.usuario.id);
  return ApiResponse.created(res, tratamento, 'Tratamento iniciado com sucesso.');
}

async function list(req, res) {
  const tratamentos = await service.listTreatments(req.usuario.id);
  return ApiResponse.success(res, tratamentos, 'Tratamentos listados com sucesso.');
}

async function getById(req, res) {
  const tratamento = await service.getTreatmentById(req.params.id, req.usuario.id);
  return ApiResponse.success(res, tratamento, 'Tratamento encontrado.');
}

/**
 * PATCH /api/v1/treatments/:id
 * Atualiza nomeProcedimento e/ou status do tratamento.
 * Body aceita: { nomeProcedimento?, status? }
 */
async function update(req, res) {
  const tratamento = await service.updateTreatment(req.params.id, req.body, req.usuario.id);
  return ApiResponse.success(res, tratamento, 'Tratamento atualizado com sucesso.');
}

module.exports = { create, list, getById, update };