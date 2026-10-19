// Arquivo: backend/src/modules/notifications/notification.service.js
const repository = require('./notification.repository');
const regras = require('./regras');
const email = require('./providers/email.provider');
const whatsapp = require('./providers/whatsapp.provider');
const { env } = require('../../shared/config/env');
const { calculateRecoveryDay } = require('../../shared/utils/calculateRecoveryDay');

const escaparHtml = (texto) => String(texto).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

/**
 * Alerta por e-mail para o profissional quando o check-in pede atenção.
 * Chamado depois que o check-in foi salvo — falha aqui nunca afeta o paciente.
 * O e-mail leva o mínimo: nome abreviado, dor e dia. O resto fica atrás do login.
 */
async function alertarDor({ tratamentoId, checkinId, diaRecuperacao, nivelDor, nivelAnterior }) {
  const motivo = regras.motivoAlertaDor(nivelDor, nivelAnterior);
  if (!motivo) return null;

  const dados = await repository.dadosParaAlerta(tratamentoId);
  const profissional = dados?.paciente.profissional;
  if (!profissional?.ativo || !profissional.alertasEmail) return null;

  const reserva = await repository.reservar({ tipo: 'alerta_dor', canal: 'email', referencia: `alerta_dor:${checkinId}`, tratamentoId });
  if (!reserva) return null;

  const paciente = regras.nomeAbreviado(dados.paciente.nome);
  const oQue = motivo === 'dor_alta'
    ? `informou dor ${nivelDor} de 10`
    : `informou piora da dor: de ${nivelAnterior} para ${nivelDor} de 10`;
  const link = `${env.FRONTEND_URL}/patients/${dados.paciente.id}`;

  const texto = [
    `${paciente} ${oQue} no Dia ${diaRecuperacao} (${dados.nomeProcedimento}).`,
    '',
    'Abra o perfil do paciente para ver o check-in completo:',
    link,
    '',
    'Você recebe este aviso porque os alertas por e-mail estão ligados em Configurações.',
  ].join('\n');

  const html = `<p style="font:16px/1.5 system-ui,sans-serif;color:#0A0A0A"><strong>${escaparHtml(paciente)}</strong> ${oQue} no Dia ${diaRecuperacao} (${escaparHtml(dados.nomeProcedimento)}).</p>
<p style="font:16px/1.5 system-ui,sans-serif"><a href="${link}" style="color:#0A0A0A">Abrir o perfil do paciente</a></p>
<p style="font:13px/1.5 system-ui,sans-serif;color:#525252">Você recebe este aviso porque os alertas por e-mail estão ligados em Configurações.</p>`;

  const resultado = await email.enviar({
    para: profissional.email,
    // Assunto sem dado de saúde: aparece na notificação do celular e na lista da caixa de entrada
    assunto: 'Um paciente precisa de atenção',
    texto,
    html,
  });
  await repository.concluir(reserva.id, resultado);
  return resultado;
}

/**
 * Lembrete diário pelo WhatsApp para quem ainda não fez o check-in de hoje.
 * Só para pacientes que aceitaram receber lembretes no termo de consentimento.
 */
async function enviarLembretesPendentes(agora = new Date()) {
  const candidatos = await repository.candidatosLembrete();
  const resumo = { enviados: 0, simulados: 0, falhas: 0 };

  for (const t of candidatos) {
    const diaAtual = calculateRecoveryDay(t.dataProcedimento);
    if (diaAtual > t.versaoProtocolo.totalDias) continue;
    if (t.checkins[0]?.diaRecuperacao === diaAtual) continue;
    if (!t.consentimentos[0]?.aceitaLembretes) continue;
    if (!regras.dentroDaJanelaDeLembrete(t.paciente.profissional.horaLembrete, agora)) continue;

    const reserva = await repository.reservar({
      tipo: 'lembrete_checkin', canal: 'whatsapp',
      referencia: `lembrete:${t.id}:${regras.dataLocal(agora)}`, tratamentoId: t.id,
    });
    if (!reserva) continue;

    const primeiroNome = t.paciente.nome.split(' ')[0];
    const link = `${env.FRONTEND_URL}/p/${t.tokenPaciente}`;
    const resultado = await whatsapp.enviarModelo({ telefone: t.paciente.telefone, parametros: [primeiroNome, String(diaAtual), link] });
    await repository.concluir(reserva.id, resultado);

    if (resultado.status === 'enviada') resumo.enviados += 1;
    else if (resultado.status === 'simulada') resumo.simulados += 1;
    else resumo.falhas += 1;
  }
  return resumo;
}

module.exports = { alertarDor, enviarLembretesPendentes };
