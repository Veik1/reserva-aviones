
const { DataTypes } = require('sequelize');
 
module.exports = {
    up: async (queryInterface, Sequelize) => {
      await queryInterface.addColumn('Bookings', 'passenger_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('Bookings', 'passenger_last_name', {
        type: Sequelize.STRING,
        allowNull: true
      });
      await queryInterface.addColumn('Bookings', 'passenger_email', {
        type: Sequelize.STRING,
        allowNull: true
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      await queryInterface.removeColumn('Bookings', 'passenger_name');
      await queryInterface.removeColumn('Bookings', 'passenger_last_name');
      await queryInterface.removeColumn('Bookings', 'passenger_email');
    }
  };