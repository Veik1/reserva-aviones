'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Seats', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      flight_offering_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'FlightOfferings', // Nombre de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // Si se elimina una oferta, sus asientos se eliminan
      },
      seat_number: {
        type: DataTypes.STRING(5),
        allowNull: false
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
      },
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

    // Asegurar unicidad de seat_number por flight_offering
    await queryInterface.addConstraint('Seats', {
      fields: ['flight_offering_id', 'seat_number'],
      type: 'unique',
      name: 'unique_seat_per_offering'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('Seats', 'unique_seat_per_offering');
    await queryInterface.dropTable('Seats');
  }
};