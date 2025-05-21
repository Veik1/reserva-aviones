'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PaymentMethod = sequelize.define('PaymentMethod', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      allowNull: false
    },
    type: {
      type: DataTypes.ENUM('CREDIT_CARD', 'DEBIT_CARD', 'TRANSFER', 'EWALLET'),
      allowNull: false
    },
    provider: { // por ejemplo: 'VISA', 'PayPal', 'MercadoPago'
      type: DataTypes.STRING,
      allowNull: false
    },
    is_default: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    metadata: { // datos sensibles, por lo cual estarán incrementados
      type: DataTypes.JSONB,
      allowNull: false
    },
    user_id: { // FK a User (opcional, si guardas métodos de pago del usuario)
      type: DataTypes.UUID,
      allowNull: true
    }
  }, {
    tableName: 'PaymentMethods',
    timestamps: true,
    underscored: true,
    hooks: {
    
    }
  });

  PaymentMethod.associate = (models) => {
    // Relación con Booking (1:1)
    PaymentMethod.hasOne(models.Booking, {
      foreignKey: 'payment_method_id',
      as: 'booking'
    });

    // Relación con User (opcional, N:1)
    PaymentMethod.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });
  };

  return PaymentMethod;
};