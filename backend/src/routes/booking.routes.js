
const express = require('express');
const bookingController = require('../api/controllers/booking.controller.js');
const { verifyToken,authorizeRole } = require('../middlewares/auth.middleware.js');

const router = express.Router();

console.log('verifyToken:', typeof verifyToken); // Debería ser 'function'
console.log('bookingController.createBooking:', typeof bookingController.createBooking);
console.log('bookingController.getBookings:', typeof bookingController.getBookings);

// Ruta protegida para administradores para obtener todas las reservas
router.get('/', verifyToken, authorizeRole('admin'), bookingController.getBookings);
router.get('/my', verifyToken, bookingController.getMyBookings);
router.post('/', verifyToken, bookingController.createBooking);
router.get('/:id', verifyToken, bookingController.getBookingById);
router.put('/:id', verifyToken, bookingController.updateBooking);
router.delete('/:id', verifyToken, bookingController.deleteBooking); // Protege la eliminación también

module.exports = router;