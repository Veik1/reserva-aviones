"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "Cities",
      [
        {
          id: "11111111-1111-1111-1111-111111111111",
          name: "Nueva York",
          country_code: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "22222222-2222-2222-2222-222222222222",
          name: "Los Ángeles",
          country_code: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "33333333-3333-3333-3333-333333333333",
          name: "Miami",
          country_code: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "44444444-4444-4444-4444-444444444444",
          name: "Chicago",
          country_code: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "55555555-5555-5555-5555-555555555555",
          name: "Londres",
          country_code: "GB",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "66666666-6666-6666-6666-666666666666",
          name: "Tokio",
          country_code: "JP",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "77777777-7777-7777-7777-777777777777",
          name: "Madrid",
          country_code: "ES",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "88888888-8888-8888-8888-888888888888",
          name: "Buenos Aires",
          country_code: "AR",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "99999999-9999-9999-9999-999999999999",
          name: "Frankfurt",
          country_code: "DE",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          name: "París",
          country_code: "FR",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb",
          name: "Atlanta",
          country_code: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "cccccccc-cccc-cccc-cccc-cccccccccccc",
          name: "Santiago",
          country_code: "CL",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "dddddddd-dddd-dddd-dddd-dddddddddddd",
          name: "Dallas",
          country_code: "US",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee",
          name: "Ámsterdam",
          country_code: "NL",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "ffffffff-ffff-ffff-ffff-ffffffffffff",
          name: "Bogotá",
          country_code: "CO",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "12121212-1212-1212-1212-121212121212",
          name: "Ciudad de México",
          country_code: "MX",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "23232323-2323-2323-2323-232323232323",
          name: "Dubái",
          country_code: "AE",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "34343434-3434-3434-3434-343434343434",
          name: "Ciudad de Panamá",
          country_code: "PA",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Cities", null, {});
  },
};
