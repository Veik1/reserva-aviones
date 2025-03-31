const { Model, DataTypes } = require('sequelize');

class Persona extends Model {
  static init(sequelize) {
    return super.init(
      {
        nombre: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        apellido: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        email: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true,
        },
      },
      { sequelize, modelName: 'Persona' }
    );
  }

  static associate(models) {
    this.hasMany(models.Reserva, { foreignKey: 'personaId', as: 'reservas' });
  }
}

module.exports = Persona;