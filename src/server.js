const express = require('express');
const cors = require('cors');
const personaRoutes = require('./api/routes/personaRoutes');
const vueloRoutes = require('./api/routes/vueloRoutes');
const reservaRoutes = require('./api/routes/reservaRoutes');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/personas', personaRoutes);
app.use('/api/vuelos', vueloRoutes);
app.use('/api/reservas', reservaRoutes);

// Middleware para rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ error: `Ruta no encontrada: ${req.originalUrl}` });
});

// Iniciar el servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});