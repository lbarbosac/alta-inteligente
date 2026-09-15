// Arquivo: backend/src/shared/storage/fotoStorage.js
// Guarda as fotos no disco do servidor. Para trocar por um bucket (S3, R2…) no futuro,
// basta reimplementar estas três funções — o resto do sistema só conhece a "chave" do arquivo.
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { env } = require('../config/env');

// Impede que uma chave adulterada ("../../.env") aponte para fora da pasta de fotos
function caminhoAbsoluto(chave) {
  const raiz = env.STORAGE_DIR;
  const absoluto = path.resolve(raiz, chave);
  if (!absoluto.startsWith(raiz + path.sep)) throw new Error('Caminho de arquivo inválido.');
  return absoluto;
}

async function salvar(pasta, buffer) {
  const chave = path.posix.join('fotos', pasta, `${randomUUID()}.jpg`);
  const absoluto = caminhoAbsoluto(chave);
  await fs.mkdir(path.dirname(absoluto), { recursive: true });
  await fs.writeFile(absoluto, buffer, { flag: 'wx' });
  return chave;
}

async function ler(chave) {
  return fs.readFile(caminhoAbsoluto(chave));
}

async function remover(chave) {
  await fs.rm(caminhoAbsoluto(chave), { force: true });
}

module.exports = { salvar, ler, remover, caminhoAbsoluto };
