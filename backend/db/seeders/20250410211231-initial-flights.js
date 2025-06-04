'use strict';
const { v4: uuidv4 } = require('uuid');

const oneHour = 3600000;
const oneDay = 86400000;

// Pre-generamos IDs para los vuelos para poder referenciarlos en FlightOfferings
const flightId_NY_LA = uuidv4();
const flightId_MIA_CHI = uuidv4();
const flightId_LA_LON = uuidv4();
const flightId_CHI_TOK = uuidv4();
const flightId_BUE_MIA = uuidv4();

module.exports = {
  async up (queryInterface, Sequelize) {
    const now = Date.now();

    // 1. Obtener los IDs de los Aeropuertos desde la base de datos
    const airports = await queryInterface.sequelize.query(
      'SELECT id, iata_code FROM "Airports";', // Asegúrate que el nombre de la tabla sea correcto
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Crear un mapa para fácil acceso: iata_code -> id
    const airportMap = airports.reduce((acc, airport) => {
      acc[airport.iata_code] = airport.id;
      return acc;
    }, {});

    // Validar que se encontraron los IDs de aeropuertos necesarios (ejemplo)
    if (!airportMap['JFK'] || !airportMap['LAX'] || !airportMap['MIA'] || !airportMap['ORD'] || !airportMap['LHR'] || !airportMap['NRT'] || !airportMap['EZE']) {
        console.error("ERROR: No se encontraron IDs de aeropuerto necesarios. Asegúrate de que el seeder de Aeropuertos se haya ejecutado y que los IATA codes existan.");
        // Puedes decidir si detener el seeder o continuar con los que sí se puedan crear
        // throw new Error("Faltan IDs de aeropuerto críticos."); // Opcional: detener ejecución
    }

    const flightsData = [
      {
        id: flightId_NY_LA,
        flight_number: 'AA102',
        origin_airport_id: airportMap['JFK'],      // Usar ID de aeropuerto del mapa
        destination_airport_id: airportMap['LAX'], // Usar ID de aeropuerto del mapa
        departure_time: new Date(now + 1 * oneDay),
        arrival_time: new Date(now + 1 * oneDay + 5.5 * oneHour),
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkutoYHfeLmKQiUG1JyRob9VQOVy8sHJhyBiRhpugGW-ZvTxlLBql9_vuWMYtWnrg2lM4&usqp=CAU',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: flightId_MIA_CHI,
        flight_number: 'BB203',
        origin_airport_id: airportMap['MIA'],
        destination_airport_id: airportMap['ORD'],
        departure_time: new Date(now + 2 * oneDay),
        arrival_time: new Date(now + 2 * oneDay + 3 * oneHour),
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRMC_COFhu3WJcCrpg8f7KWDCgETlNsZjFBw&s',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: flightId_LA_LON,
        flight_number: 'DL310',
        origin_airport_id: airportMap['LAX'],
        destination_airport_id: airportMap['LHR'], // Asumiendo que LHR está en tu airportMap
        departure_time: new Date(now + 3 * oneDay + 2 * oneHour),
        arrival_time: new Date(now + 3 * oneDay + 12 * oneHour),
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOmgrrLeL0ILbirGGl26nETQkGMaxt_OmEvA&s',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: flightId_CHI_TOK,
        flight_number: 'UA450',
        origin_airport_id: airportMap['ORD'],
        destination_airport_id: airportMap['NRT'], // Asumiendo que NRT está en tu airportMap
        departure_time: new Date(now + 7 * oneDay + 4 * oneHour),
        arrival_time: new Date(now + 7 * oneDay + 17 * oneHour),
        image_url: 'https://a.travel-assets.com/findyours-php/viewfinder/images/res70/69000/69347-Tokyo.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: flightId_BUE_MIA,
        flight_number: 'AV005',
        origin_airport_id: airportMap['EZE'], // Buenos Aires (Ezeiza)
        destination_airport_id: airportMap['MIA'], // Miami
        departure_time: new Date(now + 4 * oneDay),
        arrival_time: new Date(now + 4 * oneDay + 9 * oneHour),
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHQSyCdY7Q4oPbzjC3_rnahHwvgruMCl3rwA&s',
        created_at: new Date(),
        updated_at: new Date()
      },
      // ... Continúa con tus otros 15 vuelos, asegurándote de que los IATA codes
      // que usas en airportMap['XXX'] existan en tu seeder de Aeropuertos y en el mapa.
    ];

    // Filtrar solo los vuelos para los que encontramos ambos aeropuertos
    const validFlightsData = flightsData.filter(flight => flight.origin_airport_id && flight.destination_airport_id);

    if (validFlightsData.length !== flightsData.length) {
        console.warn("ADVERTENCIA: Algunos vuelos no se pudieron crear porque sus aeropuertos de origen/destino no se encontraron en la base de datos.");
    }

    if (validFlightsData.length > 0) {
        await queryInterface.bulkInsert('Flights', validFlightsData, {});
    } else {
        console.warn("ADVERTENCIA: No se insertó ningún vuelo porque no se encontraron los aeropuertos necesarios.");
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Flights', null, {});
  }
};

// Ya no necesitas exportar airportIds de aquí, los obtienes de la DB.
// Pero sí necesitas exportar los IDs de los vuelos si el seeder de FlightOfferings los va a usar.
module.exports.flightIds = {
    flightId_NY_LA, flightId_MIA_CHI, flightId_LA_LON, flightId_CHI_TOK, flightId_BUE_MIA
};