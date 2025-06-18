'use strict';
const { v4: uuidv4 } = require('uuid');

// Pre-generamos IDs para las ofertas para poder usarlas en Bookings si es necesario
const offeringId_NY_LA_Eco = uuidv4();
const offeringId_NY_LA_Bus = uuidv4();
const offeringId_MIA_CHI_Eco = uuidv4();
// ... más IDs de ofertas si las vas a referenciar directamente en el seeder de Bookings

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Obtener los IDs de los Vuelos desde la base de datos
    const flights = await queryInterface.sequelize.query(
      'SELECT id, flight_number FROM "Flights";', // Asegúrate que el nombre de la tabla sea correcto
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Crear un mapa para fácil acceso: flight_number -> id
    const flightMap = flights.reduce((acc, flight) => {
      acc[flight.flight_number] = flight.id;
      return acc;
    }, {});

    // 2. Obtener los IDs de las Clases de Vuelo desde la base de datos
    const flightClasses = await queryInterface.sequelize.query(
      'SELECT id, name FROM "FlightClasses";', // Asegúrate que el nombre de la tabla sea correcto
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Crear un mapa: className -> id
    const classMap = flightClasses.reduce((acc, fc) => {
      acc[fc.name] = fc.id; // Asumiendo que 'name' es 'Economica', 'Business', etc.
      return acc;
    }, {});

    // Validar que se encontraron los IDs (opcional pero bueno)
    if (!flightMap['AA102'] || !classMap['Economica']) {
        console.error("ERROR: No se encontraron IDs de vuelo o clase necesarios. Asegúrate de que los seeders anteriores se hayan ejecutado.");
        return; // Detener el seeder si faltan datos críticos
    }


    const flightOfferingsData = [
      // Ofertas para Vuelo NY - LA (AA102)
      {
        id: offeringId_NY_LA_Eco,
        flight_id: flightMap['AA102'], // Usar ID obtenido de la DB
        flight_class_id: classMap['Economica'], // Usar ID obtenido de la DB
        seats_available: 120,
        price: 350.75,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: offeringId_NY_LA_Bus,
        flight_id: flightMap['AA102'],
        flight_class_id: classMap['Business'],
        seats_available: 30,
        price: 750.00,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Ofertas para Vuelo Miami - Chicago (BB203)
      {
        id: offeringId_MIA_CHI_Eco,
        flight_id: flightMap['BB203'],
        flight_class_id: classMap['Economica'],
        seats_available: 100,
        price: 280.20,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(), // Nuevo ID si no lo necesitas referenciar después
        flight_id: flightMap['BB203'],
        flight_class_id: classMap['Economica Premium'], // Asegúrate que 'Economica Premium' sea el 'name' exacto
        seats_available: 20,
        price: 450.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(), // Nuevo ID si no lo necesitas referenciar después
        flight_id: flightMap['BB203'],
        flight_class_id: classMap['Business'], // Asegúrate que 'Business' sea el 'name' exacto
        seats_available: 15,
        price: 600.00,
        created_at: new Date(),
        updated_at: new Date()
      },

      // Ofertas para Vuelo LA - Londres (DL310)
      {
        id: uuidv4(),
        flight_id: flightMap['DL310'],
        flight_class_id: classMap['Economica'],
        seats_available: 150,
        price: 680.50,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_id: flightMap['DL310'],
        flight_class_id: classMap['Business'],
        seats_available: 20,
        price: 1200.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_id: flightMap['DL310'],
        flight_class_id: classMap['Primera Clase'], // Asegúrate que 'Primera Clase' sea el 'name' exacto
        seats_available: 10,
        price: 2500.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      // ... Añade ofertas para los vuelos UA450 e IB501 y los demás ...
      // Ejemplo para UA450 (Chicago - Tokio)
      {
        id: uuidv4(),
        flight_id: flightMap['UA450'],
        flight_class_id: classMap['Economica'],
        seats_available: 180,
        price: 950.00,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_id: flightMap['UA450'],
        flight_class_id: classMap['Business'],
        seats_available: 40,
        price: 1800.00,
        created_at: new Date(),
        updated_at: new Date()
      },
       // Ejemplo para IB501 (Madrid - Buenos Aires)
       {
        id: uuidv4(),
        flight_id: flightMap['AV005'],
        flight_class_id: classMap['Economica'],
        seats_available: 170,
        price: 720.80,
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_id: flightMap['AV005'],
        flight_class_id: classMap['Economica Premium'],
        seats_available: 30,
        price: 980.00,
        created_at: new Date(),
        updated_at: new Date()
      },
    ];
    await queryInterface.bulkInsert('FlightOfferings', flightOfferingsData, {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('FlightOfferings', null, {});
  }
};