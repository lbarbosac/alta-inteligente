// Arquivo: backend/src/modules/notifications/providers/email.provider.js
// Envio de e-mail por SMTP (qualquer provedor: Gmail Workspace, Zoho, Brevo, Resend, SES…).
// Sem SMTP_HOST configurado, o envio é simulado: em desenvolvimento a mensagem aparece no log.
const nodemailer = require('nodemailer');
const { env } = require('../../../shared/config/env');

let transporte = null;

function configurado() {
  return Boolean(env.SMTP_HOST);
}

function obterTransporte() {
  if (!transporte) {
    transporte = nodemailer.createTransport({
      host:   env.SMTP_HOST,
      port:   env.SMTP_PORT,
      secure: env.SMTP_PORT === 465,
      auth:   env.SMTP_USER ? { user: env.SMTP_USER, pass: env.SMTP_PASS } : undefined,
    });
  }
  return transporte;
}

async function enviar({ para, assunto, texto, html }) {
  if (!configurado()) {
    // Em produção o texto não vai para o log: ele tem dados de saúde
    if (env.NODE_ENV !== 'production') console.log(`\n[e-mail simulado] para: ${para}\nassunto: ${assunto}\n${texto}\n`);
    else console.log(`[e-mail simulado] assunto: ${assunto} (configure SMTP_HOST para enviar de verdade)`);
    return { status: 'simulada' };
  }

  try {
    await obterTransporte().sendMail({ from: env.SMTP_FROM, to: para, subject: assunto, text: texto, html });
    return { status: 'enviada' };
  } catch (err) {
    return { status: 'falhou', erro: `SMTP: ${err.message}`.slice(0, 500) };
  }
}

module.exports = { enviar, configurado };
