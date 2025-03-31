const express = require('express');
const { body } = require('express-validator');
const reservaController = require('../controllers/reservaController');

const router = express.Router();

// Validaciones para crear y actualizar reservas
const reservaValidations = [
  body('personaId').isInt().withMessage('El ID de la persona debe ser un número entero'),
  body('vueloId').isInt().withMessage('El ID del vuelo debe ser un número entero'),
  body('fecha_reserva').isISO8601().withMessage('La fecha de reserva debe ser válida'),
];

// Rutas
router.get('/', reservaController.getReservas); // Obtener todas las reservas
router.get('/:id', reservaController.getReservaById); // Obtener una reserva por ID
router.post('/', reservaValidations, reservaController.createReserva); // Crear una nueva reserva
router.put('/:id', reservaValidations, reservaController.updateReserva); // Actualizar una reserva existente
router.delete('/:id', reservaController.deleteReserva); // Eliminar una reserva

module.exports = router;