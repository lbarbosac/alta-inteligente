const repository = require('./patient.repository');
const audit = require('../audit/audit.service');
const storage = require('../../shared/storage/fotoStorage');
const { generateSecureToken } = require('../../shared/utils/generateSecureToken');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

/**
 * Verifica se o paciente existe e pertence ao profissional logado.
 * Função interna reutilizada por getPatientById e updatePatient.
 *
 * Ordem das verificações (doc 02-regras-negocio.md, seção 3.2):
 *  1. Paciente não existe → NotFoundError (404)
 *  2. Paciente existe mas pertence a outro profissional → ForbiddenError (403)
 *     (Não revelamos que o paciente existe para evitar enumeração de IDs.)
 *
 * @param {string} id
 * @param {string} profissionalId - ID do profissional logado
 * @returns {object} paciente
 */
async function assertPacienteDoUsuario(id, profissionalId) {
  const paciente = await repository.findById(id);

  if (!paciente) {
    throw new NotFoundError('Paciente não encontrado.');
  }

  if (paciente.profissionalId !== profissionalId) {
    // Retorna 403, não 404 — o paciente existe mas o acesso é negado
    throw new ForbiddenError('Acesso negado. Este paciente não pertence ao seu cadastro.');
  }

  return paciente;
}

/**
 * Cadastra um novo paciente associado ao profissional logado.
 * O profissionalId vem do token JWT, nunca do body da requisição.
 *
 * @param {object} dados  - Dados validados pelo middleware
 * @param {string} profissionalId - req.usuario.id
 */
async function createPatient(dados, profissionalId) {
  return repository.create({
    ...dados,
    profissionalId,
  });
}

/**
 * Lista todos os pacientes do profissional logado.
 * Um profissional nunca visualiza pacientes de outro profissional.
 *
 * @param {string} profissionalId - req.usuario.id
 */
async function listPatientsByProfessional(profissionalId) {
  return repository.findByProfessionalId(profissionalId);
}

/**
 * Retorna um paciente específico.
 * Garante que o paciente pertence ao profissional logado.
 *
 * @param {string} id
 * @param {string} profissionalId - req.usuario.id
 */
async function getPatientById(id, profissionalId) {
  return assertPacienteDoUsuario(id, profissionalId);
}

/**
 * Atualiza os dados cadastrais de um paciente.
 * Executa a verificação de propriedade antes de qualquer alteração.
 *
 * @param {string} id
 * @param {object} dados
 * @param {string} profissionalId - req.usuario.id
 */
async function updatePatient(id, dados, profissionalId) {
  const paciente = await assertPacienteDoUsuario(id, profissionalId);
  if (paciente.anonimizadoEm) throw new ValidationError('Os dados deste paciente foram anonimizados e não podem ser editados.');
  return repository.update(id, dados);
}

/**
 * Exporta tudo que o sistema guarda sobre o paciente em JSON, com as fotos embutidas.
 * Atende o pedido de acesso e portabilidade do titular (LGPD art. 18, II e V).
 * O token do link não entra: é uma chave de acesso, não um dado do paciente.
 */
async function exportarDados(id, profissionalId) {
  await assertPacienteDoUsuario(id, profissionalId);
  const { paciente, descricaoTarefas } = await repository.dadosParaExportacao(id);
  const acessos = await audit.listarPorEntidade('paciente', id);

  const tratamentos = await Promise.all(paciente.tratamentos.map(async ({ versaoProtocolo, checkins, ...t }) => ({
    ...t,
    protocolo: versaoProtocolo ? `${versaoProtocolo.protocolo.nome} (versão ${versaoProtocolo.versao})` : null,
    checkins: await Promise.all(checkins.map(async ({ respostas, fotos, ...c }) => ({
      ...c,
      orientacoes: respostas.map(r => ({ descricao: descricaoTarefas[r.tarefaDiaProtocoloId] ?? null, concluida: r.concluido })),
      fotos: await Promise.all(fotos.map(async f => ({
        enviadaEm: f.criadoEm,
        imagem: `data:image/jpeg;base64,${(await storage.ler(f.arquivo)).toString('base64')}`,
      }))),
    }))),
  })));

  const { tratamentos: _, profissionalId: __, ...dadosPessoais } = paciente;
  return {
    geradoEm: new Date().toISOString(),
    aviso: 'Dados pessoais e de saúde. Entregue somente ao próprio paciente ou a quem ele autorizar.',
    paciente: dadosPessoais,
    tratamentos,
    registrosDeAcesso: acessos,
  };
}

/**
 * Anonimiza os dados pessoais do paciente (ver patient.repository.anonimizar).
 * Irreversível. O aviso na tela lembra da obrigação de guardar prontuário antes de usar.
 */
async function anonimizarPaciente(id, profissionalId) {
  const paciente = await assertPacienteDoUsuario(id, profissionalId);
  if (paciente.anonimizadoEm) throw new ValidationError('Este paciente já foi anonimizado.');

  const arquivos = await repository.anonimizar(id, generateSecureToken);
  const falhas = (await Promise.allSettled(arquivos.map(storage.remover))).filter(r => r.status === 'rejected');
  if (falhas.length) console.error(`[anonimizar] ${falhas.length} foto(s) não foram apagadas do disco do paciente ${id}`);

  return repository.findById(id);
}

module.exports = {
  createPatient,
  listPatientsByProfessional,
  getPatientById,
  updatePatient,
  exportarDados,
  anonimizarPaciente,
};