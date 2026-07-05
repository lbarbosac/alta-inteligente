const { randomBytes } = require('crypto');

/**
 * Gera um token seguro de 64 caracteres hexadecimais.
 * Usado para tokenPaciente (link seguro) e tokenSessao.
 * Correspondente ao CHAR(64) definido no schema.
 * @returns {string} string hex de 64 caracteres
 */
function generateSecureToken() {
  return randomBytes(32).toString('hex'); // 32 bytes = 64 chars hex
}

module.exports = { generateSecureToken };