'use strict';

module.exports = {
  async up(queryInterface) {
    // Reiniciar el contador de IDs
    await queryInterface.sequelize.query('TRUNCATE TABLE "Vuelos" RESTART IDENTITY CASCADE;');

    // Insertar vuelos
    await queryInterface.bulkInsert('Vuelos', [
      {
        numero_vuelo: 'AA123',
        origen: 'Buenos Aires',
        destino: 'Madrid',
        fecha: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        numero_vuelo: 'BB456',
        origen: 'Londres',
        destino: 'París',
        fecha: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Vuelos', null, {});
  },
};