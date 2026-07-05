/**
 * Formata uma data para o padrão brasileiro (DD/MM/AAAA).
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateBR(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(date));
}

/**
 * Formata uma data e hora para o padrão brasileiro (DD/MM/AAAA HH:mm).
 * @param {Date|string} date
 * @returns {string}
 */
function formatDateTimeBR(date) {
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'America/Sao_Paulo',
  }).format(new Date(date));
}

/**
 * Retorna a data atual normalizada para meia-noite (sem hora).
 * Usado em comparações de datas de recuperação.
 * @returns {Date}
 */
function getTodayDate() {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

module.exports = { formatDateBR, formatDateTimeBR, getTodayDate };