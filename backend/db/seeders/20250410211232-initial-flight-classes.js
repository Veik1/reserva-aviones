'use strict';
const { v4: uuidv4 } = require('uuid');

// Pre-generamos IDs para poder referenciarlos en FlightOfferings
const economyClassId = uuidv4();
const premiumEconomyClassId = uuidv4();
const businessClassId = uuidv4();
const firstClassId = uuidv4();


module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('FlightClasses', [
      {
        id: economyClassId,
        name: 'Economica',
        description: 'Asiento estándar con servicios básicos.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: premiumEconomyClassId,
        name: 'Economica Premium',
        description: 'Más espacio para las piernas y mejor servicio que económica.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: businessClassId,
        name: 'Business',
        description: 'Asientos amplios, comida gourmet y servicios prioritarios.',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: firstClassId,
        name: 'Primera Clase',
        description: 'Lujo máximo, suites privadas y atención personalizada.',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightClasses', null, {});
  }
};

module.exports.ids = {
    economyClassId,
    premiumEconomyClassId,
    businessClassId,
    firstClassId
};