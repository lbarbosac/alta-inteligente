// Arquivo: backend/src/modules/account/account.service.js
const repository = require('./account.repository');
const emailProvider = require('../notifications/providers/email.provider');
const whatsappProvider = require('../notifications/providers/whatsapp.provider');
const { VERSAO_TERMOS_PROFISSIONAL } = require('../../shared/config/legal');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ValidationError } = require('../../shared/errors/ValidationError');

function comContexto(conta) {
  return {
    ...conta,
    versaoTermosAtual: VERSAO_TERMOS_PROFISSIONAL,
    precisaAceitarTermos: conta.termosVersao !== VERSAO_TERMOS_PROFISSIONAL,
    // A tela de configurações mostra se os envios são reais ou simulados
    canais: { email: emailProvider.configurado(), whatsapp: whatsappProvider.configurado() },
  };
}

async function obterPreferencias(profissionalId) {
  const conta = await repository.findPreferencias(profissionalId);
  if (!conta) throw new NotFoundError('Conta não encontrada.');
  return comContexto(conta);
}

async function atualizarPreferencias(profissionalId, dados) {
  return comContexto(await repository.updatePreferencias(profissionalId, dados));
}

async function aceitarTermos(profissionalId, versao) {
  if (versao !== VERSAO_TERMOS_PROFISSIONAL) {
    throw new ValidationError('Os termos foram atualizados. Recarregue a página e leia a versão atual.');
  }
  return comContexto(await repository.updatePreferencias(profissionalId, {
    termosVersao: VERSAO_TERMOS_PROFISSIONAL,
    termosAceitosEm: new Date(),
  }));
}

module.exports = { obterPreferencias, atualizarPreferencias, aceitarTermos };
