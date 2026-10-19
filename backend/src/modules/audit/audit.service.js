// Arquivo: backend/src/modules/audit/audit.service.js
// Registro de acesso a dados de pacientes (LGPD art. 37). Nunca derruba a operação principal:
// se o registro falhar, o erro vai para o log e a requisição segue.
const repository = require('./audit.repository');

function ipDe(req) {
  return req?.ip ? String(req.ip).slice(0, 45) : null;
}

function atorDe(req) {
  const usuario = req?.usuario;
  if (!usuario) return { atorTipo: 'sistema', atorId: null };
  return { atorTipo: usuario.role === 'admin' ? 'admin' : 'profissional', atorId: usuario.id };
}

async function registrar({ req, atorTipo, atorId, acao, entidade, entidadeId = null }) {
  const ator = atorTipo ? { atorTipo, atorId: atorId ?? null } : atorDe(req);
  try {
    await repository.create({ ...ator, acao, entidade, entidadeId, ip: ipDe(req) });
  } catch (err) {
    console.error(`[auditoria] falha ao registrar "${acao}":`, err.message);
  }
}

async function listarPorEntidade(entidade, entidadeId) {
  return repository.findByEntidade(entidade, entidadeId);
}

module.exports = { registrar, listarPorEntidade, ipDe };
