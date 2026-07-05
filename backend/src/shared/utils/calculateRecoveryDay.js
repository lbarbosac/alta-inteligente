/**
 * Calcula o dia atual da recuperação do paciente.
 *
 * Regra (doc 05-banco-de-dados.md, seção 29):
 *   Dia 1 = data do procedimento
 *   Dia 2 = data do procedimento + 1 dia
 *   ... e assim por diante.
 *
 * A comparação é feita apenas por data (sem hora),
 * usando o horário local do servidor para evitar
 * inconsistências de fuso horário.
 *
 * @param {Date|string} dataProcedimento - Data do procedimento cirúrgico
 * @returns {number} Dia atual da recuperação (mínimo 1)
 */
function calculateRecoveryDay(dataProcedimento) {
  const agora = new Date();
  const dataProc = new Date(dataProcedimento);

  // Normaliza ambas as datas para meia-noite (sem componente de hora)
  const hoje = new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
  const procedimento = new Date(dataProc.getFullYear(), dataProc.getMonth(), dataProc.getDate());

  const diffMs = hoje - procedimento;
  const diffDias = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  // Dia 1 é o próprio dia do procedimento
  return Math.max(1, diffDias + 1);
}

module.exports = { calculateRecoveryDay };