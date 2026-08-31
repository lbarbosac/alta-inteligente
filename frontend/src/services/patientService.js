// Arquivo: src/services/patientService.js
import api from './api';

/**
 * Lista todos os pacientes do profissional logado.
 * Endpoint: GET /api/v1/patients
 */
export async function getPatients() {
  const response = await api.get('/patients');
  return response.data.data;
}

/**
 * Busca um paciente específico pelo ID.
 * Endpoint: GET /api/v1/patients/:id
 */
export async function getPatient(id) {
  const response = await api.get(`/patients/${id}`);
  return response.data.data;
}

/**
 * Cadastra um novo paciente.
 * Endpoint: POST /api/v1/patients
 */
export async function createPatient(dados) {
  const response = await api.post('/patients', dados);
  return response.data.data;
}

/**
 * Atualiza os dados cadastrais de um paciente.
 * Endpoint: PUT /api/v1/patients/:id
 */
export async function updatePatient(id, dados) {
  const response = await api.put(`/patients/${id}`, dados);
  return response.data.data;
}