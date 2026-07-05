const { Router } = require('express');

const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware }  = require('../../shared/middlewares/roleMiddleware');
const { validateCreate, validateUpdate } = require('./professional.validation');
const controller = require('./professional.controller');

const router = Router();

/**
 * Todas as rotas deste módulo exigem:
 *  1. Token JWT válido       (authMiddleware)
 *  2. Perfil administrador   (roleMiddleware)
 *
 * Conforme doc 02-regras-negocio.md seção 3.1:
 * "O Administrador pode cadastrar, editar e bloquear profissionais."
 * "O Profissional NÃO pode alterar dados de administradores."
 */

// Aplica os dois guards em todas as rotas deste arquivo de uma só vez
router.use(authMiddleware, roleMiddleware(['admin']));

/**
 * POST /api/v1/professionals
 * Cadastra um novo profissional.
 */
router.post('/', validateCreate, controller.create);

/**
 * GET /api/v1/professionals
 * Lista todos os profissionais.
 */
router.get('/', controller.list);

/**
 * GET /api/v1/professionals/:id
 * Retorna um profissional específico pelo ID.
 */
router.get('/:id', controller.get);

/**
 * PUT /api/v1/professionals/:id
 * Atualiza nome, email, telefone ou especialidade de um profissional.
 */
router.put('/:id', validateUpdate, controller.update);

/**
 * PATCH /api/v1/professionals/:id/status
 * Ativa ou bloqueia um profissional (inverte o campo `ativo`).
 */
router.patch('/:id/status', controller.toggleStatus);

module.exports = router;