"use strict";
const { v4: uuidv4 } = require("uuid");

// IDs de aeropuertos (deben coincidir con el seeder de Airports)
const airportId_JFK = "aaaaaaa2-aaaa-aaaa-aaaa-aaaaaaaaaaa2";
const airportId_LAX = "aaaaaaa4-aaaa-aaaa-aaaa-aaaaaaaaaaa4";
const airportId_MIA = "aaaaaaa3-aaaa-aaaa-aaaa-aaaaaaaaaaa3";
const airportId_ORD = "aaaaaaa6-aaaa-aaaa-aaaa-aaaaaaaaaaa6";
const airportId_LHR = "aaaaaaa5-aaaa-aaaa-aaaa-aaaaaaaaaaa5";
const airportId_HND = "aaaaaaa7-aaaa-aaaa-aaaa-aaaaaaaaaaa7";
const airportId_MAD = "aaaaaaa8-aaaa-aaaa-aaaa-aaaaaaaaaaa8";
const airportId_EZE = "aaaaaaa1-aaaa-aaaa-aaaa-aaaaaaaaaaa1";
const airportId_FRA = "aaaaaaa9-aaaa-aaaa-aaaa-aaaaaaaaaaa9";
const airportId_ATL = "aaaaaa10-aaaa-aaaa-aaaa-aaaaaaaaaa10";
const airportId_SCL = "aaaaaa11-aaaa-aaaa-aaaa-aaaaaaaaaa11";
const airportId_DFW = "aaaaaa12-aaaa-aaaa-aaaa-aaaaaaaaaa12";
const airportId_AMS = "aaaaaa13-aaaa-aaaa-aaaa-aaaaaaaaaa13";
const airportId_BOG = "aaaaaa14-aaaa-aaaa-aaaa-aaaaaaaaaa14";
const airportId_MEX = "aaaaaa15-aaaa-aaaa-aaaa-aaaaaaaaaa15";
const airportId_DXB = "aaaaaa16-aaaa-aaaa-aaaa-aaaaaaaaaa16";
const airportId_PTY = "aaaaaa17-aaaa-aaaa-aaaa-aaaaaaaaaa17";
const airportId_CDG = "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"; // París

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const oneHour = 3600000;
    const oneDay = 86400000;
    const now = Date.now();

    await queryInterface.bulkInsert(
      "Flights",
      [
        {
          id: uuidv4(),
          flight_number: "AA102",
          origin_airport_id: airportId_JFK,
          destination_airport_id: airportId_LAX,
          departure_time: new Date(now + 1 * oneDay),
          arrival_time: new Date(now + 1 * oneDay + 5.5 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkutoYHfeLmKQiUG1JyRob9VQOVy8sHJhyBiRhpugGW-ZvTxlLBql9_vuWMYtWnrg2lM4&usqp=CAU",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "BB203",
          origin_airport_id: airportId_MIA,
          destination_airport_id: airportId_ORD,
          departure_time: new Date(now + 2 * oneDay),
          arrival_time: new Date(now + 2 * oneDay + 3 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRMC_COFhu3WJcCrpg8f7KWDCgETlNsZjFBw&s",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "DL310",
          origin_airport_id: airportId_LAX,
          destination_airport_id: airportId_LHR,
          departure_time: new Date(now + 3 * oneDay + 2 * oneHour),
          arrival_time: new Date(now + 3 * oneDay + 12 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOmgrrLeL0ILbirGGl26nETQkGMaxt_OmEvA&s",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "UA450",
          origin_airport_id: airportId_ORD,
          destination_airport_id: airportId_HND,
          departure_time: new Date(now + 7 * oneDay + 4 * oneHour),
          arrival_time: new Date(now + 7 * oneDay + 17 * oneHour),
          image_url:
            "https://a.travel-assets.com/findyours-php/viewfinder/images/res70/69000/69347-Tokyo.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "IB501",
          origin_airport_id: airportId_MAD,
          destination_airport_id: airportId_EZE,
          departure_time: new Date(now + 5 * oneDay),
          arrival_time: new Date(now + 5 * oneDay + 12 * oneHour),
          image_url:
            "https://media.lmneuquen.com/p/26f544c8acbce08f4e6f07344a6d4cd8/adjuntos/195/imagenes/006/474/0006474342/buenos-airesjpg.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "LH622",
          origin_airport_id: airportId_FRA,
          destination_airport_id: airportId_JFK,
          departure_time: new Date(now + 10 * oneDay),
          arrival_time: new Date(now + 10 * oneDay + 8.5 * oneHour),
          image_url:
            "https://i0.wp.com/voila.ar/wp-content/uploads/2023/05/estatua-libertad-new-york.jpg?fit=1140%2C760&ssl=1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "BA789",
          origin_airport_id: airportId_LHR,
          destination_airport_id: airportId_MIA,
          departure_time: new Date(now + 4 * oneDay + 6 * oneHour),
          arrival_time: new Date(now + 4 * oneDay + 15 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHQSyCdY7Q4oPbzjC3_rnahHwvgruMCl3rwA&s",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "AF815",
          origin_airport_id: airportId_CDG,
          destination_airport_id: airportId_ATL,
          departure_time: new Date(now + 14 * oneDay),
          arrival_time: new Date(now + 14 * oneDay + 9.5 * oneHour),
          image_url: "https://www.viajaratlanta.com/img/viajar-atlanta.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "AR930",
          origin_airport_id: airportId_EZE,
          destination_airport_id: airportId_MIA,
          departure_time: new Date(now + 6 * oneDay + 3 * oneHour),
          arrival_time: new Date(now + 6 * oneDay + 12 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHQSyCdY7Q4oPbzjC3_rnahHwvgruMCl3rwA&s",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "LA105",
          origin_airport_id: airportId_SCL,
          destination_airport_id: airportId_LAX,
          departure_time: new Date(now + 8 * oneDay),
          arrival_time: new Date(now + 8 * oneDay + 11 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkutoYHfeLmKQiUG1JyRob9VQOVy8sHJhyBiRhpugGW-ZvTxlLBql9_vuWMYtWnrg2lM4&usqp=CAU",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "AA115",
          origin_airport_id: airportId_DFW,
          destination_airport_id: airportId_CDG,
          departure_time: new Date(now + 12 * oneDay),
          arrival_time: new Date(now + 12 * oneDay + 9 * oneHour),
          image_url:
            "https://turismo.org/wp-content/uploads/2015/05/Torre-Eiffel-vista-panoramica-760x500.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "DL355",
          origin_airport_id: airportId_ATL,
          destination_airport_id: airportId_AMS,
          departure_time: new Date(now + 9 * oneDay + 5 * oneHour),
          arrival_time: new Date(now + 9 * oneDay + 13.5 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCLGt636LXze-pdTo9N07-sopCbQdQ2oziKg&s",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "UA480",
          origin_airport_id: airportId_JFK,
          destination_airport_id: airportId_SCL,
          departure_time: new Date(now + 11 * oneDay),
          arrival_time: new Date(now + 11 * oneDay + 10.5 * oneHour),
          image_url:
            "https://turismo.encolombia.com/wp-content/uploads/2013/03/santiago-chile.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "IB530",
          origin_airport_id: airportId_BOG,
          destination_airport_id: airportId_MAD,
          departure_time: new Date(now + 15 * oneDay),
          arrival_time: new Date(now + 15 * oneDay + 9.5 * oneHour),
          image_url:
            "https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/madrid/calle-gran-via-madrid-s333961043.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "AR965",
          origin_airport_id: airportId_EZE,
          destination_airport_id: airportId_JFK,
          departure_time: new Date(now + 13 * oneDay + 8 * oneHour),
          arrival_time: new Date(now + 13 * oneDay + 18 * oneHour),
          image_url:
            "https://i0.wp.com/voila.ar/wp-content/uploads/2023/05/estatua-libertad-new-york.jpg?fit=1140%2C760&ssl=1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "LH688",
          origin_airport_id: airportId_MEX,
          destination_airport_id: airportId_FRA,
          departure_time: new Date(now + 18 * oneDay),
          arrival_time: new Date(now + 18 * oneDay + 11 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIlOBpn3JkrlP3jgCVjVbiuhARpCClPiDr7BpbQ4aWU3l-kWoo5m6Ocq_mxKeBIgRCrgI&usqp=CAU",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "AF899",
          origin_airport_id: airportId_SCL,
          destination_airport_id: airportId_CDG,
          departure_time: new Date(now + 20 * oneDay),
          arrival_time: new Date(now + 20 * oneDay + 14 * oneHour),
          image_url:
            "https://turismo.org/wp-content/uploads/2015/05/Torre-Eiffel-vista-panoramica-760x500.jpg",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "EK204",
          origin_airport_id: airportId_DXB,
          destination_airport_id: airportId_JFK,
          departure_time: new Date(now + 16 * oneDay),
          arrival_time: new Date(now + 16 * oneDay + 14 * oneHour),
          image_url:
            "https://i0.wp.com/voila.ar/wp-content/uploads/2023/05/estatua-libertad-new-york.jpg?fit=1140%2C760&ssl=1",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "AA151",
          origin_airport_id: airportId_LAX,
          destination_airport_id: airportId_MIA,
          departure_time: new Date(now + 2 * oneDay + 10 * oneHour),
          arrival_time: new Date(now + 2 * oneDay + 14.5 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHQSyCdY7Q4oPbzjC3_rnahHwvgruMCl3rwA&s",
          created_at: new Date(),
          updated_at: new Date(),
        },
        {
          id: uuidv4(),
          flight_number: "COPA123",
          origin_airport_id: airportId_PTY,
          destination_airport_id: airportId_BOG,
          departure_time: new Date(now + 3 * oneDay + 9 * oneHour),
          arrival_time: new Date(now + 3 * oneDay + 10.5 * oneHour),
          image_url:
            "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKiAC4t_Eymf_lmkqIAE5-_yL2Qe4mtuBWGQ&s",
          created_at: new Date(),
          updated_at: new Date(),
        },
      ],
      {}
    );
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete("Flights", null, {});
  },
};
