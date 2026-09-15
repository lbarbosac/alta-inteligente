// Arquivo: backend/src/modules/notifications/regras.js
// Regras das mensagens automáticas. Funções puras, sem banco — testadas em regras.test.js.

/**
 * Alerta de dor para o profissional: dor 7 ou mais, ou piora de 2 pontos sobre o check-in anterior.
 * A piora pega o caso que o número fixo não pega: dor que tinha caído e volta a subir.
 */
function motivoAlertaDor(nivelDor, nivelAnterior) {
  if (nivelDor >= 7) return 'dor_alta';
  if (nivelAnterior !== null && nivelAnterior !== undefined && nivelDor - nivelAnterior >= 2) return 'piora';
  return null;
}

// Janela do lembrete: do horário escolhido pelo profissional até 21h. Nada de mensagem de madrugada.
const HORA_LIMITE_LEMBRETE = 21;

function horaMinuto(data) {
  return `${String(data.getHours()).padStart(2, '0')}:${String(data.getMinutes()).padStart(2, '0')}`;
}

function dentroDaJanelaDeLembrete(horaLembrete, agora) {
  return horaMinuto(agora) >= horaLembrete && agora.getHours() < HORA_LIMITE_LEMBRETE;
}

/** Data local (fuso do Node, fixado em São Paulo) no formato AAAA-MM-DD — usada na chave do lembrete do dia. */
function dataLocal(agora) {
  return `${agora.getFullYear()}-${String(agora.getMonth() + 1).padStart(2, '0')}-${String(agora.getDate()).padStart(2, '0')}`;
}

/** Telefone brasileiro para o formato do WhatsApp (55 + DDD + número). Devolve null se não der para montar. */
function telefoneWhatsApp(telefone) {
  const digitos = String(telefone ?? '').replace(/\D/g, '');
  if (digitos.length === 10 || digitos.length === 11) return `55${digitos}`;
  if ((digitos.length === 12 || digitos.length === 13) && digitos.startsWith('55')) return digitos;
  return null;
}

/** "Ana Beatriz Souza" → "Ana S." — o e-mail de alerta não precisa do nome completo. */
function nomeAbreviado(nome) {
  const partes = String(nome ?? '').trim().split(/\s+/).filter(Boolean);
  if (partes.length <= 1) return partes[0] ?? 'Paciente';
  return `${partes[0]} ${partes[partes.length - 1][0]}.`;
}

module.exports = {
  motivoAlertaDor,
  dentroDaJanelaDeLembrete,
  dataLocal,
  telefoneWhatsApp,
  nomeAbreviado,
  HORA_LIMITE_LEMBRETE,
};
