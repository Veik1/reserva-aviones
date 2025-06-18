'use strict';
const express = require('express');
const flightClassController = require('../api/controllers/flightclass.controller.js');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// GET /api/flightclasses - Obtener todas las clases de vuelo
// --- Hacemos esta ruta PÚBLICA ---
router.get('/', flightClassController.getFlightClasses); // Se quitó verifyToken de aquí

// Rutas CRUD opcionales (SOLO ADMIN)
router.post('/', verifyToken, authorizeRole('admin'), flightClassController.createFlightClass);
router.put('/:classId', verifyToken, authorizeRole('admin'), flightClassController.updateFlightClass);
router.delete('/:classId', verifyToken, authorizeRole('admin'), flightClassController.deleteFlightClass);


module.exports = router;