// Arquivo: backend/src/modules/account/account.controller.js
const service = require('./account.service');
const audit = require('../audit/audit.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

async function preferencias(req, res) {
  return ApiResponse.success(res, await service.obterPreferencias(req.usuario.id), 'Preferências carregadas.');
}

async function atualizarPreferencias(req, res) {
  return ApiResponse.success(res, await service.atualizarPreferencias(req.usuario.id, req.body), 'Preferências salvas.');
}

async function aceitarTermos(req, res) {
  const conta = await service.aceitarTermos(req.usuario.id, req.body.versao);
  await audit.registrar({ req, acao: 'termos.aceitar', entidade: 'profissional', entidadeId: req.usuario.id });
  return ApiResponse.success(res, conta, 'Termos aceitos.');
}

module.exports = { preferencias, atualizarPreferencias, aceitarTermos };
