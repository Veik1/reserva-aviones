'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const City = sequelize.define('City', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true // Generalmente el nombre de la ciudad es único, o combinado con país
    },
    country_code: { // Código de país ISO 3166-1 alfa-2 (ej. AR, US, ES)
      type: DataTypes.STRING(2),
      allowNull: true // Podría ser obligatorio si quieres más precisión
    }

  }, {
    tableName: 'Cities',
    timestamps: true,
    underscored: true
  });

  City.associate = (models) => {
    City.hasMany(models.Airport, {
      foreignKey: 'city_id',
      as: 'airports'
    });
  };

  return City;
};