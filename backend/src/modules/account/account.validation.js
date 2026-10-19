const { z } = require('zod');

// Lembrete entre 06:00 e 20:00, de 30 em 30 minutos. A janela de envio vai até 21h (ver notifications/regras.js).
const preferenciasSchema = z.object({
  horaLembrete: z
    .string()
    .regex(/^(0[6-9]|1\d|20):(00|30)$/, 'Escolha um horário entre 06:00 e 20:00.')
    .optional(),
  alertasEmail: z.boolean().optional(),
});

const termosSchema = z.object({
  versao: z.string().min(1, 'Versão dos termos obrigatória.'),
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
  validatePreferencias: validarCom(preferenciasSchema),
  validateTermos: validarCom(termosSchema),
};
