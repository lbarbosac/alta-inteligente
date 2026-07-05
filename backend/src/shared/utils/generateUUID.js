const { randomUUID } = require('crypto');

/**
 * Gera um UUID v4 usando o módulo nativo do Node.js.
 * Usado como chave primária de todas as entidades.
 * @returns {string} UUID no formato xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
 */
function generateUUID() {
  return randomUUID();
}

module.exports = { generateUUID };