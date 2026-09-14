require('dotenv').config();

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
};

// Valida variáveis obrigatórias na inicialização
const required = ['DATABASE_URL', 'JWT_SECRET'];
for (const key of required) {
  if (!process.env[key]) {
    throw new Error(`❌ Variável de ambiente obrigatória não definida: ${key}`);
  }
}

module.exports = { env };