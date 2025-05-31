"use strict";
module.exports = (sequelize, DataTypes) => {
  const City = sequelize.define(
    "City",
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      country_code: DataTypes.STRING,
    },
    {
      tableName: "Cities",
      underscored: true,
    }
  );
  City.associate = function (models) {
    City.hasMany(models.Airport, { foreignKey: "city_id", as: "airports" });
  };
  return City;
};
