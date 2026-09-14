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
// Compara só o que o paciente vê: número do dia, título e tarefas, na ordem.
const estrutura = dias => JSON.stringify([...dias].sort((a,b)=>a.numeroDia-b.numeroDia)
  .map(d => [d.numeroDia, d.titulo||null, (d.tarefas??[]).map(t=>t.descricao?.trim()).filter(Boolean)]));

// Tratamentos apontam para uma versão e as respostas de check-in apontam para as tarefas dela,
// então dias e tarefas não podem ser apagados. Mudou a estrutura → cria versão nova:
// tratamentos em andamento continuam na versão deles, tratamentos novos já pegam a nova.
async function editarProtocolo(id, { nome,descricao,diasPadrao,dias }, profissionalId) {
  const protocolo = await assert(id,profissionalId);
  const versaoAtual = protocolo.versoes[0];
  const mudouEstrutura = !versaoAtual || versaoAtual.totalDias !== diasPadrao || estrutura(versaoAtual.dias) !== estrutura(dias);
  if (mudouEstrutura) await repository.createVersion(id, (versaoAtual?.versao ?? 0) + 1, diasPadrao, dias);
  await repository.update(id,{ nome,descricao,diasPadrao });
  return repository.findById(id);
}

module.exports = { createProtocol,listProtocols,getProtocolById,updateProtocol,deleteProtocol,unarchiveProtocol,editarProtocolo };