/**
 * IMPORTANTE: Estado clínico ≠ status administrativo do tratamento.
 *
 * - treatments.status (enum): 'ativo' | 'finalizado' | 'cancelado' — persistido no banco.
 * - Estado clínico: calculado em tempo real a partir do último check-in — NÃO persistido.
 *
 * Tabela de classificação (doc 02-regras-negocio.md, seção 15 e 16):
 * ┌──────────────────┬─────────────────────────────────────────┐
 * │ Estado           │ Critério                                │
 * ├──────────────────┼─────────────────────────────────────────┤
 * │ 'recuperacao'    │ dor 1–3 e check-in em dia               │
 * │ 'estabilizacao'  │ dor 4–6                                 │
 * │ 'atencao'        │ dor 7–8 OU sem check-in há > 48h        │
 * │ 'critico'        │ dor 9–10                                │
 * │ 'sem_checkin'    │ nunca realizou check-in                 │
 * └──────────────────┴─────────────────────────────────────────┘
 */

/**
 * @param {object|null} ultimoCheckin - Último registro de checkin do paciente
 * @param {number}      ultimoCheckin.nivelDor  - Nível de dor (1–10)
 * @param {Date|string} ultimoCheckin.enviadoEm - Data/hora do envio
 * @returns {'recuperacao'|'estabilizacao'|'atencao'|'critico'|'sem_checkin'}
 */
function calculatePatientStatus(ultimoCheckin) {
  if (!ultimoCheckin) return 'sem_checkin';

  const { nivelDor, enviadoEm } = ultimoCheckin;

  // Verifica ausência de check-in por mais de 48 horas
  const horasSemCheckin = (Date.now() - new Date(enviadoEm).getTime()) / (1000 * 60 * 60);
  if (horasSemCheckin > 48) return 'atencao';

  // Classifica pelo nível de dor
  if (nivelDor >= 9) return 'critico';
  if (nivelDor >= 7) return 'atencao';
  if (nivelDor >= 4) return 'estabilizacao';
  return 'recuperacao';
}

/**
 * Retorna true se o paciente está em estado que exige atenção imediata.
 * Usado para filtrar a lista de alertas no Dashboard.
 *
 * @param {object|null} ultimoCheckin
 * @returns {boolean}
 */
function isPatientInAlert(ultimoCheckin) {
  const status = calculatePatientStatus(ultimoCheckin);
  return status === 'critico' || status === 'atencao' || status === 'sem_checkin';
}

module.exports = { calculatePatientStatus, isPatientInAlert };