const { AppError } = require('../utils/AppError');

class UnauthorizedError extends AppError {
  constructor(message = 'Não autorizado. Faça login para continuar.') {
    super(message, 401);
  }
}

module.exports = { UnauthorizedError };