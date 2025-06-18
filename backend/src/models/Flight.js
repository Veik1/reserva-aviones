// backend/src/models/Flight.js
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
    // 'origin' y 'destination' como strings eliminados
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
    },
    // Nuevas claves foráneas para aeropuertos
    origin_airport_id: {
      type: DataTypes.UUID,
      allowNull: false // O true si lo dejaste así en la migración y lo manejarás
      // La referencia a la tabla 'Airports' ya está en la migración
    },
    destination_airport_id: {
      type: DataTypes.UUID,
      allowNull: false // O true
      // La referencia a la tabla 'Airports' ya está en la migración
    }
  }, {
    tableName: 'Flights',
    timestamps: true,
    underscored: true
  });

  Flight.associate = (models) => {
    Flight.hasMany(models.FlightOffering, {
      foreignKey: 'flight_id',
      as: 'offerings'
    });

    // Nuevas asociaciones con Airport
    Flight.belongsTo(models.Airport, {
      foreignKey: 'origin_airport_id',
      as: 'originAirport' // Alias para el aeropuerto de origen
    });
    Flight.belongsTo(models.Airport, {
      foreignKey: 'destination_airport_id',
      as: 'destinationAirport' // Alias para el aeropuerto de destino
    });
  };

  return Flight;
};