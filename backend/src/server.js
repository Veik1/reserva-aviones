
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const db = require('../db/database.js'); // Asegúrate de que la ruta sea correcta
const authRoutes = require('./routes/auth.routes.js');
const flightRoutes = require('./routes/flight.routes.js');
const bookingRoutes = require('./routes/booking.routes.js');

const app = express();

const PORT = process.env.PORT || 5000;
// Middlewares
app.use(cors({
    origin: 'http://localhost:3000', // Permite solicitudes desde tu frontend
    allowedHeaders: ['Content-Type', 'Authorization'], // Asegúrate de que Authorization esté aquí
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/flights', flightRoutes);
app.use('/api/bookings', bookingRoutes);
// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});