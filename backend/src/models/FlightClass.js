'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const FlightClass = sequelize.define('FlightClass', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: { // ej: Economica, Premium, Business
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    }
    // created_at y updated_at serán manejados por timestamps:true y underscored:true
  }, {
    tableName: 'FlightClasses',
    timestamps: true,
    underscored: true
  });

  FlightClass.associate = (models) => {
    FlightClass.hasMany(models.FlightOffering, {
      foreignKey: 'flight_class_id',
      as: 'offerings' // Una clase puede estar en muchas ofertas de vuelo
    });
  };

  return FlightClass;
};