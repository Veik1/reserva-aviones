'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('PaymentMethods', {
      id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
      },
      type: {
        type: Sequelize.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'EWALLET'),
        allowNull: false
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: false
      },
      is_default: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
        allowNull: false
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: false
      },
      user_id: {
        type: Sequelize.UUID,
        references: {
          model: 'Users',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'SET NULL',
        allowNull: true
      },
      created_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updated_at: {
        type: Sequelize.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    await queryInterface.addIndex('PaymentMethods', {
      fields: [Sequelize.literal('metadata->>\'cardNumber\'')],
      unique: true,
      name: 'unique_card_number_in_metadata' 
    });
  },

  down: async (queryInterface) => {
    await queryInterface.removeIndex('PaymentMethods', 'unique_card_number_in_metadata');
    await queryInterface.dropTable('PaymentMethods');
  }
};