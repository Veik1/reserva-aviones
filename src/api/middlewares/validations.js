const { body } = require('express-validator');

const vueloValidations = [
  body('numero_vuelo').notEmpty().withMessage('El número de vuelo es obligatorio'),
  body('origen').notEmpty().withMessage('El origen es obligatorio'),
  body('destino').notEmpty().withMessage('El destino es obligatorio'),
  body('fecha').isISO8601().withMessage('La fecha debe ser válida (ISO 8601)'),
];

const personaValidations = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
  body('email').isEmail().withMessage('El email debe ser válido'),
];

const reservaValidations = [
  body('personaId').isInt().withMessage('El ID de la persona debe ser un número entero'),
  body('vueloId').isInt().withMessage('El ID del vuelo debe ser un número entero'),
  body('fecha_reserva').isISO8601().withMessage('La fecha de reserva debe ser válida'),
];

module.exports = {
  vueloValidations,
  personaValidations,
  reservaValidations,
};