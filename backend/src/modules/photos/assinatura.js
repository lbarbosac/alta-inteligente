// Arquivo: backend/src/modules/photos/assinatura.js
// Link assinado para ver uma foto. Uma <img> não consegue mandar o token JWT no cabeçalho,
// então o endereço carrega uma assinatura HMAC que expira. Funções puras — testadas em assinatura.test.js.
const crypto = require('crypto');

const VALIDADE_SEGUNDOS = 15 * 60;

function derivarChave(segredo) {
  return crypto.createHash('sha256').update(`${segredo}:fotos-checkin`).digest();
}

function assinar(chave, fotoId, profissionalId, expira) {
  return crypto.createHmac('sha256', chave).update(`${fotoId}.${profissionalId}.${expira}`).digest('hex');
}

function gerarParametros(chave, fotoId, profissionalId, agoraMs = Date.now()) {
  const exp = Math.floor(agoraMs / 1000) + VALIDADE_SEGUNDOS;
  return { u: profissionalId, exp: String(exp), sig: assinar(chave, fotoId, profissionalId, exp) };
}

function verificar(chave, fotoId, { u, exp, sig } = {}, agoraMs = Date.now()) {
  if (!u || !exp || !sig || !/^\d+$/.test(exp) || !/^[a-f0-9]{64}$/.test(sig)) return false;
  if (Number(exp) < Math.floor(agoraMs / 1000)) return false;
  const esperado = Buffer.from(assinar(chave, fotoId, u, exp), 'hex');
  return crypto.timingSafeEqual(esperado, Buffer.from(sig, 'hex'));
}

module.exports = { VALIDADE_SEGUNDOS, derivarChave, gerarParametros, verificar };
