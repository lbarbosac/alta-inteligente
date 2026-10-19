// Arquivo: src/services/accountService.js
import api from './api';

/**
 * Preferências do profissional logado: horário do lembrete, alertas por e-mail,
 * situação dos termos e se os canais de envio estão configurados.
 * Endpoint: GET /api/v1/account/preferencias
 */
export async function getPreferencias() {
  const response = await api.get('/account/preferencias');
  return response.data.data;
}

/** Endpoint: PATCH /api/v1/account/preferencias — { horaLembrete?, alertasEmail? } */
export async function salvarPreferencias(dados) {
  const response = await api.patch('/account/preferencias', dados);
  return response.data.data;
}

/** Endpoint: POST /api/v1/account/termos — { versao } */
export async function aceitarTermos(versao) {
  const response = await api.post('/account/termos', { versao });
  return response.data.data;
}
