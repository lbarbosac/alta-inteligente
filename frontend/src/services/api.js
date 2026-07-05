// Arquivo: src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api/v1',
  headers: { 'Content-Type': 'application/json' },
});

// ── Request: anexa o token JWT em todas as requisições ─────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('@alta:token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response: redireciona para login em caso de 401 ────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('@alta:token');
      localStorage.removeItem('@alta:usuario');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;