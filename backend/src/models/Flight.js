const { DataTypes } = require('sequelize');

 module.exports = (sequelize) => {
  const Flight = sequelize.define('Flight', {
  id: {
  type: DataTypes.UUID,
  defaultValue: DataTypes.UUIDV4,
  primaryKey: true
  },
  flight_number: {
  type: DataTypes.STRING,
  allowNull: false,
  unique: true
  },
  origin: {
  type: DataTypes.STRING,
  allowNull: false
  },
  destination: {
  type: DataTypes.STRING,
  allowNull: false
  },
  departure_time: {
  type: DataTypes.DATE,
  allowNull: false
  },
  arrival_time: {
  type: DataTypes.DATE,
  allowNull: false
  },
  seats_available: {
  type: DataTypes.INTEGER,
  allowNull: false,
  defaultValue: 120
  },
  price: {
  type: DataTypes.DECIMAL(10, 2),
  allowNull: false
  }
  }, {
  tableName: 'Flights',
  timestamps: true,
  underscored: true
  });
  Flight.associate = (models) => {
  Flight.hasMany(models.Booking, {
  foreignKey: 'flightId',
  as: 'bookings'
  });
  };
  return Flight;
 };