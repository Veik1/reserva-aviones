"use strict";
module.exports = (sequelize, DataTypes) => {
  const Airport = sequelize.define(
    "Airport",
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
      iata_code: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      city_id: {
        type: DataTypes.UUID,
        allowNull: false,
      },
    },
    {
      tableName: "Airports",
      underscored: true,
    }
  );
  Airport.associate = function (models) {
    Airport.belongsTo(models.City, { foreignKey: "city_id", as: "city" });
  };
  return Airport;
};
