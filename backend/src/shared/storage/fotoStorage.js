// Arquivo: backend/src/shared/storage/fotoStorage.js
// Onde as fotos dos check-ins ficam guardadas. O resto do sistema só conhece a "chave" do arquivo
// (ex.: fotos/<tratamentoId>/<uuid>.jpg), então dá para trocar o lugar sem mexer em mais nada.
//
// - No computador: pasta do servidor (STORAGE_DIR).
// - No site publicado (Vercel): o disco é apagado a cada execução, então as fotos vão para o
//   Vercel Blob, num armazenamento PRIVADO. Ninguém abre a foto direto: ela continua passando
//   pelo link assinado da API (photo.service.urlAssinada), que confere quem pediu.
const fs = require('fs/promises');
const path = require('path');
const { randomUUID } = require('crypto');
const { env } = require('../config/env');

const NO_BLOB = !!process.env.BLOB_READ_WRITE_TOKEN;
const CHAVE_VALIDA = /^fotos\/[\w-]+\/[\w-]+\.jpg$/;

// Impede que uma chave adulterada ("../../.env") aponte para fora da pasta de fotos
function caminhoAbsoluto(chave) {
  const raiz = env.STORAGE_DIR;
  const absoluto = path.resolve(raiz, chave);
  if (!absoluto.startsWith(raiz + path.sep)) throw new Error('Caminho de arquivo inválido.');
  return absoluto;
}

function conferirChave(chave) {
  if (!CHAVE_VALIDA.test(chave)) throw new Error('Caminho de arquivo inválido.');
  return chave;
}

async function salvar(pasta, buffer) {
  const chave = path.posix.join('fotos', pasta, `${randomUUID()}.jpg`);
  if (NO_BLOB) {
    const { put } = require('@vercel/blob');
    await put(conferirChave(chave), buffer, {
      access: 'private',
      addRandomSuffix: false,
      contentType: 'image/jpeg',
    });
    return chave;
  }
  const absoluto = caminhoAbsoluto(chave);
  await fs.mkdir(path.dirname(absoluto), { recursive: true });
  await fs.writeFile(absoluto, buffer, { flag: 'wx' });
  return chave;
}

async function ler(chave) {
  if (NO_BLOB) {
    const { get } = require('@vercel/blob');
    const arquivo = await get(conferirChave(chave), { access: 'private' });
    if (!arquivo || arquivo.statusCode !== 200) throw new Error('Foto não encontrada.');
    return Buffer.from(await new Response(arquivo.stream).arrayBuffer());
  }
  return fs.readFile(caminhoAbsoluto(chave));
}

async function remover(chave) {
  if (NO_BLOB) {
    const { del } = require('@vercel/blob');
    await del(conferirChave(chave));
    return;
  }
  await fs.rm(caminhoAbsoluto(chave), { force: true });
}

module.exports = { salvar, ler, remover, caminhoAbsoluto };
