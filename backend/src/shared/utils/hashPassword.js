const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Gera o hash bcrypt de uma senha em texto puro.
 * Centraliza o salt rounds em um único lugar.
 *
 * @param {string} senha - Senha em texto puro
 * @returns {Promise<string>} Hash bcrypt
 */
async function hashPassword(senha) {
  return bcrypt.hash(senha, SALT_ROUNDS);
}

/**
 * Compara uma senha em texto puro com um hash bcrypt.
 *
 * @param {string} senha  - Senha em texto puro
 * @param {string} hash   - Hash armazenado no banco
 * @returns {Promise<boolean>}
 */
async function comparePassword(senha, hash) {
  return bcrypt.compare(senha, hash);
}

module.exports = { hashPassword, comparePassword };