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

/**
 * Pede o link de redefinição de senha por e-mail.
 * A resposta é a mesma exista a conta ou não.
 * Endpoint: POST /api/v1/auth/esqueci-senha
 */
export async function esqueciSenha(email, perfil) {
  const response = await api.post('/auth/esqueci-senha', { email, perfil });
  return response.data.message;
}

/**
 * Define a nova senha a partir do token recebido por e-mail.
 * Endpoint: POST /api/v1/auth/redefinir-senha
 */
export async function redefinirSenha(token, senha) {
  const response = await api.post('/auth/redefinir-senha', { token, senha });
  return response.data.message;
}
