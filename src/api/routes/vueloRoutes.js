const express = require('express');
const vuelosController = require('../controllers/vueloController');
const { vueloValidations } = require('../middlewares/validations');

const router = express.Router();

// Rutas
router.get('/', vuelosController.getVuelos); // Obtener todos los vuelos
router.get('/:id', vuelosController.getVueloById); // Obtener un vuelo por ID
router.post('/', vueloValidations, vuelosController.createVuelo); // Crear un nuevo vuelo
router.put('/:id', vueloValidations, vuelosController.updateVuelo); // Actualizar un vuelo existente
router.delete('/:id', vuelosController.deleteVuelo); // Eliminar un vuelo

module.exports = router;