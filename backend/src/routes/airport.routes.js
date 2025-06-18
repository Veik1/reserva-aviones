'use strict';
const express = require('express');
const airportController = require('../api/controllers/airport.controller.js');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// GET /api/airports - Obtener todos los aeropuertos (o filtrados por cityId/search)
// PÚBLICA para los filtros del frontend
router.get('/', airportController.getAirports);

// --- Opcional: Rutas CRUD para Aeropuertos (SOLO ADMIN) ---
router.post('/', verifyToken, authorizeRole('admin'), airportController.createAirport);
router.put('/:airportId', verifyToken, authorizeRole('admin'), airportController.updateAirport);
router.delete('/:airportId', verifyToken, authorizeRole('admin'), airportController.deleteAirport);

module.exports = router;