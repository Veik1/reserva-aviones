const { Sequelize } = require('sequelize');
const config = require('../../config/database');

const sequelize = new Sequelize(config.development);

module.exports = {
  sequelize,
  Sequelize
};