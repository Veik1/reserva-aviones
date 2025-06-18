'use strict';
const express = require('express');
const {
    createFlightOffering,
    getOfferingsByFlight,
    updateFlightOffering,
    deleteFlightOffering,
    getSeatsByOfferingId
} = require('../api/controllers/flightoffering.controller.js'); // Asegúrate que el path sea correcto
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// --- Rutas para FlightOfferings ---

// GET /api/flightofferings/flight/:flightId - Obtener todas las ofertas para un vuelo específico (PÚBLICO o protegido por verifyToken si es necesario)
// Lo hacemos público para que el frontend pueda cargar las opciones al ver detalles de un vuelo
router.get('/flight/:flightId', getOfferingsByFlight);

router.get('/:offeringId/seats', getSeatsByOfferingId); // Obtener asientos para una oferta

// POST /api/flightofferings - Crear una nueva oferta de clase para un vuelo (SOLO ADMIN)
router.post('/', verifyToken, authorizeRole('admin'), createFlightOffering);

// PUT /api/flightofferings/:offeringId - Actualizar una oferta de clase (SOLO ADMIN)
router.put('/:offeringId', verifyToken, authorizeRole('admin'), updateFlightOffering);

// DELETE /api/flightofferings/:offeringId - Eliminar una oferta de clase (SOLO ADMIN)
router.delete('/:offeringId', verifyToken, authorizeRole('admin'), deleteFlightOffering);

module.exports = router;