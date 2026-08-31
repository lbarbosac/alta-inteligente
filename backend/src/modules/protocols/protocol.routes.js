// Arquivo: backend/src/modules/protocols/protocol.routes.js
const { Router } = require('express');
const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware } = require('../../shared/middlewares/roleMiddleware');
const { validateCreate,validateUpdate } = require('./protocol.validation');
const controller = require('./protocol.controller');

const router = Router();
router.use(authMiddleware, roleMiddleware(['professional']));

router.post('/',               validateCreate, controller.create);
router.get('/',                               controller.list);
router.get('/:id',                            controller.getById);
router.put('/:id',             validateUpdate, controller.update);
router.delete('/:id',                         controller.remove);
router.patch('/:id/reativar',                 controller.unarchive);
router.put('/:id/editar',                     controller.editar);

module.exports = router;