const { z } = require('zod');

// ─── Sub-schema ────────────────────────────────────────────────────────────

/**
 * Cada item de `respostas` representa a resposta do paciente
 * a uma tarefa específica do dia do protocolo.
 * Mapeia para a tabela RespostaTarefaCheckin.
 */
const respostaSchema = z.object({
  tarefaDiaProtocoloId: z
    .string()
    .uuid('ID de tarefa inválido.'),

  concluido: z
    .boolean({ message: 'O campo concluido deve ser verdadeiro ou falso.' }),
});

// ─── Schema principal ──────────────────────────────────────────────────────

/**
 * createSchema — campos obrigatórios para envio do check-in diário.
 *
 * Notas:
 *  - `nivelDor`: obrigatório no banco (TinyInt). Escala 1–10 conforme
 *    doc 02-regras-negocio.md seção 15.
 *  - `enviadoEm`: definido pelo servidor (new Date()) — nunca pelo cliente.
 *  - `observacoes`: campo livre e opcional.
 *  - `respostas`: array opcional — o paciente pode enviar sem marcar tarefas.
 */
const createSchema = z.object({
  tratamentoId: z
    .string()
    .uuid('ID de tratamento inválido.'),

  diaRecuperacao: z
    .number()
    .int()
    .positive('Dia de recuperação deve ser um inteiro positivo.'),

  nivelDor: z
    .number()
    .int()
    .min(1,  'Nível de dor mínimo é 1.')
    .max(10, 'Nível de dor máximo é 10.'),

  observacoes: z
    .string()
    .optional()
    .nullable(),

  respostas: z
    .array(respostaSchema)
    .optional()
    .default([]),
});

// ─── Middleware ────────────────────────────────────────────────────────────

function validateCreate(req, res, next) {
  const resultado = createSchema.safeParse(req.body);
  if (!resultado.success) return next(resultado.error);
  req.body = resultado.data;
  next();
}

module.exports = { validateCreate };