const { z } = require('zod');

const tokenSchema = z.string().regex(/^[a-f0-9]{64}$/, 'Link inválido.');

const consentimentoSchema = z.object({
  aceitaLembretes: z.boolean({ message: 'Informe se aceita receber lembretes.' }),
});

function validateConsentimento(req, res, next) {
  const token = tokenSchema.safeParse(req.params.token);
  if (!token.success) return next(token.error);
  const resultado = consentimentoSchema.safeParse(req.body);
  if (!resultado.success) return next(resultado.error);
  req.body = resultado.data;
  next();
}

module.exports = { validateConsentimento };
