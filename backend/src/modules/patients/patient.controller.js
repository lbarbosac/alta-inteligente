const service = require('./patient.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * POST /api/v1/patients
 * Cadastra um novo paciente vinculado ao profissional logado.
 *
 * O profissionalId é extraído do token JWT (req.usuario.id),
 * nunca do body da requisição — garante integridade de dados.
 */
async function create(req, res) {
  const profissionalId = req.usuario.id;
  const paciente = await service.createPatient(req.body, profissionalId);
  return ApiResponse.created(res, paciente, 'Paciente cadastrado com sucesso.');
}

/**
 * GET /api/v1/patients
 * Lista todos os pacientes do profissional logado.
 */
async function list(req, res) {
  const profissionalId = req.usuario.id;
  const pacientes = await service.listPatientsByProfessional(profissionalId);
  return ApiResponse.success(res, pacientes, 'Pacientes listados com sucesso.');
}

/**
 * GET /api/v1/patients/:id
 * Retorna um paciente específico.
 * Retorna 403 se o paciente pertencer a outro profissional.
 */
async function getById(req, res) {
  const profissionalId = req.usuario.id;
  const paciente = await service.getPatientById(req.params.id, profissionalId);
  return ApiResponse.success(res, paciente, 'Paciente encontrado.');
}

/**
 * PUT /api/v1/patients/:id
 * Atualiza os dados cadastrais de um paciente.
 * Retorna 403 se o paciente pertencer a outro profissional.
 */
async function update(req, res) {
  const profissionalId = req.usuario.id;
  const paciente = await service.updatePatient(req.params.id, req.body, profissionalId);
  return ApiResponse.success(res, paciente, 'Paciente atualizado com sucesso.');
}

module.exports = { create, list, getById, update };