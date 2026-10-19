// Arquivo: backend/src/modules/photos/photo.service.js
const sharp = require('sharp');
const repository = require('./photo.repository');
const assinatura = require('./assinatura');
const storage = require('../../shared/storage/fotoStorage');
const { env } = require('../../shared/config/env');
const { NotFoundError }     = require('../../shared/errors/NotFoundError');
const { ForbiddenError }    = require('../../shared/errors/ForbiddenError');
const { ValidationError }   = require('../../shared/errors/ValidationError');

const chave = assinatura.derivarChave(env.JWT_SECRET);

/**
 * Regrava cada foto: gira conforme a orientação do celular, reduz para no máximo 1600px
 * e salva em JPEG. A regravação descarta os metadados — inclusive a localização GPS
 * que o celular grava dentro da foto, que é dado pessoal que o sistema não precisa ter.
 */
async function processar(buffer) {
  try {
    return await sharp(buffer, { failOn: 'error' })
      .rotate()
      .resize({ width: 1600, height: 1600, fit: 'inside', withoutEnlargement: true })
      .jpeg({ quality: 82, mozjpeg: true })
      .toBuffer();
  } catch {
    throw new ValidationError('Não conseguimos abrir uma das fotos. Envie a foto em JPG ou PNG.');
  }
}

/**
 * Processa todas antes de gravar qualquer uma: se uma foto for inválida, nada fica no disco.
 * Devolve os dados para o banco e uma função que apaga os arquivos se o banco falhar.
 */
async function salvarFotos(tratamentoId, arquivos = []) {
  const processadas = await Promise.all(arquivos.map((a) => processar(a.buffer)));
  const salvas = [];
  try {
    for (const buffer of processadas) {
      salvas.push({ arquivo: await storage.salvar(tratamentoId, buffer), tamanhoBytes: buffer.length });
    }
  } catch (err) {
    await Promise.all(salvas.map((f) => storage.remover(f.arquivo)));
    throw err;
  }
  return {
    fotos: salvas,
    desfazer: () => Promise.all(salvas.map((f) => storage.remover(f.arquivo))),
  };
}

/** Caminho relativo à API — o frontend completa com o endereço do servidor. */
function urlAssinada(fotoId, profissionalId) {
  const params = new URLSearchParams(assinatura.gerarParametros(chave, fotoId, profissionalId));
  return `/api/v1/fotos/${fotoId}?${params}`;
}

async function abrirFoto(fotoId, query) {
  if (!assinatura.verificar(chave, fotoId, query)) {
    throw new ForbiddenError('Link da foto inválido ou expirado. Recarregue a página.');
  }
  const foto = await repository.findComDono(fotoId);
  if (!foto) throw new NotFoundError('Foto não encontrada.');
  // A assinatura foi gerada para um profissional: se o paciente mudou de dono, o link para de valer
  if (foto.checkin.tratamento.paciente.profissionalId !== query.u) throw new ForbiddenError('Acesso negado.');
  return { buffer: await storage.ler(foto.arquivo), pacienteId: foto.checkin.tratamento.paciente.id };
}

module.exports = { salvarFotos, urlAssinada, abrirFoto, LIMITE_FOTOS: 3 };
