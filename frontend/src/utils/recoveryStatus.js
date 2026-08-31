// Arquivo: frontend/src/utils/recoveryStatus.js
export function calculateRecoveryDay(dataProcedimento) {
  if (!dataProcedimento) return 1;
  const agora = new Date();
  const dataProc = new Date(dataProcedimento);
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const procedimento = new Date(dataProc.getUTCFullYear(), dataProc.getUTCMonth(), dataProc.getUTCDate());
  const diffDias = Math.floor((hoje - procedimento) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDias + 1);
}
export function calculatePatientStatus(ultimoCheckin) {
  if (!ultimoCheckin) return 'sem_checkin';
  const { nivelDor, enviadoEm } = ultimoCheckin;
  const horas = (Date.now() - new Date(enviadoEm).getTime()) / (1000 * 60 * 60);
  if (horas > 48) return 'atencao';
  if (nivelDor >= 9) return 'critico';
  if (nivelDor >= 7) return 'atencao';
  if (nivelDor >= 4) return 'estabilizacao';
  return 'recuperacao';
}