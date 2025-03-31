const { Model, DataTypes } = require('sequelize');

class Reserva extends Model {
  static init(sequelize) {
    return super.init(
      {
        personaId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        vueloId: {
          type: DataTypes.INTEGER,
          allowNull: false,
        },
        fecha_reserva: {
          type: DataTypes.DATE,
          allowNull: false,
        },
      },
      { sequelize, modelName: 'Reserva' }
    );
  }

  static associate(models) {
    this.belongsTo(models.Persona, { foreignKey: 'personaId', as: 'persona' });
    this.belongsTo(models.Vuelo, { foreignKey: 'vueloId', as: 'vuelo' });
  }
}

module.exports = Reserva;