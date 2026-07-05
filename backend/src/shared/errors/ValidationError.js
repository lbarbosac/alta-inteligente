const { AppError } = require('../utils/AppError');

class ValidationError extends AppError {
  constructor(message = 'Dados inválidos. Verifique as informações enviadas.') {
    super(message, 422);
  }
}

module.exports = { ValidationError };