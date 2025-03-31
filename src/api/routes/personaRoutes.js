const express = require('express');
const { body } = require('express-validator');
const personaController = require('../controllers/personaController');

const router = express.Router();

const personaValidations = [
  body('nombre').notEmpty().withMessage('El nombre es obligatorio'),
  body('apellido').notEmpty().withMessage('El apellido es obligatorio'),
  body('email').isEmail().withMessage('El email debe ser válido'),
];

// Rutas
router.get('/', personaController.getPersonas); // Obtener todas las personas
router.get('/:id', personaController.getPersonaById); // Obtener una persona por ID
router.post('/', personaValidations, personaController.createPersona); // Crear una nueva persona
router.put('/:id', personaValidations, personaController.updatePersona); // Actualizar una persona existente
router.delete('/:id', personaController.deletePersona); // Eliminar una persona

module.exports = router;