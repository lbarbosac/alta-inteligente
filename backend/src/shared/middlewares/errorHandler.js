const { AppError } = require('../utils/AppError');

/**
 * Middleware global de erros — deve ser registrado por último no server.js.
 * Trata erros operacionais (AppError), erros do Zod, erros do JWT
 * e erros inesperados, sempre retornando uma mensagem amigável.
 *
 * Express 5: erros lançados em async functions chegam aqui automaticamente.
 */
function errorHandler(err, req, res, next) {
  // Erros operacionais conhecidos (NotFoundError, UnauthorizedError, etc.)
  if (err instanceof AppError && err.isOperational) {
    return res.status(err.statusCode).json({
      success: false,
      message: err.message,
    });
  }

  // Erros do upload de fotos (multer)
  if (err?.name === 'MulterError') {
    const mensagens = {
      LIMIT_FILE_SIZE:       'Cada foto pode ter no máximo 10 MB.',
      LIMIT_FILE_COUNT:      'Envie no máximo 3 fotos por check-in.',
      LIMIT_UNEXPECTED_FILE: 'Envie no máximo 3 fotos por check-in.',
    };
    return res.status(422).json({
      success: false,
      message: mensagens[err.code] ?? 'Não foi possível receber as fotos. Tente novamente.',
    });
  }

  // Erros de validação do Zod v4
  if (err?.name === 'ZodError' || err?.issues) {
    return res.status(422).json({
      success: false,
      message: 'Dados inválidos. Verifique as informações enviadas.',
      errors: err.issues || err.errors,
    });
  }

  // Erros do JWT
  if (err?.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Token inválido.',
    });
  }

  if (err?.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Sessão expirada. Faça login novamente.',
    });
  }

  // Erros inesperados — loga no servidor, nunca expõe detalhes ao cliente
  console.error('[ERRO NÃO TRATADO]', {
    message: err?.message,
    stack: err?.stack,
    path: req?.path,
    method: req?.method,
  });

  return res.status(500).json({
    success: false,
    message: 'Erro interno do servidor. Tente novamente mais tarde.',
  });
}

module.exports = { errorHandler };