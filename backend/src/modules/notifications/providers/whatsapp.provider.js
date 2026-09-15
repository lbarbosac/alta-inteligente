// Arquivo: backend/src/modules/notifications/providers/whatsapp.provider.js
// WhatsApp Cloud API (API oficial da Meta). Mensagem que a empresa inicia precisa usar um
// modelo aprovado pela Meta — o nome vem de WHATSAPP_TEMPLATE_LEMBRETE.
// Sem WHATSAPP_TOKEN, o envio é simulado e aparece no log.
const { env } = require('../../../shared/config/env');
const { telefoneWhatsApp } = require('../regras');

function configurado() {
  return Boolean(env.WHATSAPP_TOKEN && env.WHATSAPP_PHONE_NUMBER_ID);
}

async function enviarModelo({ telefone, parametros }) {
  const para = telefoneWhatsApp(telefone);
  if (!para) return { status: 'falhou', erro: 'Telefone do paciente não serve para WhatsApp (precisa de DDD + número).' };

  if (!configurado()) {
    if (env.NODE_ENV !== 'production') console.log(`\n[whatsapp simulado] para: ${para}\nmodelo: ${env.WHATSAPP_TEMPLATE_LEMBRETE} ${JSON.stringify(parametros)}\n`);
    return { status: 'simulada' };
  }

  try {
    const resposta = await fetch(`https://graph.facebook.com/${env.WHATSAPP_API_VERSION}/${env.WHATSAPP_PHONE_NUMBER_ID}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.WHATSAPP_TOKEN}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: para,
        type: 'template',
        template: {
          name: env.WHATSAPP_TEMPLATE_LEMBRETE,
          language: { code: env.WHATSAPP_TEMPLATE_IDIOMA },
          components: [{ type: 'body', parameters: parametros.map((text) => ({ type: 'text', text })) }],
        },
      }),
      signal: AbortSignal.timeout(10_000),
    });
    if (!resposta.ok) {
      return { status: 'falhou', erro: `WhatsApp ${resposta.status}: ${(await resposta.text()).slice(0, 400)}` };
    }
    return { status: 'enviada' };
  } catch (err) {
    return { status: 'falhou', erro: `WhatsApp: ${err.message}`.slice(0, 500) };
  }
}

module.exports = { enviarModelo, configurado };
