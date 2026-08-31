// Arquivo: frontend/src/services/treatmentService.js
import api from './api';

export async function getTreatments() {
  const response = await api.get('/treatments');
  return response.data.data;
}

export async function getTreatment(id) {
  const response = await api.get(`/treatments/${id}`);
  return response.data.data;
}

export async function createTreatment(dados) {
  const response = await api.post('/treatments', dados);
  return response.data.data;
}

export async function updateTreatment(id, dados) {
  // Alterado de patch para put (ou mantenha patch se o backend usar router.patch)
  const response = await api.put(`/treatments/${id}`, dados);
  return response.data.data;
}