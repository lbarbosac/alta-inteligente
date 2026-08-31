// Arquivo: backend/src/modules/protocols/protocol.controller.js
const service = require('./protocol.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

async function create(req,res)    { return ApiResponse.created(res, await service.createProtocol(req.body,req.usuario.id), 'Protocolo criado.'); }
async function list(req,res)      { return ApiResponse.success(res, await service.listProtocols(req.usuario.id), 'Listados.'); }
async function getById(req,res)   { return ApiResponse.success(res, await service.getProtocolById(req.params.id,req.usuario.id), 'Encontrado.'); }
async function update(req,res)    { return ApiResponse.success(res, await service.updateProtocol(req.params.id,req.body,req.usuario.id), 'Atualizado.'); }
async function remove(req,res)    { return ApiResponse.success(res, await service.deleteProtocol(req.params.id,req.usuario.id), 'Arquivado.'); }
async function unarchive(req,res) { return ApiResponse.success(res, await service.unarchiveProtocol(req.params.id,req.usuario.id), 'Reativado.'); }
async function editar(req,res)    { return ApiResponse.success(res, await service.editarProtocolo(req.params.id,req.body,req.usuario.id), 'Editado.'); }

module.exports = { create,list,getById,update,remove,unarchive,editar };