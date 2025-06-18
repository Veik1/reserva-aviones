'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Airport = sequelize.define('Airport', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: { // Nombre completo del aeropuerto
      type: DataTypes.STRING,
      allowNull: false
    },
    iata_code: { // Código IATA de 3 letras
      type: DataTypes.STRING(3),
      allowNull: false,
      unique: true
    },
    city_id: { // Clave foránea a la tabla Cities
      type: DataTypes.UUID,
      allowNull: false
      // La referencia se define en la migración
    }
    // created_at y updated_at serán manejados por Sequelize
  }, {
    tableName: 'Airports',
    timestamps: true,
    underscored: true
  });

  Airport.associate = (models) => {
    Airport.belongsTo(models.City, {
      foreignKey: 'city_id',
      as: 'city'
    });
    // Un aeropuerto puede ser origen de muchos vuelos
    Airport.hasMany(models.Flight, {
      foreignKey: 'origin_airport_id',
      as: 'departingFlights'
    });
    // Un aeropuerto puede ser destino de muchos vuelos
    Airport.hasMany(models.Flight, {
      foreignKey: 'destination_airport_id',
      as: 'arrivingFlights'
    });
  };

  return Airport;
};