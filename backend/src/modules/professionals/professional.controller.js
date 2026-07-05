const service = require('./professional.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * POST /api/v1/professionals
 * Cadastra um novo profissional.
 * Acesso: apenas admin.
 */
async function create(req, res) {
  const profissional = await service.createProfessional(req.body);
  return ApiResponse.created(res, profissional, 'Profissional cadastrado com sucesso.');
}

/**
 * GET /api/v1/professionals
 * Lista todos os profissionais (ativos e inativos).
 * Acesso: apenas admin.
 */
async function list(req, res) {
  const profissionais = await service.listProfessionals();
  return ApiResponse.success(res, profissionais, 'Profissionais listados com sucesso.');
}

/**
 * GET /api/v1/professionals/:id
 * Retorna um profissional pelo ID.
 * Acesso: apenas admin.
 */
async function get(req, res) {
  const profissional = await service.getProfessional(req.params.id);
  return ApiResponse.success(res, profissional, 'Profissional encontrado.');
}

/**
 * PUT /api/v1/professionals/:id
 * Atualiza os dados cadastrais de um profissional.
 * Acesso: apenas admin.
 */
async function update(req, res) {
  const profissional = await service.updateProfessional(req.params.id, req.body);
  return ApiResponse.success(res, profissional, 'Profissional atualizado com sucesso.');
}

/**
 * PATCH /api/v1/professionals/:id/status
 * Ativa ou bloqueia um profissional (inverte o campo `ativo`).
 * Acesso: apenas admin.
 */
async function toggleStatus(req, res) {
  const profissional = await service.toggleProfessionalStatus(req.params.id);

  const mensagem = profissional.ativo
    ? 'Profissional ativado com sucesso.'
    : 'Profissional bloqueado com sucesso.';

  return ApiResponse.success(res, profissional, mensagem);
}

module.exports = { create, list, get, update, toggleStatus };