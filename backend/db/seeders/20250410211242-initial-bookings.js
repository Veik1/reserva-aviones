const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Bookings', [
      {
        id: uuidv4(),
        booking_code: 'BOOK-12345',
        flight_id: '8906ccb9-30bc-4000-a191-cc7b000b0a93', // Reemplaza con un ID de vuelo existente
        user_id: 'af120ed4-00fa-43c4-9d7e-01456da4ac20',   // Reemplaza con un ID de usuario existente
        seat: '15B',
        total_price: 150.50,
        status: 'confirmed',
        passenger_name: 'Usuario 1',       // Agregar nombre del pasajero
        passenger_last_name: 'Prueba', // Agregar apellido del pasajero
        passenger_email: 'usuario1@example.com', // Agregar email del pasajero
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        booking_code: 'BOOK-67890',
        flight_id: 'bc14d119-ae45-4925-99a1-d1af13a10910', // Reemplaza con otro ID de vuelo existente
        user_id: '4e8368f1-0b21-4cb1-986f-def09560cf90',   // Reemplaza con otro ID de usuario existente
        seat: '22C',
        total_price: 280.20,
        status: 'pending',
        passenger_name: 'Usuario 2',      // Agregar nombre del pasajero
        passenger_last_name: 'Prueba', // Agregar apellido del pasajero
        passenger_email: 'usuario2@example.com', // Agregar email del pasajero
        created_at: new Date(),
        updated_at: new Date()
      }
      // ... Agrega más reservas con la información del pasajero ...
    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Bookings', null, {});
  }
};