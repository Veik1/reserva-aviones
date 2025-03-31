'use strict';

module.exports = {
  async up(queryInterface) {
    // Reiniciar el contador de IDs
    await queryInterface.sequelize.query('TRUNCATE TABLE "Reservas" RESTART IDENTITY CASCADE;');

    // Insertar reservas
    await queryInterface.bulkInsert('Reservas', [
      {
        personaId: 1, // ID de la primera persona
        vueloId: 1,   // ID del primer vuelo
        fecha_reserva: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        personaId: 2, // ID de la segunda persona
        vueloId: 2,   // ID del segundo vuelo
        fecha_reserva: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Reservas', null, {});
  },
};