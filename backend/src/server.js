require("dotenv").config();

const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const fs = require('fs');
const path = require('path');
const db = require("../db/database.js"); // DATABASE
const authRoutes = require("./routes/auth.routes.js");
const flightRoutes = require("./routes/flight.routes.js");
const bookingRoutes = require("./routes/booking.routes.js");

const app = express();
const PORT = process.env.PORT || 5000;

// Configurar morgan para registrar las solicitudes
const logDirectory = path.join(__dirname, '../logs');
fs.existsSync(logDirectory) || fs.mkdirSync(logDirectory);
const accessLogStream = fs.createWriteStream(path.join(logDirectory, 'access.log'), { flags: 'a' });
app.use(morgan('dev', { stream: accessLogStream }));

// Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173", "http://localhost:3000"], // Permite solicitudes desde tu frontend
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/flights", flightRoutes);
app.use("/api/bookings", bookingRoutes);

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor iniciado en el puerto ${PORT}`);
});
