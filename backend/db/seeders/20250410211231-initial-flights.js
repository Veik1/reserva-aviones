const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');
 

module.exports = {
  up: async (queryInterface, Sequelize) => {
  return queryInterface.bulkInsert('Flights', [
  {
  id: uuidv4(),
  flight_number: 'AA102',
  origin: 'Nueva York',
  destination: 'Los Ángeles',
  departure_time: new Date(Date.now() + 86400000), // Mañana
  arrival_time: new Date(Date.now() + 97200000),   // Mañana + 3 horas
  seats_available: 150,
  price: 350.75,
  created_at: new Date(),
  updated_at: new Date()
  },
  {
  id: uuidv4(),
  flight_number: 'BB203',
  origin: 'Miami',
  destination: 'Chicago',
  departure_time: new Date(Date.now() + 172800000), // En dos días
  arrival_time: new Date(Date.now() + 190080000),   // En dos días + 5 horas
  seats_available: 120,
  price: 280.20,
  created_at: new Date(),
  updated_at: new Date()
  }
  ], {});
  },
 

  down: async (queryInterface, Sequelize) => {
  return queryInterface.bulkDelete('Flights', null, {});
  }
 };