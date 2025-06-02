'use strict';
require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require('fs');
const path = require('path');
// const db = require("../db/database.js"); // No necesitas importar 'db' aquí si solo usas los modelos
const authRoutes = require("./routes/auth.routes.js");
const flightRoutes = require("./routes/flight.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");
// --- NUEVA IMPORTACIÓN DE RUTA ---
const flightOfferingRoutes = require("./routes/flightoffering.routes.js"); // Asegúrate que el path sea correcto
const flightClassRoutes = require("./routes/flightclass.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar morgan para registrar las solicitudes
const logDirectory = path.join(__dirname, '../logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
// Usar morgan para la consola y para el archivo
app.use(morgan('dev')); // Para la consola
app.use(morgan('combined', { stream: accessLogStream })); // Para el archivo

// Middlewares
app.use(
  cors({
    // Es más seguro ser específico, pero para desarrollo, puedes ser más permisivo
    // origin: ["http://localhost:5173", "http://localhost:3000"],
    origin: function (origin, callback) {
      // Permitir solicitudes sin 'origin' (como Postman o apps móviles) o de dominios específicos
      const allowedOrigins = ["http://localhost:5173", "http://localhost:3000"];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    allowedHeaders: ["Content-Type", "Authorization"],
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE", // Asegúrate de permitir todos los métodos necesarios
    credentials: true // Si usas cookies o sesiones
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);
// --- AÑADIR USO DE NUEVA RUTA ---
app.use("/api/flightofferings", flightOfferingRoutes);
app.use("/api/flightclasses", flightClassRoutes);

// Middleware para manejar errores de JSON malformado (opcional pero bueno)
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'JSON malformado' });
  }
  next();
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});