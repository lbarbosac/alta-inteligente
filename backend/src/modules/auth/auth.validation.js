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

const esqueciSenhaSchema = z.object({
  email:  z.string().min(1, 'E-mail é obrigatório.').email('Informe um e-mail válido.'),
  perfil: z.enum(['ADMIN', 'PROFESSIONAL'], { message: "Perfil inválido. Use 'ADMIN' ou 'PROFESSIONAL'." }),
});

// bcrypt só considera os primeiros 72 bytes da senha
const redefinirSenhaSchema = z.object({
  token: z.string().regex(/^[a-f0-9]{64}$/, 'Link inválido.'),
  senha: z.string().min(8, 'A senha deve ter ao menos 8 caracteres.').max(72, 'A senha pode ter no máximo 72 caracteres.'),
});

function validarCom(schema) {
  return (req, res, next) => {
    const resultado = schema.safeParse(req.body);
    if (!resultado.success) return next(resultado.error);
    req.body = resultado.data;
    next();
  };
}

module.exports = {
  validateLogin,
  validateEsqueciSenha:   validarCom(esqueciSenhaSchema),
  validateRedefinirSenha: validarCom(redefinirSenhaSchema),
};