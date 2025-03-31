'use strict';

module.exports = {
  async up(queryInterface) {
    // Reiniciar el contador de IDs
    await queryInterface.sequelize.query('TRUNCATE TABLE "Personas" RESTART IDENTITY CASCADE;');

    // Insertar personas
    await queryInterface.bulkInsert('Personas', [
      {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: 'juan.perez@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        nombre: 'Ana',
        apellido: 'Gómez',
        email: 'ana.gomez@example.com',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ]);
  },

  async down(queryInterface) {
    await queryInterface.bulkDelete('Personas', null, {});
  },
};