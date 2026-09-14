// Arquivo: backend/src/shared/utils/calculateRecoveryDay.js
// FIX: Prisma @db.Date retorna meia-noite UTC. No Brasil (UTC-3) getDate() pega o dia anterior.
// Solução: extrair partes via getUTC* no procedimento.
// O "hoje" usa o fuso local do Node, que é fixado em America/Sao_Paulo no shared/config/env.js.
function calculateRecoveryDay(dataProcedimento) {
  if (!dataProcedimento) return 1;
  const agora = new Date();
  const dataProc = new Date(dataProcedimento);
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const procedimento = new Date(dataProc.getUTCFullYear(), dataProc.getUTCMonth(), dataProc.getUTCDate());
  const diffDias = Math.floor((hoje - procedimento) / (1000 * 60 * 60 * 24));
  return Math.max(1, diffDias + 1);
}
module.exports = { calculateRecoveryDay };