const { prisma } = require('../config/prismaClient');

// Espera o banco subir em vez de derrubar o servidor: ligar o MySQL depois do `npm run dev`
// (ou o banco demorar para subir junto com a máquina) passou a ser caso normal, não erro fatal.
const TENTATIVAS = 60;
const ESPERA_MS = 3000; // 60 × 3s = 3 minutos esperando

const DICA = 'Ligue o MySQL (serviço MySQL80, no Windows). O servidor conecta sozinho quando ele subir.';

/**
 * Conecta ao banco na inicialização, tentando de novo enquanto ele não responde.
 * Só encerra o processo se o banco não aparecer dentro do tempo limite — assim o
 * `npm run dev` não morre quando o MySQL ainda não está ligado.
 */
async function connectDatabase({ tentativas = TENTATIVAS, esperaMs = ESPERA_MS } = {}) {
  for (let tentativa = 1; ; tentativa++) {
    try {
      await prisma.$connect();
      console.log('✅ Banco de dados conectado com sucesso.');
      return;
    } catch (error) {
      const motivo = String(error.message).split('\n')[0];

      if (tentativa >= tentativas) {
        console.error(`❌ Sem conexão com o banco depois de ${tentativas} tentativas: ${motivo}`);
        console.error(`   ${DICA}`);
        process.exit(1);
      }

      // A cada 15 segundos, para não encher o terminal
      if (tentativa === 1 || tentativa % 5 === 0) {
        console.error(`⏳ Esperando o banco de dados (${tentativa}/${tentativas}): ${motivo}`);
        console.error(`   ${DICA}`);
      }

      await new Promise((resolve) => setTimeout(resolve, esperaMs));
    }
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
