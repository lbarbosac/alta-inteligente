// Arquivo: backend/src/modules/protocols/protocol.repository.js
const { prisma } = require('../../shared/config/prismaClient');

const CAMPOS_LISTA = { id:true,profissionalId:true,nome:true,descricao:true,diasPadrao:true,ativo:true,criadoEm:true,atualizadoEm:true };
const INCLUDE_COMPLETO = { versoes:{ orderBy:{versao:'desc'},take:1,include:{ dias:{ orderBy:{numeroDia:'asc'},include:{ tarefas:{orderBy:{numeroOrdem:'asc'}} } } } } };

async function create(data) {
  const { nome,descricao,diasPadrao,profissionalId,dias } = data;
  return prisma.protocolo.create({
    data:{ nome,descricao,diasPadrao,profissionalId,
      versoes:{ create:{ versao:1,totalDias:diasPadrao,
        dias:{ create:(dias??[]).map(d=>({ numeroDia:d.numeroDia,titulo:d.titulo??null,
          tarefas:{ create:(d.tarefas??[]).map(t=>({descricao:t.descricao,numeroOrdem:t.numeroOrdem})) }
        })) }
      } }
    },
    include:INCLUDE_COMPLETO
  });
}

async function findAllByProfessional(profissionalId) {
  return prisma.protocolo.findMany({ where:{profissionalId}, select:{...CAMPOS_LISTA,versoes:{orderBy:{versao:'desc'},take:1,select:{versao:true,totalDias:true}}}, orderBy:{criadoEm:'desc'} });
}

async function findById(id) { return prisma.protocolo.findUnique({ where:{id},include:INCLUDE_COMPLETO }); }
async function update(id,data) { return prisma.protocolo.update({ where:{id},data,include:INCLUDE_COMPLETO }); }
async function archive(id) { return prisma.protocolo.update({ where:{id},data:{ativo:false},include:INCLUDE_COMPLETO }); }
async function unarchive(id) { return prisma.protocolo.update({ where:{id},data:{ativo:true},include:INCLUDE_COMPLETO }); }

// Create aninhado: o Prisma grava versão, dias e tarefas numa transação só.
async function createVersion(protocoloId, versao, totalDias, dias) {
  return prisma.versaoProtocolo.create({
    data:{ protocoloId,versao,totalDias,
      dias:{ create:dias.map(d=>({ numeroDia:d.numeroDia,titulo:d.titulo||null,
        tarefas:{ create:(d.tarefas??[]).filter(t=>t.descricao?.trim()).map((t,i)=>({descricao:t.descricao.trim(),numeroOrdem:i+1})) }
      })) }
    }
  });
}

module.exports = { create,findAllByProfessional,findById,update,archive,unarchive,createVersion };