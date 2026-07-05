const { prisma } = require('../config/prismaClient');

/**
 * Testa a conexão com o banco de dados.
 * Chamado na inicialização do servidor para garantir que o banco
 * está acessível antes de aceitar requisições.
 *
 * Em caso de falha, loga o erro e encerra o processo para que
 * o servidor não suba em estado inválido.
 */
async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('✅ Banco de dados conectado com sucesso.');
  } catch (error) {
    console.error('❌ Falha ao conectar ao banco de dados:', error.message);
    process.exit(1);
  }
}

/**
 * Encerra a conexão com o banco de dados de forma graciosa.
 * Chamado nos handlers de SIGINT e SIGTERM.
 */
async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('🔌 Conexão com o banco encerrada.');
}

module.exports = { connectDatabase, disconnectDatabase };