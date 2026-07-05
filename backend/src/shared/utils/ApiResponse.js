class ApiResponse {
  /**
   * Resposta de sucesso genérica (200)
   */
  static success(res, data = null, message = 'Operação realizada com sucesso.', statusCode = 200) {
    return res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  }

  /**
   * Resposta de criação (201)
   */
  static created(res, data = null, message = 'Criado com sucesso.') {
    return ApiResponse.success(res, data, message, 201);
  }

  /**
   * Resposta sem conteúdo (204) — usado em deleções lógicas
   */
  static noContent(res) {
    return res.status(204).send();
  }
}

module.exports = { ApiResponse };