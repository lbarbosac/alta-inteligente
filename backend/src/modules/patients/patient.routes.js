const { Router } = require('express');

const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware }  = require('../../shared/middlewares/roleMiddleware');
const { validateCreate, validateUpdate, validateAnonimizar } = require('./patient.validation');
const controller = require('./patient.controller');

const router = Router();

/**
 * Todas as rotas deste módulo exigem:
 *  1. Token JWT válido       (authMiddleware)
 *  2. Perfil profissional    (roleMiddleware)
 *
 * Conforme doc 02-regras-negocio.md seção 3.2:
 * "O Profissional pode cadastrar, editar e arquivar pacientes."
 * "O Profissional acessa apenas os seus próprios pacientes."
 */
router.use(authMiddleware, roleMiddleware(['professional']));

/**
 * POST /api/v1/patients
 * Cadastra um novo paciente vinculado ao profissional logado.
 */
router.post('/', validateCreate, controller.create);

/**
 * GET /api/v1/patients
 * Lista todos os pacientes do profissional logado.
 */
router.get('/', controller.list);

/**
 * GET /api/v1/patients/:id
 * Retorna um paciente específico pelo ID.
 * Retorna 403 se o paciente pertencer a outro profissional.
 */
router.get('/:id', controller.getById);

/**
 * PUT /api/v1/patients/:id
 * Atualiza dados cadastrais do paciente.
 * Retorna 403 se o paciente pertencer a outro profissional.
 */
router.put('/:id', validateUpdate, controller.update);

/**
 * GET /api/v1/patients/:id/exportar
 * Baixa todos os dados do paciente em JSON (pedido de acesso/portabilidade — LGPD).
 */
router.get('/:id/exportar', controller.exportar);

/**
 * POST /api/v1/patients/:id/anonimizar
 * Remove os dados pessoais do paciente. Irreversível.
 */
router.post('/:id/anonimizar', validateAnonimizar, controller.anonimizar);

module.exports = router;