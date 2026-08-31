// Arquivo: src/services/professionalService.js
import api from './api';

/**
 * Lista todos os profissionais da plataforma.
 * Requer perfil admin.
 * Endpoint: GET /api/v1/professionals
 */
export async function getProfessionals() {
  const response = await api.get('/professionals');
  return response.data.data;
}

/**
 * Cadastra um novo profissional.
 * Requer perfil admin.
 * Endpoint: POST /api/v1/professionals
 */
export async function createProfessional(dados) {
  const response = await api.post('/professionals', dados);
  return response.data.data;
}

/**
 * Ativa ou bloqueia um profissional (inverte o campo `ativo`).
 * Requer perfil admin.
 * Endpoint: PATCH /api/v1/professionals/:id/status
 */
export async function toggleProfessionalStatus(id) {
  const response = await api.patch(`/professionals/${id}/status`);
  return response.data.data;
}