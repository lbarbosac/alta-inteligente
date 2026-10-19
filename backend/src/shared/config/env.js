require('dotenv').config();
const path = require('path');

// Fuso da clínica. "Hoje" (dia de recuperação, check-ins de hoje) usa o relógio local do Node,
// e servidor em nuvem costuma rodar em UTC — sem isso o dia vira às 21h no horário de Brasília.
process.env.TZ = process.env.TZ || 'America/Sao_Paulo';

const env = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  DATABASE_URL: process.env.DATABASE_URL,
  JWT_SECRET: process.env.JWT_SECRET,
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:5173',
  SESSION_EXPIRES_DAYS: parseInt(process.env.SESSION_EXPIRES_DAYS || '7'),
  // Atrás de proxy (Nginx, Render, Railway…), informe quantos saltos confiar para o IP real do cliente
  TRUST_PROXY: process.env.TRUST_PROXY,

  // Fotos dos check-ins. Pasta fora do código e fora do git.
  STORAGE_DIR: path.resolve(process.env.STORAGE_DIR || path.join(__dirname, '../../../storage')),

  // E-mail (alertas e recuperação de senha). Sem SMTP_HOST, o envio é simulado e aparece no log.
  SMTP_HOST: process.env.SMTP_HOST,
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '587'),
  SMTP_USER: process.env.SMTP_USER,
  SMTP_PASS: process.env.SMTP_PASS,
  SMTP_FROM: process.env.SMTP_FROM || 'AltaInteligente <nao-responda@localhost>',

  // WhatsApp Cloud API (Meta). Sem token, o lembrete é simulado e aparece no log.
  WHATSAPP_TOKEN: process.env.WHATSAPP_TOKEN,
  WHATSAPP_PHONE_NUMBER_ID: process.env.WHATSAPP_PHONE_NUMBER_ID,
  WHATSAPP_API_VERSION: process.env.WHATSAPP_API_VERSION || 'v21.0',
  WHATSAPP_TEMPLATE_LEMBRETE: process.env.WHATSAPP_TEMPLATE_LEMBRETE || 'lembrete_checkin',
  WHATSAPP_TEMPLATE_IDIOMA: process.env.WHATSAPP_TEMPLATE_IDIOMA || 'pt_BR',
  LEMBRETES_ATIVOS: process.env.LEMBRETES_ATIVOS !== 'false',
};

// Valida variáveis obrigatórias na inicialização
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${key}`);
  }
}

module.exports = { env };
