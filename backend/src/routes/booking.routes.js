'use strict';
const express = require('express');
const bookingController = require('../api/controllers/booking.controller.js');
const { verifyToken, authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

// Ruta para que el usuario autenticado obtenga SUS reservas
// Debe ir ANTES de /:id para que 'my' no se interprete como un ID
router.get('/my', verifyToken, bookingController.getMyBookings);

// Rutas para Administradores
// Obtener TODAS las reservas
router.get('/', verifyToken, authorizeRole('admin'), bookingController.getBookings);
// Actualizar una reserva (ej. cambiar estado). El controlador ya verifica si es admin.
router.put('/:id', verifyToken, /* authorizeRole('admin'), // El controlador ya tiene una lógica más específica */ bookingController.updateBooking);

// Rutas para usuarios autenticados (y potencialmente admin)
// Crear una nueva reserva
router.post('/', verifyToken, bookingController.createBooking);
// Obtener una reserva específica por ID
router.get('/:id', verifyToken, bookingController.getBookingById); // El controlador podría tener lógica de permisos
// Eliminar una reserva (el controlador verifica si es el dueño o admin)
router.delete('/:id', verifyToken, bookingController.deleteBooking);

module.exports = router;