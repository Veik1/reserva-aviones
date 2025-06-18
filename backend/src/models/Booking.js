'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    booking_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    flight_offering_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
    },
    // --- CAMBIO CLAVE: Eliminamos seat_id directamente de Booking ---
    // seat_id: {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    //   references: {
    //     model: 'Seats',
    //     key: 'id'
    //   },
    //   onUpdate: 'CASCADE',
    //   onDelete: 'RESTRICT'
    // },
    // --- FIN CAMBIO CLAVE ---
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'pending', 'canceled'),
      defaultValue: 'confirmed'
    },
    passenger_name: { type: DataTypes.STRING, allowNull: true },
    passenger_last_name: { type: DataTypes.STRING, allowNull: true },
    passenger_email: { type: DataTypes.STRING, allowNull: true }
  }, {
    tableName: 'Bookings',
    timestamps: true,
    underscored: true
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
    Booking.belongsTo(models.FlightOffering, {
      foreignKey: 'flight_offering_id',
      as: 'flightOffering'
    });
    // --- CAMBIO CLAVE: Eliminamos belongsTo(Seat) y añadimos belongsToMany ---
    // Booking.belongsTo(models.Seat, {
    //   foreignKey: 'seat_id',
    //   as: 'seat'
    // });
    Booking.belongsToMany(models.Seat, { // Una reserva tiene muchos asientos
      through: 'BookingSeats', // A través de la tabla intermedia BookingSeats
      foreignKey: 'booking_id', // Clave foránea en BookingSeats que apunta a Bookings
      otherKey: 'seat_id', // Clave foránea en BookingSeats que apunta a Seats
      as: 'seats' // Alias para acceder a los asientos desde una reserva
    });
    // --- FIN CAMBIO CLAVE ---
  };
  return Booking;
};