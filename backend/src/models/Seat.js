// backend/src/models/Seat.js
'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Seat = sequelize.define('Seat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    flight_offering_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    seat_number: {
      type: DataTypes.STRING(5),
      allowNull: false
    },
    is_available: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
      allowNull: false
    }
  }, {
    tableName: 'Seats',
    timestamps: true,
    underscored: true,
    indexes: [
      {
        unique: true,
        fields: ['flight_offering_id', 'seat_number']
      }
    ]
  });

  Seat.associate = (models) => {
  Seat.belongsTo(models.FlightOffering, {
    foreignKey: 'flight_offering_id',
    as: 'flightOffering'
  });
  // Asegúrate de que la asociación con Booking (belongsToMany) esté correcta
  Seat.belongsToMany(models.Booking, {
    through: 'BookingSeats',
    foreignKey: 'seat_id',
    otherKey: 'booking_id',
    as: 'bookings'
  });
};

  return Seat;
};