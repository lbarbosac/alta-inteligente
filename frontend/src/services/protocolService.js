// Arquivo: frontend/src/services/protocolService.js
import api from './api';
export async function getProtocols()            { return (await api.get('/protocols')).data.data; }
export async function getProtocol(id)           { return (await api.get(`/protocols/${id}`)).data.data; }
export async function createProtocol(dados)     { return (await api.post('/protocols', dados)).data.data; }
export async function updateProtocol(id,dados)  { return (await api.put(`/protocols/${id}`, dados)).data.data; }
export async function archiveProtocol(id)       { return (await api.delete(`/protocols/${id}`)).data.data; }
export async function unarchiveProtocol(id)     { return (await api.patch(`/protocols/${id}/reativar`)).data.data; }
export async function editarProtocolo(id,dados) { return (await api.put(`/protocols/${id}/editar`, dados)).data.data; }