'use strict';
const { v4: uuidv4 } = require('uuid');
// Importar los IDs de las ciudades del seeder anterior
const { cityIds } = require('./20250410211204-initial-cities.js'); 
// Pre-generamos IDs para aeropuertos para el seeder de Flights
const airport_JFK_Id = uuidv4(); // Nueva York
const airport_LAX_Id = uuidv4(); // Los Ángeles
const airport_MIA_Id = uuidv4(); // Miami
const airport_ORD_Id = uuidv4(); // Chicago
const airport_LHR_Id = uuidv4(); // Londres
const airport_NRT_Id = uuidv4(); // Tokio
const airport_MAD_Id = uuidv4(); // Madrid
const airport_EZE_Id = uuidv4(); // Buenos Aires - Ezeiza
const airport_AEP_Id = uuidv4(); // Buenos Aires - Aeroparque (ejemplo de segunda opción)
const airport_FRA_Id = uuidv4(); // Frankfurt
// ... añade más IDs de aeropuertos según necesites ...

module.exports = {
  async up (queryInterface, Sequelize) {
    if (!cityIds) {
        console.error("ERROR: IDs de ciudades no encontrados. Asegúrate de que el seeder de ciudades se ejecute primero y exporte los IDs.");
        throw new Error("Dependencia de seeder de ciudades no satisfecha.");
    }
    await queryInterface.bulkInsert('Airports', [
      // Nueva York
      { id: airport_JFK_Id, name: 'John F. Kennedy International Airport', iata_code: 'JFK', city_id: cityIds.city_NYC_Id, created_at: new Date(), updated_at: new Date() },
      // Los Ángeles
      { id: airport_LAX_Id, name: 'Los Angeles International Airport', iata_code: 'LAX', city_id: cityIds.city_LAX_Id, created_at: new Date(), updated_at: new Date() },
      // Miami
      { id: airport_MIA_Id, name: 'Miami International Airport', iata_code: 'MIA', city_id: cityIds.city_MIA_Id, created_at: new Date(), updated_at: new Date() },
      // Chicago
      { id: airport_ORD_Id, name: "O'Hare International Airport", iata_code: 'ORD', city_id: cityIds.city_CHI_Id, created_at: new Date(), updated_at: new Date() },
      // Londres
      { id: airport_LHR_Id, name: 'Heathrow Airport', iata_code: 'LHR', city_id: cityIds.city_LON_Id, created_at: new Date(), updated_at: new Date() },
      // Tokio
      { id: airport_NRT_Id, name: 'Narita International Airport', iata_code: 'NRT', city_id: cityIds.city_TOK_Id, created_at: new Date(), updated_at: new Date() },
      // Madrid
      { id: airport_MAD_Id, name: 'Adolfo Suárez Madrid–Barajas Airport', iata_code: 'MAD', city_id: cityIds.city_MAD_Id, created_at: new Date(), updated_at: new Date() },
      // Buenos Aires
      { id: airport_EZE_Id, name: 'Aeropuerto Internacional Ministro Pistarini', iata_code: 'EZE', city_id: cityIds.city_BUE_Id, created_at: new Date(), updated_at: new Date() },
      { id: airport_AEP_Id, name: 'Aeroparque Jorge Newbery', iata_code: 'AEP', city_id: cityIds.city_BUE_Id, created_at: new Date(), updated_at: new Date() },
      // Frankfurt
      { id: airport_FRA_Id, name: 'Frankfurt Airport', iata_code: 'FRA', city_id: cityIds.city_FRA_Id, created_at: new Date(), updated_at: new Date() },
      // ... añade el resto de los aeropuertos que definiste en la lista de la imagen,
      // asociándolos a los city_id correspondientes y generando un airport_ID para cada uno.
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Airports', null, {});
  }
};

// Exportar IDs para el seeder de Flights
module.exports.airportIds = {
    airport_JFK_Id, airport_LAX_Id, airport_MIA_Id, airport_ORD_Id, airport_LHR_Id,
    airport_NRT_Id, airport_MAD_Id, airport_EZE_Id, airport_AEP_Id, airport_FRA_Id
    // ... añade los otros IDs de aeropuerto exportados ...
};