'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('FlightOfferings', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      flight_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Flights', // Nombre de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      flight_class_id: { // Referencia a FlightClasses
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'FlightClasses', // Nombre de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      seats_available: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
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

    // Opcional: Crear un índice compuesto para evitar duplicados de clase por vuelo
    await queryInterface.addConstraint('FlightOfferings', {
      fields: ['flight_id', 'flight_class_id'],
      type: 'unique',
      name: 'unique_flight_class_offering'
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeConstraint('FlightOfferings', 'unique_flight_class_offering');
    await queryInterface.dropTable('FlightOfferings');
  }
};