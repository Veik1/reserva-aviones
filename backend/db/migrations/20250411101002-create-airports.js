'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.createTable('Airports', {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false
      },
      iata_code: {
        type: DataTypes.STRING(3),
        allowNull: false,
        unique: true
      },
      city_id: {
        type: DataTypes.UUID,
        allowNull: false,
        references: {
          model: 'Cities', // Nombre de la tabla a la que referencia
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT' // O 'CASCADE' si quieres borrar aeropuertos si se borra la ciudad
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });
  },
  async down (queryInterface, Sequelize) {
    await queryInterface.dropTable('Airports');
  }
};