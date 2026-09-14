// Arquivo: backend/src/modules/treatments/treatment.routes.js
const { Router } = require('express');
const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware } = require('../../shared/middlewares/roleMiddleware');
const controller = require('./treatment.controller');
const { validateCreate, validateUpdate } = require('./treatment.validation');

const router = Router();

router.use(authMiddleware, roleMiddleware(['professional']));

router.post('/', validateCreate, controller.create);
router.get('/', controller.list);
router.get('/:id', controller.getById);
router.patch('/:id', validateUpdate, controller.update);

module.exports = router;