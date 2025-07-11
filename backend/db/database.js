
const { Sequelize } = require('sequelize');

const config = require('../config/config.js');

const sequelize = new Sequelize(
    config.development.database,
    config.development.username,
    config.development.password,
    {
    host: config.development.host,  
    port: config.development.port,
    dialect: config.development.dialect,
    logging: false
    }
   );

module.exports = sequelize;