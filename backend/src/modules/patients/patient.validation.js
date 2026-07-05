const { z } = require('zod');

// ─── Schemas ───────────────────────────────────────────────────────────────

/**
 * z.coerce.date() converte automaticamente a string ISO recebida no body
 * para um objeto Date, compatível com o campo DateTime @db.Date do Prisma.
 * Exemplo de valor aceito: "1995-08-20" ou "1995-08-20T00:00:00.000Z"
 */
const createSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.'),

  dataNascimento: z.coerce
    .date({ message: 'Data de nascimento inválida. Use o formato AAAA-MM-DD.' }),

  telefone: z
    .string()
    .min(8, 'Telefone inválido.'),

  email: z
    .string()
    .email('Informe um e-mail válido.')
    .optional()
    .nullable(),

  observacoes: z
    .string()
    .optional()
    .nullable(),
});

const updateSchema = z.object({
  nome: z
    .string()
    .min(2, 'Nome deve ter ao menos 2 caracteres.')
    .optional(),

  dataNascimento: z.coerce
    .date({ message: 'Data de nascimento inválida. Use o formato AAAA-MM-DD.' })
    .optional(),

  telefone: z
    .string()
    .min(8, 'Telefone inválido.')
    .optional(),

  email: z
    .string()
    .email('Informe um e-mail válido.')
    .optional()
    .nullable(),

  observacoes: z
    .string()
    .optional()
    .nullable(),
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