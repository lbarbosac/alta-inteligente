// Arquivo: src/services/authService.js
import api from './api';

/**
 * Realiza login e retorna token + dados do usuário.
 * Endpoint: POST /api/v1/auth/login
 */
export async function login(email, senha, perfil) {
  const response = await api.post('/auth/login', { email, senha, perfil });
  return response.data.data;
}

/**
 * Retorna os dados do usuário autenticado pelo token atual.
 * Endpoint: GET /api/v1/auth/me
 */
export async function getMe() {
  const response = await api.get('/auth/me');
  return response.data.data;
}