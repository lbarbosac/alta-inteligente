// Rodar com: npm test
const { test } = require('node:test');
const assert = require('node:assert/strict');
const regras = require('./regras');

test('alerta de dor: dor 7 ou mais sempre alerta', () => {
  assert.equal(regras.motivoAlertaDor(7, null), 'dor_alta');
  assert.equal(regras.motivoAlertaDor(10, 9), 'dor_alta');
});

test('alerta de dor: piora de 2 pontos alerta mesmo abaixo de 7', () => {
  assert.equal(regras.motivoAlertaDor(5, 3), 'piora');
  assert.equal(regras.motivoAlertaDor(6, 2), 'piora');
});

test('alerta de dor: sem alerta quando a dor está baixa e estável ou melhorando', () => {
  assert.equal(regras.motivoAlertaDor(4, 3), null);
  assert.equal(regras.motivoAlertaDor(3, 6), null);
  assert.equal(regras.motivoAlertaDor(6, null), null);
});

test('lembrete: só entre o horário escolhido e 21h', () => {
  const as = (h, m) => new Date(2026, 8, 15, h, m);
  assert.equal(regras.dentroDaJanelaDeLembrete('09:00', as(8, 59)), false);
  assert.equal(regras.dentroDaJanelaDeLembrete('09:00', as(9, 0)), true);
  assert.equal(regras.dentroDaJanelaDeLembrete('09:00', as(15, 30)), true);
  assert.equal(regras.dentroDaJanelaDeLembrete('09:00', as(21, 0)), false);
  assert.equal(regras.dentroDaJanelaDeLembrete('20:00', as(20, 45)), true);
});

test('lembrete: chave do dia usa a data local', () => {
  assert.equal(regras.dataLocal(new Date(2026, 0, 5, 23, 59)), '2026-01-05');
});

test('telefone para WhatsApp: aceita com e sem máscara e com 55', () => {
  assert.equal(regras.telefoneWhatsApp('(51) 98123-4567'), '5551981234567');
  assert.equal(regras.telefoneWhatsApp('5132345678'), '555132345678');
  assert.equal(regras.telefoneWhatsApp('+55 51 98123-4567'), '5551981234567');
  assert.equal(regras.telefoneWhatsApp('12345'), null);
  assert.equal(regras.telefoneWhatsApp(''), null);
});

test('nome abreviado no e-mail de alerta', () => {
  assert.equal(regras.nomeAbreviado('Ana Beatriz Souza'), 'Ana S.');
  assert.equal(regras.nomeAbreviado('Maria'), 'Maria');
  assert.equal(regras.nomeAbreviado(''), 'Paciente');
});
