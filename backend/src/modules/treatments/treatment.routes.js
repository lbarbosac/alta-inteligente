const { Router } = require('express');

const { authMiddleware }  = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware }  = require('../../shared/middlewares/roleMiddleware');
const { validateCreate }  = require('./treatment.validation');
const controller = require('./treatment.controller');

const router = Router();

/**
 * Todas as rotas exigem JWT válido + perfil professional.
 * doc 02-regras-negocio.md seção 3.2: o profissional gerencia
 * os tratamentos dos seus próprios pacientes.
 */
router.use(authMiddleware, roleMiddleware(['professional']));

/**
 * POST /api/v1/treatments
 * Inicia um novo tratamento. Gera o link seguro automaticamente.
 */
router.post('/',   validateCreate, controller.create);

/**
 * GET /api/v1/treatments
 * Lista os tratamentos dos pacientes do profissional logado.
 */
router.get('/',                    controller.list);

/**
 * GET /api/v1/treatments/:id
 * Retorna um tratamento com dados completos.
 */
router.get('/:id',                 controller.getById);

module.exports = router;