// Arquivo: backend/src/modules/checkins/checkin.routes.js
const { Router } = require('express');
const rateLimit  = require('express-rate-limit');
const multer     = require('multer');
const { validateCreate } = require('./checkin.validation');
const controller         = require('./checkin.controller');
const { authMiddleware } = require('../../shared/middlewares/authMiddleware');
const { roleMiddleware } = require('../../shared/middlewares/roleMiddleware');
const { ValidationError } = require('../../shared/errors/ValidationError');

const router = Router();
const checkinLimiter = rateLimit({ windowMs:60*60*1000, max:10, standardHeaders:true, legacyHeaders:false });

// Fotos ficam em memória só até serem reprocessadas e gravadas (ver photo.service.js)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024, files: 3, fields: 10 },
  fileFilter: (req, file, cb) => {
    if (/^image\/(jpeg|png|webp|heic|heif)$/.test(file.mimetype)) return cb(null, true);
    cb(new ValidationError('Envie apenas fotos (JPG, PNG ou WEBP).'));
  },
});

router.post('/', checkinLimiter, upload.array('fotos', 3), validateCreate, controller.create);
router.get('/treatment/:tratamentoId', authMiddleware, roleMiddleware(['professional']), controller.listByTreatment);

module.exports = router;
