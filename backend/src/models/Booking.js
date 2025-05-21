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
    // flight_id: { // <-- ELIMINADO, ahora se usa flight_offering_id
    //   type: DataTypes.UUID,
    //   allowNull: false
    // },
    flight_offering_id: { // <-- NUEVA FK
      type: DataTypes.UUID,
      allowNull: false
      // references ya está definido en la migración
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false
      // references ya está definido en la migración
    },
    seat: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    total_price: { // Este precio debe coincidir con el de FlightOffering en el momento de la reserva
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
    payment_method_id: {
      type: DataTypes.UUID,
      allowNull: false // Opcional, según si el pago es obligatorio al reservar
    },
  }, {
    tableName: 'Bookings',
    timestamps: true,
    underscored: true
  });

  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'user_id', // Corregido
      as: 'user'
    });
    // Booking.belongsTo(models.Flight, { // <-- ELIMINADO
    //   foreignKey: 'flight_id', // Corregido
    //   as: 'flight'
    // });
    Booking.belongsTo(models.FlightOffering, { // <-- NUEVA ASOCIACIÓN
      foreignKey: 'flight_offering_id',
      as: 'flightOffering' // Una reserva pertenece a una oferta específica
    });

    Booking.belongsTo(models.PaymentMethod, {
    foreignKey: 'payment_method_id',
    as: 'paymentMethod'
  });
  };
  

  
  return Booking;
};