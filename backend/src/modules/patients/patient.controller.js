const service = require('./patient.service');
const audit = require('../audit/audit.service');
const { ApiResponse } = require('../../shared/utils/ApiResponse');

/**
 * POST /api/v1/patients
 * Cadastra um novo paciente vinculado ao profissional logado.
 *
 * O profissionalId é extraído do token JWT (req.usuario.id),
 * nunca do body da requisição — garante integridade de dados.
 */
async function create(req, res) {
  const profissionalId = req.usuario.id;
  const paciente = await service.createPatient(req.body, profissionalId);
  return ApiResponse.created(res, paciente, 'Paciente cadastrado com sucesso.');
}

/**
 * GET /api/v1/patients
 * Lista todos os pacientes do profissional logado.
 */
async function list(req, res) {
  const profissionalId = req.usuario.id;
  const pacientes = await service.listPatientsByProfessional(profissionalId);
  return ApiResponse.success(res, pacientes, 'Pacientes listados com sucesso.');
}

/**
 * GET /api/v1/patients/:id
 * Retorna um paciente específico.
 * Retorna 403 se o paciente pertencer a outro profissional.
 */
async function getById(req, res) {
  const profissionalId = req.usuario.id;
  const paciente = await service.getPatientById(req.params.id, profissionalId);
  await audit.registrar({ req, acao: 'paciente.visualizar', entidade: 'paciente', entidadeId: paciente.id });
  return ApiResponse.success(res, paciente, 'Paciente encontrado.');
}

/**
 * GET /api/v1/patients/:id/exportar
 * Baixa um JSON com todos os dados do paciente (pedido de acesso/portabilidade — LGPD).
 */
async function exportar(req, res) {
  const dados = await service.exportarDados(req.params.id, req.usuario.id);
  await audit.registrar({ req, acao: 'paciente.exportar', entidade: 'paciente', entidadeId: req.params.id });

  const data = new Date().toISOString().slice(0, 10);
  res.set({
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Disposition': `attachment; filename="dados-paciente-${data}.json"`,
    'Cache-Control': 'no-store',
  });
  return res.send(JSON.stringify(dados, null, 2));
}

/**
 * POST /api/v1/patients/:id/anonimizar
 * Body: { confirmar: true }. Irreversível.
 */
async function anonimizar(req, res) {
  const paciente = await service.anonimizarPaciente(req.params.id, req.usuario.id);
  await audit.registrar({ req, acao: 'paciente.anonimizar', entidade: 'paciente', entidadeId: req.params.id });
  return ApiResponse.success(res, paciente, 'Dados pessoais do paciente anonimizados.');
}

/**
 * PUT /api/v1/patients/:id
 * Atualiza os dados cadastrais de um paciente.
 * Retorna 403 se o paciente pertencer a outro profissional.
 */
async function update(req, res) {
  const profissionalId = req.usuario.id;
  const paciente = await service.updatePatient(req.params.id, req.body, profissionalId);
  return ApiResponse.success(res, paciente, 'Paciente atualizado com sucesso.');
}

module.exports = { create, list, getById, update, exportar, anonimizar };