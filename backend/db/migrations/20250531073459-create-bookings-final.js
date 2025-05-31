'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Bookings', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true
      },
      booking_code: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
      },
      // flight_id se elimina, ahora referenciaremos FlightOfferings
      flight_offering_id: { // NUEVA FK
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'FlightOfferings', // Nombre de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE' // O SET NULL si una oferta se borra pero la reserva debe quedar
      },
      user_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Users', // Nombre de la tabla
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      seat: { // El asiento específico elegido
        type: DataTypes.STRING(4),
        allowNull: false
      },
      total_price: { // Este precio vendrá de la FlightOffering
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('confirmed', 'pending', 'canceled'),
        defaultValue: 'confirmed'
      },
      passenger_name: {
        type: DataTypes.STRING,
        allowNull: true // O false si siempre es obligatorio
      },
      passenger_last_name: {
        type: DataTypes.STRING,
        allowNull: true
      },
      passenger_email: {
        type: DataTypes.STRING,
        allowNull: true
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
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Bookings');
  }
};