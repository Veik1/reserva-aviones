const express = require('express');
const { createFlight, getFlights, getFlightById, updateFlight, deleteFlight } = require('../api/controllers/flight.controller.js');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

router.get('/', getFlights);
router.get('/:id', getFlightById);

// Rutas protegidas para administradores
router.post('/', verifyToken, authorizeRole('admin'), createFlight);
router.put('/:id', verifyToken, authorizeRole('admin'), updateFlight);
router.delete('/:id', verifyToken, authorizeRole('admin'), deleteFlight);

module.exports = router;