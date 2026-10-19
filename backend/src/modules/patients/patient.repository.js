const { prisma } = require('../../shared/config/prismaClient');

/**
 * Campos retornados em todas as queries de paciente.
 * Inclui o profissionalId para que o service possa
 * executar a verificação de propriedade (segurança).
 */
const CAMPOS_PUBLICOS = {
  id:             true,
  profissionalId: true,
  nome:           true,
  dataNascimento: true,
  telefone:       true,
  email:          true,
  observacoes:    true,
  ativo:          true,
  criadoEm:       true,
  atualizadoEm:   true,
  anonimizadoEm:  true,
};

/**
 * Cria um novo paciente associado ao profissional logado.
 * O ID é gerado automaticamente pelo Prisma (@default(uuid())).
 *
 * @param {{ nome, dataNascimento, telefone, email?, observacoes?, profissionalId }} data
 */
async function create(data) {
  return prisma.paciente.create({
    data,
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Lista todos os pacientes de um profissional específico.
 * Retorna ativos e inativos — o admin de listagem exibe o status.
 *
 * @param {string} profissionalId
 */
async function findByProfessionalId(profissionalId) {
  return prisma.paciente.findMany({
    where: { profissionalId },
    select: CAMPOS_PUBLICOS,
    orderBy: { criadoEm: 'desc' },
  });
}

/**
 * Busca um paciente pelo ID.
 * Retorna null se não encontrado — a verificação de NotFoundError
 * e ForbiddenError é responsabilidade do service.
 *
 * @param {string} id
 */
async function findById(id) {
  return prisma.paciente.findUnique({
    where: { id },
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Atualiza os dados cadastrais de um paciente.
 * Recebe apenas os campos que devem ser alterados.
 *
 * @param {string} id
 * @param {object} data
 */
async function update(id, data) {
  return prisma.paciente.update({
    where: { id },
    data,
    select: CAMPOS_PUBLICOS,
  });
}

/**
 * Tudo que o sistema guarda sobre o paciente, para atender pedido de acesso/portabilidade (LGPD art. 18).
 * As descrições das tarefas vêm numa query separada — include aninhado com orderBy quebra (ver CLAUDE.md).
 */
async function dadosParaExportacao(id) {
  const paciente = await prisma.paciente.findUnique({
    where: { id },
    select: {
      ...CAMPOS_PUBLICOS,
      tratamentos: {
        orderBy: { criadoEm: 'asc' },
        select: {
          id: true, nomeProcedimento: true, dataProcedimento: true, status: true, criadoEm: true,
          versaoProtocolo: { select: { versao: true, protocolo: { select: { nome: true } } } },
          consentimentos: { orderBy: { aceitoEm: 'asc' }, select: { versaoTermo: true, aceitaLembretes: true, aceitoEm: true } },
          notificacoes: { orderBy: { criadoEm: 'asc' }, select: { tipo: true, canal: true, status: true, criadoEm: true } },
          checkins: {
            orderBy: { diaRecuperacao: 'asc' },
            select: {
              diaRecuperacao: true, nivelDor: true, observacoes: true, enviadoEm: true,
              respostas: { select: { tarefaDiaProtocoloId: true, concluido: true } },
              fotos: { orderBy: { criadoEm: 'asc' }, select: { arquivo: true, criadoEm: true } },
            },
          },
        },
      },
    },
  });
  if (!paciente) return null;

  const tarefaIds = [...new Set(paciente.tratamentos.flatMap(t => t.checkins.flatMap(c => c.respostas.map(r => r.tarefaDiaProtocoloId))))];
  const tarefas = tarefaIds.length
    ? await prisma.tarefaDiaProtocolo.findMany({ where: { id: { in: tarefaIds } }, select: { id: true, descricao: true } })
    : [];
  return { paciente, descricaoTarefas: Object.fromEntries(tarefas.map(t => [t.id, t.descricao])) };
}

/**
 * Anonimiza o paciente numa transação só (LGPD art. 16 e 18). O que sai:
 *  - nome, telefone, e-mail, observações e data de nascimento
 *  - observações escritas nos check-ins e as fotos (as fotos voltam para o service apagar do disco)
 *  - IP e navegador guardados no consentimento (fica só a prova de data e versão)
 * O que fica, sem ligação com a pessoa: níveis de dor e tarefas, para histórico clínico anônimo.
 * Tratamentos ativos são cancelados e o link do paciente deixa de funcionar.
 */
async function anonimizar(id, novoTokenPorTratamento) {
  return prisma.$transaction(async (tx) => {
    const tratamentos = await tx.tratamento.findMany({ where: { pacienteId: id }, select: { id: true, status: true } });
    const tratamentoIds = tratamentos.map(t => t.id);
    const checkinIds = (await tx.checkin.findMany({ where: { tratamentoId: { in: tratamentoIds } }, select: { id: true } })).map(c => c.id);

    const fotos = await tx.fotoCheckin.findMany({ where: { checkinId: { in: checkinIds } }, select: { arquivo: true } });
    await tx.fotoCheckin.deleteMany({ where: { checkinId: { in: checkinIds } } });
    await tx.checkin.updateMany({ where: { id: { in: checkinIds } }, data: { observacoes: null } });
    await tx.consentimentoPaciente.updateMany({ where: { tratamentoId: { in: tratamentoIds } }, data: { ip: null, userAgent: null } });

    for (const t of tratamentos) {
      await tx.tratamento.update({
        where: { id: t.id },
        data: { tokenPaciente: novoTokenPorTratamento(), ...(t.status === 'ativo' && { status: 'cancelado' }) },
      });
    }

    await tx.paciente.update({
      where: { id },
      data: {
        nome: 'Paciente anonimizado',
        telefone: '',
        email: null,
        observacoes: null,
        dataNascimento: new Date('1900-01-01T00:00:00Z'),
        ativo: false,
        anonimizadoEm: new Date(),
      },
    });

    return fotos.map(f => f.arquivo);
  });
}

module.exports = { create, findByProfessionalId, findById, update, dadosParaExportacao, anonimizar };