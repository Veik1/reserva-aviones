'use strict';
const { DataTypes } = require('sequelize');

 module.exports = (sequelize) => {
  const Flight = sequelize.define('Flight', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
    allowNull: false
  },
  flight_number: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  origin: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destination: {
    type: DataTypes.STRING,
    allowNull: false
  },
  departure_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  arrival_time: {
    type: DataTypes.DATE,
    allowNull: false
  },
  image_url: {
    type: DataTypes.STRING,
    allowNull: true,
    validate: {
      isUrl: true
    }
  }
  // 'seats_available' y 'price' eliminados del modelo
  }, {
  tableName: 'Flights',
  timestamps: true,
  underscored: true
  });

  Flight.associate = (models) => {
    // La asociación directa con Booking se eliminará, ya que ahora Booking se asocia con FlightOffering
    // Flight.hasMany(models.Booking, {
    //   foreignKey: 'flight_id', // Corregido
    //   as: 'bookings'
    // });

    Flight.hasMany(models.FlightOffering, { // Nueva asociación
      foreignKey: 'flight_id',
      as: 'offerings' // Un vuelo tiene muchas ofertas de clase
    });
  };
  return Flight;
 };