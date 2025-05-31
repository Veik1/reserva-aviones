'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Obtener todos los vuelos y clases
    const flights = await queryInterface.sequelize.query(
      'SELECT id, flight_number FROM "Flights";',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const flightClasses = await queryInterface.sequelize.query(
      'SELECT id, name FROM "FlightClasses";',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 2. Crear un offering para cada vuelo y cada clase
    const offerings = [];
    for (const flight of flights) {
      for (const flightClass of flightClasses) {
        // Puedes personalizar los precios por clase aquí:
        let basePrice = 200;
        if (flightClass.name.toLowerCase().includes('premium')) basePrice = 350;
        if (flightClass.name.toLowerCase().includes('business')) basePrice = 600;
        if (flightClass.name.toLowerCase().includes('primera')) basePrice = 900;

        offerings.push({
          id: uuidv4(),
          flight_id: flight.id,
          flight_class_id: flightClass.id,
          seats_available: 20,
          price: (basePrice + Math.floor(Math.random() * 100)).toFixed(2),
          created_at: new Date(),
          updated_at: new Date()
        });
      }
    }

    await queryInterface.bulkInsert('FlightOfferings', offerings, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightOfferings', null, {});
  }
};