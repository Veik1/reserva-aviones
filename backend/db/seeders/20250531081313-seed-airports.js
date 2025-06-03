"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert(
      "Airports",
      [
        {
          id: "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2",
          name: "John F. Kennedy International Airport",
          iata_code: "JFK",
          city_id: "11111111-1111-1111-1111-111111111111", // Nueva York
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4",
          name: "Los Angeles International Airport",
          iata_code: "LAX",
          city_id: "22222222-2222-2222-2222-222222222222", // Los Ángeles
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3",
          name: "Miami International Airport",
          iata_code: "MIA",
          city_id: "33333333-3333-3333-3333-333333333333", // Miami
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6",
          name: "O'Hare International Airport",
          iata_code: "ORD",
          city_id: "44444444-4444-4444-4444-444444444444", // Chicago
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5",
          name: "Heathrow Airport",
          iata_code: "LHR",
          city_id: "55555555-5555-5555-5555-555555555555", // Londres
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7",
          name: "Haneda Airport",
          iata_code: "HND",
          city_id: "66666666-6666-6666-6666-666666666666", // Tokio
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaa8",
          name: "Aeropuerto Adolfo Suárez Madrid-Barajas",
          iata_code: "MAD",
          city_id: "77777777-7777-7777-7777-777777777777", // Madrid
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1",
          name: "Aeropuerto Internacional Ministro Pistarini",
          iata_code: "EZE",
          city_id: "88888888-8888-8888-8888-888888888888", // Buenos Aires
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaa9-aaaa-aaaa-aaaa-aaaaaaaaaaa9",
          name: "Frankfurt Airport",
          iata_code: "FRA",
          city_id: "99999999-9999-9999-9999-999999999999", // Frankfurt
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
          name: "Charles de Gaulle Airport",
          iata_code: "CDG",
          city_id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa", // París
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa10-aaaa-aaaa-aaaa-aaaaaaaaaa10",
          name: "Hartsfield–Jackson Atlanta International Airport",
          iata_code: "ATL",
          city_id: "bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb", // Atlanta
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa11-aaaa-aaaa-aaaa-aaaaaaaaaa11",
          name: "Aeropuerto Internacional Arturo Merino Benítez",
          iata_code: "SCL",
          city_id: "cccccccc-cccc-cccc-cccc-cccccccccccc", // Santiago
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa12-aaaa-aaaa-aaaa-aaaaaaaaaa12",
          name: "Dallas/Fort Worth International Airport",
          iata_code: "DFW",
          city_id: "dddddddd-dddd-dddd-dddd-dddddddddddd", // Dallas
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa13-aaaa-aaaa-aaaa-aaaaaaaaaa13",
          name: "Amsterdam Airport Schiphol",
          iata_code: "AMS",
          city_id: "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee", // Ámsterdam
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa14-aaaa-aaaa-aaaa-aaaaaaaaaa14",
          name: "Aeropuerto Internacional El Dorado",
          iata_code: "BOG",
          city_id: "ffffffff-ffff-ffff-ffff-ffffffffffff", // Bogotá
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa15-aaaa-aaaa-aaaa-aaaaaaaaaa15",
          name: "Aeropuerto Internacional Benito Juárez",
          iata_code: "MEX",
          city_id: "12121212-1212-1212-1212-121212121212", // Ciudad de México
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa16-aaaa-aaaa-aaaa-aaaaaaaaaa16",
          name: "Dubai International Airport",
          iata_code: "DXB",
          city_id: "23232323-2323-2323-2323-232323232323", // Dubái
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: "aaaaaa17-aaaa-aaaa-aaaa-aaaaaaaaaa17",
          name: "Aeropuerto Internacional de Tocumen",
          iata_code: "PTY",
          city_id: "34343434-3434-3434-3434-343434343434", // Ciudad de Panamá
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Airports", null, {});
  },
};
