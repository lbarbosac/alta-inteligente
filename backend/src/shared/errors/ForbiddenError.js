const { AppError } = require('../utils/AppError');

class ForbiddenError extends AppError {
  constructor(message = 'Acesso negado. Você não tem permissão para esta ação.') {
    super(message, 403);
  }
}

module.exports = { ForbiddenError };