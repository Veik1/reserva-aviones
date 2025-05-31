"use strict";
module.exports = (sequelize, DataTypes) => {
  const Flight = sequelize.define(
    "Flight",
    {
      id: {
        type: DataTypes.UUID,
        primaryKey: true,
        allowNull: false,
        defaultValue: DataTypes.UUIDV4,
      },
      flight_number: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      origin_airport_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      destination_airport_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
      departure_time: DataTypes.DATE,
      arrival_time: DataTypes.DATE,
      image_url: DataTypes.STRING,
      created_at: DataTypes.DATE,
      updated_at: DataTypes.DATE,
    },
    {
      tableName: "Flights",
      underscored: true,
    }
  );

  Flight.associate = function (models) {
    Flight.belongsTo(models.Airport, {
      foreignKey: "origin_airport_id",
      as: "originAirport",
    });
    Flight.belongsTo(models.Airport, {
      foreignKey: "destination_airport_id",
      as: "destinationAirport",
    });
    Flight.hasMany(models.FlightOffering, {
      foreignKey: "flight_id",
      as: "offerings",
    });
  };

  return Flight;
};
