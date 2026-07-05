const { Router } = require('express');

const router = Router();

// ── Módulo de Autenticação ─────────────────────────────────────────────────
router.use('/auth',          require('../modules/auth/auth.routes'));

// ── Módulo de Profissionais (admin) ───────────────────────────────────────
router.use('/professionals', require('../modules/professionals/professional.routes'));

// ── Módulo de Pacientes ───────────────────────────────────────────────────
router.use('/patients',      require('../modules/patients/patient.routes'));

// ── Módulo de Protocolos ──────────────────────────────────────────────────
router.use('/protocols',     require('../modules/protocols/protocol.routes'));

// ── Módulo de Tratamentos ─────────────────────────────────────────────────
router.use('/treatments',    require('../modules/treatments/treatment.routes'));

// ── Portal do Paciente ────────────────────────────────────────────────────
router.use('/patient',       require('../modules/patient-portal/patientPortal.routes'));

// ── Check-ins ─────────────────────────────────────────────────────────────
router.use('/checkins',      require('../modules/checkins/checkin.routes'));

// ── Dashboard ─────────────────────────────────────────────────────────────
router.use('/dashboard',     require('../modules/dashboard/dashboard.routes'));

module.exports = { router };