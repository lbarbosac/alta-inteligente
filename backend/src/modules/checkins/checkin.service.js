// Arquivo: backend/src/modules/checkins/checkin.service.js
const checkinRepository = require('./checkin.repository');
const { prisma } = require('../../shared/config/prismaClient');
const { NotFoundError }   = require('../../shared/errors/NotFoundError');
const { ForbiddenError }  = require('../../shared/errors/ForbiddenError');
const { ValidationError } = require('../../shared/errors/ValidationError');

async function submitCheckin(dados) {
  const { tratamentoId, diaRecuperacao, nivelDor, observacoes, respostas } = dados;
  const tratamento = await prisma.tratamento.findUnique({ where:{id:tratamentoId}, select:{id:true,status:true} });
  if (!tratamento) throw new NotFoundError('Tratamento não encontrado.');
  if (tratamento.status !== 'ativo') throw new ValidationError('Este tratamento foi encerrado.');
  const existente = await checkinRepository.findByDayAndTreatment(tratamentoId, diaRecuperacao);
  if (existente) throw new ValidationError(`O check-in do Dia ${diaRecuperacao} já foi realizado.`);
  return checkinRepository.create({ tratamentoId, diaRecuperacao, nivelDor, observacoes:observacoes??null, enviadoEm:new Date(), respostas });
}

async function getCheckinsByTreatment(tratamentoId, profissionalId) {
  const tratamento = await prisma.tratamento.findUnique({ where:{id:tratamentoId}, include:{paciente:{select:{profissionalId:true}}} });
  if (!tratamento) throw new NotFoundError('Tratamento não encontrado.');
  if (tratamento.paciente.profissionalId !== profissionalId) throw new ForbiddenError('Acesso negado.');
  return checkinRepository.findByTreatmentId(tratamentoId);
}

module.exports = { submitCheckin, getCheckinsByTreatment };