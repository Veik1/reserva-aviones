const express = require('express');
const router = express.Router();
const paymentController = require('../api/controllers/payment.controller');

router.post('/', paymentController.createPaymentMethod);
router.get('/all', paymentController.getAllPaymentMethods);
router.get('/:user_id', paymentController.getUserPaymentMethods);
router.put('/:id', paymentController.updatePaymentMethod);
router.delete('/:id', paymentController.deletePaymentMethod);

module.exports = router;