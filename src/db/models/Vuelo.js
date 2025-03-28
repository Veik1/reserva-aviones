const { DataTypes } = require('sequelize');
const sequelize = require('../../config/database');

const Vuelo = sequelize.define('Vuelo', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  numero_vuelo: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  origen: {
    type: DataTypes.STRING,
    allowNull: false
  },
  destino: {
    type: DataTypes.STRING,
    allowNull: false
  },
  fecha_salida: {
    type: DataTypes.DATE,
    allowNull: false
  },
  fecha_llegada: {
    type: DataTypes.DATE,
    allowNull: false
  },
  asientos_disponibles: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  precio: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'vuelos',
  timestamps: true
});

module.exports = Vuelo;