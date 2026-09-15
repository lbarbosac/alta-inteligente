const { prisma } = require('../../shared/config/prismaClient');

/**
 * Busca um tratamento pelo tokenPaciente (link seguro).
 *
 * Inclui tudo que o portal precisa em uma única query:
 *  - Dados do paciente (nome para saudação) e o profissional responsável (para o termo)
 *  - Versão do protocolo com dias e tarefas (para o checklist do dia)
 *  - Último check-in (para calcular o status clínico atual)
 *  - Último consentimento (para saber se o termo da versão atual foi aceito)
 *
 * @param {string} token - 64 chars hex (tokenPaciente)
 * @returns {object|null}
 */
async function findTreatmentByToken(token) {
  return prisma.tratamento.findUnique({
    where: { tokenPaciente: token },
    include: {
      paciente: {
        select: {
          id:             true,
          nome:           true,
          dataNascimento: true,
          profissional:   { select: { nome: true, especialidade: true } },
        },
      },
      versaoProtocolo: {
        include: {
          dias: {
            orderBy: { numeroDia: 'asc' },
            include: {
              tarefas: {
                orderBy: { numeroOrdem: 'asc' },
              },
            },
          },
        },
      },
      checkins: {
        orderBy: { diaRecuperacao: 'desc' },
        take: 1,
        select: {
          id:             true,
          diaRecuperacao: true,
          nivelDor:       true,
          enviadoEm:      true,
        },
      },
      consentimentos: {
        orderBy: { aceitoEm: 'desc' },
        take: 1,
        select: { versaoTermo: true, aceitaLembretes: true },
      },
    },
  });
}

async function createConsent(data) {
  return prisma.consentimentoPaciente.create({
    data,
    select: { versaoTermo: true, aceitaLembretes: true, aceitoEm: true },
  });
}

module.exports = { findTreatmentByToken, createConsent };
