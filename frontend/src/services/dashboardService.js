// Arquivo: src/services/dashboardService.js
import api from './api';

/**
 * Retorna cards de métricas, alertas críticos e feed de check-ins.
 * Endpoint: GET /api/v1/dashboard
 */
export async function getDashboard() {
  const response = await api.get('/dashboard');
  return response.data.data;
}