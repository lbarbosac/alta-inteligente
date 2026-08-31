// Arquivo: backend/src/modules/dashboard/dashboard.repository.js
const { prisma } = require('../../shared/config/prismaClient');

async function getActiveTreatmentsCount(profissionalId) {
  return prisma.tratamento.count({ where:{status:'ativo',paciente:{profissionalId}} });
}

async function getCriticalAlerts(profissionalId) {
  const limite = new Date(Date.now()-48*60*60*1000);
  return prisma.checkin.findMany({
    where:{ nivelDor:{gte:7},enviadoEm:{gte:limite},tratamento:{status:'ativo',paciente:{profissionalId}} },
    select:{ id:true,diaRecuperacao:true,nivelDor:true,observacoes:true,enviadoEm:true,
      tratamento:{ select:{ id:true,nomeProcedimento:true,paciente:{select:{id:true,nome:true,telefone:true}} } }
    },
    orderBy:[{nivelDor:'desc'},{enviadoEm:'desc'}],
  });
}

async function getRecentCheckins(profissionalId) {
  return prisma.checkin.findMany({
    where:{ tratamento:{status:'ativo',paciente:{profissionalId}} },
    select:{ id:true,diaRecuperacao:true,nivelDor:true,observacoes:true,enviadoEm:true,
      tratamento:{ select:{ id:true,nomeProcedimento:true,paciente:{select:{id:true,nome:true}} } }
    },
    orderBy:{ enviadoEm:'desc' }, take:5,
  });
}

async function getCheckinsHojeCount(profissionalId) {
  const inicio = new Date(); inicio.setHours(0,0,0,0);
  return prisma.checkin.count({ where:{ enviadoEm:{gte:inicio},tratamento:{paciente:{profissionalId}} } });
}

async function getPatientsWithoutRecentCheckin(profissionalId) {
  const limite = new Date(Date.now()-48*60*60*1000);
  return prisma.tratamento.count({ where:{ status:'ativo',paciente:{profissionalId},checkins:{none:{enviadoEm:{gte:limite}}} } });
}

module.exports = { getActiveTreatmentsCount,getCriticalAlerts,getRecentCheckins,getCheckinsHojeCount,getPatientsWithoutRecentCheckin };