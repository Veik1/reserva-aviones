
const { DataTypes } = require('sequelize');
 
 module.exports = {
  up: async (queryInterface, Sequelize) => {
  await queryInterface.createTable('Bookings', {
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
  },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
  },
  user_id: {
  type: DataTypes.UUID,
  allowNull: false,
  references: {
  model: 'Users',
  key: 'id'
  },
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
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
  down: async (queryInterface, Sequelize) => {
  await queryInterface.dropTable('Bookings');
  }
 };