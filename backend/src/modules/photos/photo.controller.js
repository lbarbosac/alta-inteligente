// Arquivo: backend/src/modules/photos/photo.controller.js
const service = require('./photo.service');
const audit   = require('../audit/audit.service');

/**
 * GET /api/v1/fotos/:id?u=&exp=&sig=
 * Pública, mas só responde com assinatura válida e dentro do prazo (ver assinatura.js).
 */
async function show(req, res) {
  const { buffer, pacienteId } = await service.abrirFoto(req.params.id, req.query);

  await audit.registrar({
    req, atorTipo: 'profissional', atorId: req.query.u,
    acao: 'foto.visualizar', entidade: 'paciente', entidadeId: pacienteId,
  });

  res.set({
    'Content-Type': 'image/jpeg',
    'Cache-Control': 'private, max-age=600',
    'Content-Disposition': 'inline',
    // O frontend roda em outro endereço: sem isso o helmet bloqueia a <img>
    'Cross-Origin-Resource-Policy': 'cross-origin',
  });
  return res.send(buffer);
}

module.exports = { show };
