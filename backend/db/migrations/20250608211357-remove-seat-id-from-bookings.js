'use strict';
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Bookings', 'seat_id');
  },
  async down (queryInterface, Sequelize) {
    // Añadirla de nuevo si haces rollback
    await queryInterface.addColumn('Bookings', 'seat_id', {
      type: Sequelize.UUID,
      allowNull: false, // O como estaba antes
      references: { model: 'Seats', key: 'id' },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    });
  }
};