const service = require('./treatment.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * POST /api/v1/treatments
 * Cria um tratamento vinculando um paciente ao protocolo.
 * Gera automaticamente o tokenPaciente (link seguro).
 */
async function create(req, res) {
  const tratamento = await service.createTreatment(req.body, req.usuario.id);
  return ApiResponse.created(res, tratamento, 'Tratamento iniciado com sucesso.');
}

/**
 * GET /api/v1/treatments
 * Lista todos os tratamentos dos pacientes do profissional logado.
 */
async function list(req, res) {
  const tratamentos = await service.listTreatments(req.usuario.id);
  return ApiResponse.success(res, tratamentos, 'Tratamentos listados com sucesso.');
}

/**
 * GET /api/v1/treatments/:id
 * Retorna um tratamento específico com dados do paciente e protocolo.
 * Retorna 403 se o tratamento pertencer a paciente de outro profissional.
 */
async function getById(req, res) {
  const tratamento = await service.getTreatmentById(req.params.id, req.usuario.id);
  return ApiResponse.success(res, tratamento, 'Tratamento encontrado.');
}

module.exports = { create, list, getById };