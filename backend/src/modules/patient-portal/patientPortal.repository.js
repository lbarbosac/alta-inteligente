const { prisma } = require('../../shared/config/prismaClient');

/**
 * Busca um tratamento pelo tokenPaciente (link seguro).
 *
 * Inclui tudo que o portal precisa em uma única query:
 *  - Dados do paciente (nome para saudação)
 *  - Versão do protocolo com dias e tarefas (para o checklist do dia)
 *  - Último check-in (para calcular o status clínico atual)
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
    },
  });
}

module.exports = { findTreatmentByToken };