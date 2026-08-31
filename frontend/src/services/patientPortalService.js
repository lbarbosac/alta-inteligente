// Arquivo: frontend/src/services/patientPortalService.js
import api from './api';

/**
 * Valida o token do link seguro e retorna os dados do portal.
 * URL correta: GET /api/v1/patient/access/:token
 *
 * O backend retorna sempre um objeto com campo `status`:
 *  - 'invalido'  → token não existe
 *  - 'encerrado' → tratamento finalizado
 *  - 'ativo'     → retorna dados completos do portal
 */
export async function validateToken(token) {
  const response = await api.get(`/patient/access/${token}`);
  return response.data.data;
}

/**
 * Envia o check-in diário do paciente.
 * URL: POST /api/v1/checkins
 */
export async function submitCheckin(dados) {
  const response = await api.post('/checkins', dados);
  return response.data.data;
}