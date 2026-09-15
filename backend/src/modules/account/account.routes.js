// Arquivo: backend/src/modules/account/account.routes.js
const { Router } = require('express');
const controller = require('./account.controller');
const { validatePreferencias, validateTermos } = require('./account.validation');
const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware } = require('../../shared/middlewares/roleMiddleware');

const router = Router();

// Conta do profissional logado
router.use(authMiddleware, roleMiddleware(['professional']));

/** GET /api/v1/account/preferencias — horário do lembrete, alertas e situação dos termos */
router.get('/preferencias', controller.preferencias);

/** PATCH /api/v1/account/preferencias — { horaLembrete?, alertasEmail? } */
router.patch('/preferencias', validatePreferencias, controller.atualizarPreferencias);

/** POST /api/v1/account/termos — { versao } aceite dos termos de uso e do contrato de tratamento de dados */
router.post('/termos', validateTermos, controller.aceitarTermos);

module.exports = router;
