const { Router } = require('express');

const { authMiddleware }  = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware }  = require('../../shared/middlewares/roleMiddleware');
const { validateCreate, validateUpdate } = require('./protocol.validation');
const controller = require('./protocol.controller');

const router = Router();

/**
 * Todas as rotas exigem JWT válido + perfil professional.
 * doc 02-regras-negocio.md seção 3.2: apenas o profissional cria e
 * gerencia seus próprios protocolos.
 */
router.use(authMiddleware, roleMiddleware(['professional']));

router.post('/',     validateCreate, controller.create);
router.get('/',                      controller.list);
router.get('/:id',                   controller.getById);
router.put('/:id',  validateUpdate,  controller.update);
router.delete('/:id',               controller.remove);

module.exports = router;