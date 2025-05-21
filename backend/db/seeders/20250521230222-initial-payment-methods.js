"use strict";
const { v4: uuidv4 } = require("uuid");

module.exports = {
  async up(queryInterface, Sequelize) {
    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM "Users";',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    const userId1 = userMap["usuario1@example.com"];
    const userId2 = userMap["usuario2@example.com"];
    const adminId = userMap["admin@example.com"];

    if (!userId1 || !userId2 || !adminId) {
      console.error(
        "ERROR: No se encontraron todos los usuarios necesarios para el seeder de PaymentMethods. Asegúrate de que el seeder de usuarios se haya ejecutado correctamente Y que los emails coincidan."
      );
      throw new Error(
        "Usuarios no encontrados. El seeder de PaymentMethods depende de que los usuarios existan."
      );
    }

    await queryInterface.bulkInsert(
      "PaymentMethods",
      [
        {
          id: uuidv4(),
          type: "CREDIT_CARD",
          provider: "VISA",
          is_default: true,
          metadata: JSON.stringify({
            cardNumber: "************1111",
            expirationDate: "01/28",
            cardHolderName: "USUARIO UNO APELLIDO",
            tokenPayment: "tok_visa_user1_enc_XYZ123",
          }),
          user_id: userId1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          type: "DEBIT_CARD",
          provider: "MASTERCARD",
          is_default: false,
          metadata: JSON.stringify({
            cardNumber: "************2222",
            expirationDate: "06/27",
            cardHolderName: "USUARIO UNO APELLIDO",
            tokenPayment: "tok_mc_user1_enc_ABC456",
          }),
          user_id: userId1,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          type: "TRANSFER",
          provider: "Bank_Transfer",
          is_default: true,
          metadata: JSON.stringify({
            bankName: "Banco Nacional",
            accountNumber: "****0987",
            accountHolder: "USUARIO DOS APELLIDO",
            cbu: "1234567890123456789012_enc_DEF789",
          }),
          user_id: userId2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          type: "EWALLET",
          provider: "MercadoPago",
          is_default: false,
          metadata: JSON.stringify({
            email: "usuario2@example.com",
            walletId: "wallet_user2_enc_GHI012",
          }),
          user_id: userId2,
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          type: "CREDIT_CARD",
          provider: "AMEX",
          is_default: true,
          metadata: JSON.stringify({
            cardNumber: "************3333",
            expirationDate: "09/26",
            cardHolderName: "ADMINISTRADOR PRINCIPAL",
            tokenPayment: "tok_amex_admin_enc_JKL345",
          }),
          user_id: adminId,
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete("PaymentMethods", null, {});
  },
};
