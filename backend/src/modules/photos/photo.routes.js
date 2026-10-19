// Arquivo: backend/src/modules/photos/photo.routes.js
const { Router } = require('express');
const controller = require('./photo.controller');

const router = Router();

router.get('/:id', controller.show);

module.exports = router;
