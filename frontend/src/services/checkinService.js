// Arquivo: frontend/src/services/checkinService.js
import api from './api';
export async function getCheckinsByTreatment(tratamentoId) {
  const response = await api.get(`/checkins/treatment/${tratamentoId}`);
  return response.data.data;
}