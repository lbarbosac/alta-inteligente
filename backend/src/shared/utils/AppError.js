class AppError extends Error {
  /**
   * @param {string} message  - Mensagem amigável para o cliente
   * @param {number} statusCode - Código HTTP (padrão: 400)
   */
  constructor(message, statusCode = 400) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // diferencia erros esperados de bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = { AppError };