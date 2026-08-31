// Arquivo: backend/src/modules/checkins/checkin.routes.js
const { Router } = require('express');
const rateLimit  = require('express-rate-limit');
const { validateCreate } = require('./checkin.validation');
const controller         = require('./checkin.controller');
const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware } = require('../../shared/middlewares/roleMiddleware');

const router = Router();
const checkinLimiter = rateLimit({ windowMs:60*60*1000, max:10, standardHeaders:true, legacyHeaders:false });

router.post('/', checkinLimiter, validateCreate, controller.create);
router.get('/treatment/:tratamentoId', authMiddleware, roleMiddleware(['professional']), controller.listByTreatment);

module.exports = router;