
const {Sequelize, DataTypes} = require('sequelize');
const sequelizeInstance = require('../../db/database.js');
const User = require('./User.js');
const Flight = require('./Flight.js');
const Booking = require('./Booking.js');


const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelizeInstance;

db.User = User(sequelizeInstance, DataTypes);
db.Flight = Flight(sequelizeInstance, DataTypes);
db.Booking = Booking(sequelizeInstance, DataTypes);

// Definir asociaciones
db.Booking.belongsTo(db.User, { foreignKey: 'user_id', as: 'user' });
db.Booking.belongsTo(db.Flight, { foreignKey: 'flight_id', as: 'flight' });
db.User.hasMany(db.Booking, { foreignKey: 'user_id', as: 'bookings' });
db.Flight.hasMany(db.Booking, { foreignKey: 'flight_id', as: 'bookings' });

async function getDb() {
  return db;
}

module.exports = getDb;