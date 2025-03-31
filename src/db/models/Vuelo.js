const { Model, DataTypes } = require('sequelize');

class Vuelo extends Model {
  static init(sequelize) {
    return super.init(
      {
        numero_vuelo: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        origen: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        destino: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        fecha: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      { sequelize, modelName: 'Vuelo' }
    );
  }

  static associate(models) {
    this.hasMany(models.Reserva, { foreignKey: 'vueloId', as: 'reservas' });
  }
}

module.exports = Vuelo;