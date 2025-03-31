const Sequelize = require('sequelize');
const config = require('../config/config');
const Vuelo = require('./Vuelo');
const Persona = require('./Persona');
const Reserva = require('./Reserva');

const sequelize = new Sequelize(config.development);

const db = {};

// Inicializar modelos
db.Vuelo = Vuelo.init(sequelize, Sequelize);
db.Persona = Persona.init(sequelize, Sequelize);
db.Reserva = Reserva.init(sequelize, Sequelize);

// Configurar asociaciones
if (db.Vuelo.associate) db.Vuelo.associate(db);
if (db.Persona.associate) db.Persona.associate(db);
if (db.Reserva.associate) db.Reserva.associate(db);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;