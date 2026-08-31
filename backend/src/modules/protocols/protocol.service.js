// Arquivo: backend/src/modules/protocols/protocol.service.js
const repository = require('./protocol.repository');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

async function assert(id, profissionalId) {
  const p = await repository.findById(id);
  if (!p) throw new NotFoundError('Protocolo não encontrado.');
  if (p.profissionalId !== profissionalId) throw new ForbiddenError('Acesso negado.');
  return p;
}

async function createProtocol(dados, profissionalId) { return repository.create({...dados,profissionalId}); }
async function listProtocols(profissionalId) { return repository.findAllByProfessional(profissionalId); }
async function getProtocolById(id, profissionalId) { return assert(id, profissionalId); }
async function updateProtocol(id, dados, profissionalId) { await assert(id,profissionalId); return repository.update(id,dados); }
async function deleteProtocol(id, profissionalId) {
  const p = await assert(id,profissionalId);
  if (!p.ativo) throw new ValidationError('Protocolo já arquivado.');
  return repository.archive(id);
}
async function unarchiveProtocol(id, profissionalId) {
  const p = await assert(id,profissionalId);
  if (p.ativo) throw new ValidationError('Protocolo já está ativo.');
  return repository.unarchive(id);
}
async function editarProtocolo(id, { nome,descricao,diasPadrao,dias }, profissionalId) {
  const protocolo = await assert(id,profissionalId);
  await repository.update(id,{ nome,descricao,diasPadrao:parseInt(diasPadrao) });
  const versao = protocolo.versoes[0];
  if (versao) await repository.updateVersionDays(versao.id, parseInt(diasPadrao), dias??[]);
  return repository.findById(id);
}

module.exports = { createProtocol,listProtocols,getProtocolById,updateProtocol,deleteProtocol,unarchiveProtocol,editarProtocolo };