const { z } = require('zod');

/**
 * Schema Zod para o body do login.
 * Valida email, senha e perfil antes de chegar no controller.
 */
const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'E-mail é obrigatório.')
    .email('Informe um e-mail válido.'),

  senha: z
    .string()
    .min(1, 'Senha é obrigatória.'),

  perfil: z.enum(['ADMIN', 'PROFESSIONAL'], {
    message: "Perfil inválido. Use 'ADMIN' ou 'PROFESSIONAL'.",
  }),
});

/**
 * Middleware de validação do login.
 *
 * Se a validação falhar, passa o ZodError para o next()
 * e o errorHandler global trata com status 422.
 *
 * Se passar, substitui req.body pelos dados já tipados e saneados
 * pelo Zod antes de seguir para o controller.
 */
function validateLogin(req, res, next) {
  const resultado = loginSchema.safeParse(req.body);

  if (!resultado.success) {
    return next(resultado.error);
  }

  req.body = resultado.data;
  next();
}

module.exports = { validateLogin };