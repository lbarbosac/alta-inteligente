const { z } = require('zod');

// ─── Sub-schemas ───────────────────────────────────────────────────────────

const tarefaSchema = z.object({
  descricao: z
    .string()
    .min(1, 'Descrição da tarefa é obrigatória.'),

  numeroOrdem: z
    .number()
    .int()
    .positive('Número de ordem deve ser um inteiro positivo.'),
});

const diaSchema = z.object({
  numeroDia: z
    .number()
    .int()
    .positive('Número do dia deve ser um inteiro positivo.'),

  titulo: z
    .string()
    .optional()
    .nullable(),

  tarefas: z
    .array(tarefaSchema)
    .optional()
    .default([]),
});

// ─── Schemas principais ────────────────────────────────────────────────────

/**
 * createSchema: aceita criação aninhada completa (protocolo + dias + tarefas)
 * ou apenas o protocolo base sem dias (que serão adicionados posteriormente).
 *
 * diasPadrao: obrigatório no schema do banco. Define o total de dias esperado.
 *
 * O profissionalId NÃO está aqui — vem de req.usuario.id no controller.
 */
const createSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.'),

  descricao: z
    .string()
    .optional()
    .nullable(),

  diasPadrao: z
    .number()
    .int()
    .positive('Quantidade de dias deve ser um número inteiro positivo.'),

  dias: z
    .array(diaSchema)
    .optional()
    .default([]),
});

/**
 * updateSchema: apenas metadados do protocolo.
 * Alterações estruturais (dias/tarefas) geram nova versão — tratado
 * em PUT /:id/editar (validateEditar).
 */
const updateSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.')
    .optional(),

  descricao: z
    .string()
    .optional()
    .nullable(),

  diasPadrao: z
    .number()
    .int()
    .positive('Quantidade de dias deve ser um número inteiro positivo.')
    .optional(),
});

// ─── Middlewares ───────────────────────────────────────────────────────────

function validateCreate(req, res, next) {
  const resultado = createSchema.safeParse(req.body);
  if (!resultado.success) return next(resultado.error);
  req.body = resultado.data;
  next();
}

function validateUpdate(req, res, next) {
  const resultado = updateSchema.safeParse(req.body);
  if (!resultado.success) return next(resultado.error);
  req.body = resultado.data;
  next();
}

/**
 * PUT /:id/editar recebe o protocolo inteiro (metadados + dias + tarefas),
 * o mesmo formato da criação.
 */
function validateEditar(req, res, next) {
  const resultado = createSchema.safeParse(req.body);
  if (!resultado.success) return next(resultado.error);
  req.body = resultado.data;
  next();
}

module.exports = { validateCreate, validateUpdate, validateEditar };