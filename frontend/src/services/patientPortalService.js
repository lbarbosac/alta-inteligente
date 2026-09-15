// Arquivo: frontend/src/services/patientPortalService.js
import api from './api';

/**
 * Valida o token do link seguro e retorna os dados do portal.
 * URL correta: GET /api/v1/patient/access/:token
 *
 * O backend retorna sempre um objeto com campo `status`:
 *  - 'invalido'               → token não existe
 *  - 'encerrado'              → tratamento finalizado
 *  - 'consentimento_pendente' → paciente ainda não aceitou o termo de privacidade
 *  - 'ativo'                  → retorna dados completos do portal
 */
export async function validateToken(token) {
  const response = await api.get(`/patient/access/${token}`);
  return response.data.data;
}

/**
 * Aceite do termo de privacidade (LGPD).
 * URL: POST /api/v1/patient/access/:token/consentimento
 */
export async function registrarConsentimento(token, aceitaLembretes) {
  const response = await api.post(`/patient/access/${token}/consentimento`, { aceitaLembretes });
  return response.data.data;
}

/**
 * Envia o check-in diário do paciente, com até 3 fotos.
 * URL: POST /api/v1/checkins (multipart/form-data)
 *
 * O Content-Type multipart é obrigatório: com o padrão application/json do api.js,
 * o axios converteria o FormData em JSON e as fotos se perderiam.
 */
export async function submitCheckin({ token, nivelDor, observacoes, respostas, fotos = [] }) {
  const form = new FormData();
  form.append('token', token);
  form.append('nivelDor', String(nivelDor));
  if (observacoes) form.append('observacoes', observacoes);
  form.append('respostas', JSON.stringify(respostas ?? []));
  fotos.forEach((foto, i) => form.append('fotos', foto, `foto-${i + 1}.jpg`));

  const response = await api.post('/checkins', form, { headers: { 'Content-Type': 'multipart/form-data' } });
  return response.data.data;
}
