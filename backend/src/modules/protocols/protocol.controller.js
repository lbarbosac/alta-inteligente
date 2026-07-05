const service = require('./protocol.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * POST /api/v1/protocols
 * Cria um protocolo com versão 1 e estrutura opcional de dias/tarefas.
 */
async function create(req, res) {
  const protocolo = await service.createProtocol(req.body, req.usuario.id);
  return ApiResponse.created(res, protocolo, 'Protocolo criado com sucesso.');
}

/**
 * GET /api/v1/protocols
 * Lista todos os protocolos do profissional logado.
 */
async function list(req, res) {
  const protocolos = await service.listProtocols(req.usuario.id);
  return ApiResponse.success(res, protocolos, 'Protocolos listados com sucesso.');
}

/**
 * GET /api/v1/protocols/:id
 * Retorna um protocolo com a estrutura completa (versão + dias + tarefas).
 */
async function getById(req, res) {
  const protocolo = await service.getProtocolById(req.params.id, req.usuario.id);
  return ApiResponse.success(res, protocolo, 'Protocolo encontrado.');
}

/**
 * PUT /api/v1/protocols/:id
 * Atualiza os metadados do protocolo (nome, descrição, diasPadrao).
 */
async function update(req, res) {
  const protocolo = await service.updateProtocol(req.params.id, req.body, req.usuario.id);
  return ApiResponse.success(res, protocolo, 'Protocolo atualizado com sucesso.');
}

/**
 * DELETE /api/v1/protocols/:id
 * Arquiva o protocolo (soft delete via campo `ativo = false`).
 * Hard delete é inviável por integridade referencial (FK Restrict).
 */
async function remove(req, res) {
  const protocolo = await service.deleteProtocol(req.params.id, req.usuario.id);
  return ApiResponse.success(res, protocolo, 'Protocolo arquivado com sucesso.');
}

module.exports = { create, list, getById, update, remove };