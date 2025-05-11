'use strict';
const express = require('express');
const {
    createFlight,
    getFlights,
    getFlightById,
    updateFlight,
    deleteFlight
} = require('../api/controllers/flight.controller.js');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// --- RUTAS PÚBLICAS ---
// Estas rutas NO deben requerir verifyToken
router.get('/', getFlights);        // Obtener todos los vuelos (con sus ofertas)
router.get('/:id', getFlightById);  // Obtener un vuelo específico (con sus ofertas)

// --- RUTAS PROTEGIDAS PARA ADMINISTRADORES ---
// Estas rutas SÍ requieren verifyToken y authorizeRole
router.post('/', verifyToken, authorizeRole('admin'), createFlight);
router.put('/:id', verifyToken, authorizeRole('admin'), updateFlight);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteFlight);

module.exports = router;