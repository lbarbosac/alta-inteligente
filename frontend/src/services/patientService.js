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
/**
 * Baixa todos os dados do paciente em JSON (pedido de acesso/portabilidade — LGPD).
 * Endpoint: GET /api/v1/patients/:id/exportar
 */
export async function exportarDadosPaciente(id) {
  const response = await api.get(`/patients/${id}/exportar`, { responseType: 'blob' });
  const nome = response.headers['content-disposition']?.match(/filename="([^"]+)"/)?.[1] ?? 'dados-paciente.json';
  const url = URL.createObjectURL(response.data);
  const link = Object.assign(document.createElement('a'), { href: url, download: nome });
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

/**
 * Anonimiza os dados pessoais do paciente. Irreversível.
 * Endpoint: POST /api/v1/patients/:id/anonimizar
 */
export async function anonimizarPaciente(id) {
  const response = await api.post(`/patients/${id}/anonimizar`, { confirmar: true });
  return response.data.data;
}
