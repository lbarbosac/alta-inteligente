const { z } = require('zod');

// ─── Schemas ───────────────────────────────────────────────────────────────

const createSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.'),

  email: z
    .string()
    .email('Informe um e-mail válido.'),

  senha: z
    .string()
    .min(6, 'A senha deve ter ao menos 6 caracteres.'),

  telefone: z
    .string()
    .min(8, 'Telefone inválido.'),

  especialidade: z
    .string()
    .min(2, 'Especialidade deve ter ao menos 2 caracteres.'),
});

const updateSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.')
    .optional(),

  email: z
    .string()
    .email('Informe um e-mail válido.')
    .optional(),

  telefone: z
    .string()
    .min(8, 'Telefone inválido.')
    .optional(),

  especialidade: z
    .string()
    .min(2, 'Especialidade deve ter ao menos 2 caracteres.')
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

module.exports = { validateCreate, validateUpdate };