const express = require('express');
const router = express.Router();
const vueloController = require('../controllers/vueloController');
const { body } = require('express-validator');

const validarVuelo = [
  body('numero_vuelo').notEmpty().withMessage('El número de vuelo es requerido'),
  body('origen').notEmpty().withMessage('El origen es requerido'),
  body('destino').notEmpty().withMessage('El destino es requerido'),
  body('fecha_salida').isISO8601().withMessage('Fecha de salida inválida'),
  body('fecha_llegada').isISO8601().withMessage('Fecha de llegada inválida'),
  body('asientos_disponibles').isInt({ min: 0 }).withMessage('Los asientos disponibles deben ser un número positivo'),
  body('precio').isDecimal({ min: 0 }).withMessage('El precio debe ser un número positivo')
];

router.get('/', vueloController.getVuelos);
router.get('/:id', vueloController.getVueloById);
router.post('/', validarVuelo, vueloController.createVuelo);
router.put('/:id', validarVuelo, vueloController.updateVuelo);
router.delete('/:id', vueloController.deleteVuelo);

module.exports = router;