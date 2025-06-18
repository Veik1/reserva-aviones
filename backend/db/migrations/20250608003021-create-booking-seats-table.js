'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('BookingSeats', {
      id: { // Un ID para cada entrada en la tabla intermedia (opcional pero buena práctica)
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      booking_id: { // FK a la tabla Bookings
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Bookings',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si la reserva se borra, sus enlaces a asientos se borran
      },
      seat_id: { // FK a la tabla Seats
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Seats',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // Un asiento no debe eliminarse si hay reservas vinculadas a él
      },
      // Opcional: Podrías añadir aquí información específica de este asiento para esta reserva,
      // como el precio final pagado por este asiento si hubiera descuentos/aumentos por asiento.
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Asegurar que una combinación booking_id-seat_id sea única
    await queryInterface.addConstraint('BookingSeats', {
      fields: ['booking_id', 'seat_id'],
      type: 'unique',
      name: 'unique_booking_seat'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('BookingSeats', 'unique_booking_seat');
    await queryInterface.dropTable('BookingSeats');
  }
};