'use strict';
const express = require('express');
const cityController = require('../api/controllers/city.controller.js');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// GET /api/cities - Obtener todas las ciudades (PÚBLICA para los filtros del frontend)
router.get('/', cityController.getCities);

// --- Opcional: Rutas CRUD para Ciudades (SOLO ADMIN) ---
router.post('/', verifyToken, authorizeRole('admin'), cityController.createCity);
router.put('/:cityId', verifyToken, authorizeRole('admin'), cityController.updateCity);
router.delete('/:cityId', verifyToken, authorizeRole('admin'), cityController.deleteCity);

module.exports = router;