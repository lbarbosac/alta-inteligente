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

// Com fotos o check-in chega em multipart/form-data: todo campo vem como texto.
// `respostas` vem como JSON em texto e `nivelDor` como "7".
function lerJson(valor) {
  if (typeof valor !== 'string') return valor;
  try { return JSON.parse(valor); } catch { return valor; }
}

// ─── Schema principal ──────────────────────────────────────────────────────

/**
 * createSchema — campos obrigatórios para envio do check-in diário.
 *
 * Notas:
 *  - `token`: o tokenPaciente do link seguro. É ele que identifica o
 *    tratamento — o id do tratamento nunca é aceito do cliente.
 *  - `diaRecuperacao` e `enviadoEm`: definidos pelo servidor — nunca pelo cliente.
 *  - `nivelDor`: obrigatório no banco (TinyInt). Escala 1–10 conforme
 *    doc 02-regras-negocio.md seção 15.
 *  - `observacoes`: campo livre e opcional.
 *  - `respostas`: array opcional — o paciente pode enviar sem marcar tarefas.
 *  - fotos: chegam em req.files (multer), até 3, validadas no service.
 */
const createSchema = z.object({
  token: z
    .string()
    .regex(/^[a-f0-9]{64}$/, 'Link inválido.'),

  nivelDor: z.coerce
    .number()
    .int()
    .min(1,  'Nível de dor mínimo é 1.')
    .max(10, 'Nível de dor máximo é 10.'),

  observacoes: z
    .string()
    .max(2000, 'Observações podem ter até 2000 caracteres.')
    .transform((texto) => texto.trim() || null)
    .optional()
    .nullable(),

  respostas: z.preprocess(
    lerJson,
    z.array(respostaSchema).optional().default([])
  ),
});

// ─── Middleware ────────────────────────────────────────────────────────────

function validateCreate(req, res, next) {
  const resultado = createSchema.safeParse(req.body);
  if (!resultado.success) return next(resultado.error);
  req.body = resultado.data;
  next();
}

module.exports = { validateCreate };
