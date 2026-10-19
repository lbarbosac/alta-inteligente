// Arquivo: backend/src/routes/index.js
const { Router } = require('express');

const router = Router();

router.use('/auth',          require('../modules/auth/auth.routes'));
router.use('/professionals', require('../modules/professionals/professional.routes'));
router.use('/patients',      require('../modules/patients/patient.routes'));
router.use('/protocols',     require('../modules/protocols/protocol.routes'));
router.use('/treatments',    require('../modules/treatments/treatment.routes'));
router.use('/patient',       require('../modules/patient-portal/patientPortal.routes'));
router.use('/checkins',      require('../modules/checkins/checkin.routes'));
router.use('/dashboard',     require('../modules/dashboard/dashboard.routes'));
router.use('/fotos',         require('../modules/photos/photo.routes'));
router.use('/account',       require('../modules/account/account.routes'));
router.use('/cron',          require('../modules/notifications/notification.routes'));

module.exports = { router };

