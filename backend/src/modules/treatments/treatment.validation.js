const { z } = require('zod');

// ─── Schema ────────────────────────────────────────────────────────────────

/**
 * createSchema — campos obrigatórios para iniciar um tratamento.
 *
 * Notas:
 *  - `protocoloId`: ID do Protocolo base. O service resolverá a versão
 *    mais recente (VersaoProtocolo) automaticamente.
 *  - `dataProcedimento`: data da cirurgia/procedimento. Dia 1 da recuperação.
 *    Aceita string ISO (ex: "2026-06-01") e converte para Date via z.coerce.
 *  - `nomeProcedimento`: obrigatório no schema do banco. Define o nome
 *    do procedimento realizado (ex: "Extração de siso", "Implante").
 *  - `pacienteId` e `profissionalId` NÃO estão aqui:
 *      pacienteId vem do body, mas profissionalId vem exclusivamente
 *      do token JWT (req.usuario.id) — nunca do body.
 */
const createSchema = z.object({
  pacienteId: z
    .string()
    .uuid('ID do paciente inválido.'),

  protocoloId: z
    .string()
    .uuid('ID do protocolo inválido.'),

  nomeProcedimento: z
    .string()
    .min(2, 'Nome do procedimento deve ter ao menos 2 caracteres.'),

  dataProcedimento: z.coerce
    .date({ message: 'Data do procedimento inválida. Use o formato AAAA-MM-DD.' }),
});

// ─── Middleware ────────────────────────────────────────────────────────────

function validateCreate(req, res, next) {
  const resultado = createSchema.safeParse(req.body);
  if (!resultado.success) return next(resultado.error);
  req.body = resultado.data;
  next();
}

module.exports = { validateCreate };