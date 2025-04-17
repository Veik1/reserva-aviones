const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    booking_code: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    flight_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Flights',
        key: 'id'
      }
    },
    user_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    seat: {
      type: DataTypes.STRING(4),
      allowNull: false
    },
    total_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'pending', 'canceled'),
      defaultValue: 'confirmed'
    },
    passenger_name: { // Agregar campo nombre del pasajero
      type: DataTypes.STRING,
      allowNull: true
    },
    passenger_last_name: { // Agregar campo apellido del pasajero
      type: DataTypes.STRING,
      allowNull: true
    },
    passenger_email: { // Agregar campo email del pasajero
      type: DataTypes.STRING,
      allowNull: true
    }
  }, {
    tableName: 'Bookings',
    timestamps: true,
    underscored: true
  });
  Booking.associate = (models) => {
    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Booking.belongsTo(models.Flight, {
      foreignKey: 'flightId',
      as: 'flight'
    });
  };
  return Booking;
};