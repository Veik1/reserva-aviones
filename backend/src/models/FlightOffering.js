'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FlightOffering = sequelize.define('FlightOffering', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    flight_id: { // FK a Flights
      type: DataTypes.UUID,
      allowNull: false
      // references ya está definido en la migración
    },
    flight_class_id: { // FK a FlightClasses
      type: DataTypes.UUID,
      allowNull: false
      // references ya está definido en la migración
    },
    seats_available: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 0 // No puede haber asientos negativos
      }
    },
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0
      }
    }
    // created_at y updated_at serán manejados por timestamps:true y underscored:true
  }, {
    tableName: 'FlightOfferings',
    timestamps: true,
    underscored: true
  });

  FlightOffering.associate = (models) => {
    FlightOffering.belongsTo(models.Flight, {
      foreignKey: 'flight_id',
      as: 'flight'
    });
    FlightOffering.belongsTo(models.FlightClass, {
      foreignKey: 'flight_class_id',
      as: 'flightClass' // Alias para acceder a la clase desde una oferta
    });
    FlightOffering.hasMany(models.Booking, { // Una oferta puede tener muchas reservas
      foreignKey: 'flight_offering_id',
      as: 'bookings'
    });
    FlightOffering.hasMany(models.Seat, {
      foreignKey: 'flight_offering_id',
      as: 'seats' // Una oferta tiene muchos asientos
    });
  };

  return FlightOffering;
};