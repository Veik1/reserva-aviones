const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.bulkInsert('Bookings', [
      {
        id: uuidv4(),
        booking_code: 'BOOK-12345',
        flight_id: '04d228b8-dd00-43cf-8df8-c65c1db94adb', // Reemplaza con un ID de vuelo existente
        user_id: '42232c79-985d-4669-aa14-14d8af2604d9',   // Reemplaza con un ID de usuario existente
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
        flight_id: '077bb5bf-4ad1-4b6e-b208-566c103d4ca6', // Reemplaza con otro ID de vuelo existente
        user_id: '42232c79-985d-4669-aa14-14d8af2604d9',   // Reemplaza con otro ID de usuario existente
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