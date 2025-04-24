'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.addColumn('Flights', 'image_url', { // Nombre de la tabla y nueva columna
      type: DataTypes.STRING, // O DataTypes.TEXT si esperas URLs muy largas
      allowNull: true,      // Permitir que sea nulo inicialmente
    });
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Flights', 'image_url');
  }
};