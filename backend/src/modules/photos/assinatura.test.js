// Rodar com: npm test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const assinatura = require('./assinatura');

const chave = assinatura.derivarChave('segredo-de-teste');
const FOTO = '0f5fd85c-e4c6-471a-8b88-5a93a512ff93';
const PROF = '9f8dff09-8905-4e98-905e-dde932653a2a';
const agora = Date.UTC(2026, 8, 15, 12, 0, 0);

test('link assinado válido dentro do prazo', () => {
  const params = assinatura.gerarParametros(chave, FOTO, PROF, agora);
  assert.equal(assinatura.verificar(chave, FOTO, params, agora + 60_000), true);
});

test('link expira depois de 15 minutos', () => {
  const params = assinatura.gerarParametros(chave, FOTO, PROF, agora);
  const depois = agora + (assinatura.VALIDADE_SEGUNDOS + 1) * 1000;
  assert.equal(assinatura.verificar(chave, FOTO, params, depois), false);
});

test('link não serve para outra foto nem para outro profissional', () => {
  const params = assinatura.gerarParametros(chave, FOTO, PROF, agora);
  assert.equal(assinatura.verificar(chave, 'outra-foto', params, agora), false);
  assert.equal(assinatura.verificar(chave, FOTO, { ...params, u: 'outro-profissional' }, agora), false);
});

test('prazo alterado ou assinatura forjada são recusados', () => {
  const params = assinatura.gerarParametros(chave, FOTO, PROF, agora);
  assert.equal(assinatura.verificar(chave, FOTO, { ...params, exp: String(Number(params.exp) + 3600) }, agora), false);
  assert.equal(assinatura.verificar(chave, FOTO, { ...params, sig: 'f'.repeat(64) }, agora), false);
  assert.equal(assinatura.verificar(chave, FOTO, { ...params, sig: 'nao-hex' }, agora), false);
  assert.equal(assinatura.verificar(chave, FOTO, {}, agora), false);
});

test('outra chave (outro JWT_SECRET) invalida todos os links', () => {
  const params = assinatura.gerarParametros(chave, FOTO, PROF, agora);
  assert.equal(assinatura.verificar(assinatura.derivarChave('outro-segredo'), FOTO, params, agora), false);
});
