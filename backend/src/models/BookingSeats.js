'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BookingSeats = sequelize.define('BookingSeats', {
    // El ID es opcional aquí si las claves foráneas combinadas son la PK,
    // pero tener un ID propio es a menudo más simple.
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    booking_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Bookings', // Nombre de la tabla
        key: 'id'
      }
      // No necesitas definir onDelete/onUpdate aquí si ya están en la migración
    },
    seat_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Seats', // Nombre de la tabla
        key: 'id'
      }
    }
    // created_at y updated_at serán manejados por Sequelize
  }, {
    tableName: 'BookingSeats',
    timestamps: true,
    underscored: true,
    // No necesitamos una función 'associate' aquí porque es una tabla de unión pura.
    // Las asociaciones belongsToMany en Booking.js y Seat.js la manejan.
  });
  return BookingSeats;
};