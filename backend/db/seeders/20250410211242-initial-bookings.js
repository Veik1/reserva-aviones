'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Obtener IDs de Usuarios
    const users = await queryInterface.sequelize.query(
      'SELECT id, email FROM "Users";',
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const userMap = users.reduce((acc, user) => {
      acc[user.email] = user.id;
      return acc;
    }, {});

    // 2. Obtener IDs de FlightOfferings
    // Para esto, necesitamos una forma de identificar las ofertas.
    // Podríamos buscar por flight_id y flight_class_id si esos son deterministas
    // o si las ofertas tuvieran un código único.
    // Por ahora, asumiremos que conocemos los IDs de las ofertas que queremos usar
    // o que podemos identificarlas de alguna manera.
    // Esta es la parte más compleja si no tenemos un identificador único para las ofertas.

    // OPCIÓN A: Si pre-generaste IDs para FlightOfferings y los conoces (no ideal para producción, pero sí para seeders controlados)
    // Supongamos que los IDs de las ofertas que queremos usar son:
    // offeringId_NY_LA_Eco para el vuelo AA102 en Económica
    // offeringId_MIA_CHI_Eco para el vuelo BB203 en Económica
    // Necesitarías haber guardado estos IDs desde el seeder de FlightOfferings o consultarlos de una forma más específica.

    // OPCIÓN B (Más realista si no quieres depender de IDs pre-generados entre archivos):
    // Consultar FlightOfferings basándose en el vuelo y la clase.
    // Esto requiere que los seeders de Flights y FlightClasses ya se hayan ejecutado.

    const flightOfferings = await queryInterface.sequelize.query(
      `SELECT fo.id as offering_id, f.flight_number, fc.name as class_name
       FROM "FlightOfferings" fo
       JOIN "Flights" f ON fo.flight_id = f.id
       JOIN "FlightClasses" fc ON fo.flight_class_id = fc.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // --- AÑADE ESTOS LOGS PARA DEPURAR ---
    console.log("--- Seeder Bookings: User Map ---");
    console.log(userMap);
    console.log("--- Seeder Bookings: Flight Offerings Encontradas (primeras 5) ---");
    console.log(flightOfferings.slice(0, 5)); // Muestra solo las primeras 5 para no saturar la consola
    // --- FIN LOGS ---

    // Encontrar las ofertas específicas que queremos
    const nyLaEcoOffering = flightOfferings.find(fo => fo.flight_number === 'AA102' && fo.class_name === 'Economica');
    const miaChiBusOffering = flightOfferings.find(fo => fo.flight_number === 'BB203' && fo.class_name === 'Business'); // Ejemplo con Business

    // --- AÑADE ESTOS LOGS PARA DEPURAR ---
    console.log("--- Seeder Bookings: nyLaEcoOffering ---");
    console.log(nyLaEcoOffering);
    console.log("--- Seeder Bookings: miaChiBusOffering ---");
    console.log(miaChiBusOffering);
    // --- FIN LOGS ---

    if (!userMap['usuario1@example.com'] || !userMap['usuario2@example.com'] || !nyLaEcoOffering || !miaChiBusOffering) {
        console.error("ERROR: No se encontraron usuarios u ofertas de vuelo necesarios para el seeder de Bookings.");
        // --- AÑADE LOGS DETALLADOS DEL ERROR ---
        if (!userMap['usuario1@example.com']) console.error("Falta usuario1@example.com en userMap");
        if (!userMap['usuario2@example.com']) console.error("Falta usuario2@example.com en userMap");
        if (!nyLaEcoOffering) console.error("No se encontró oferta para AA102 en Economica");
        if (!miaChiBusOffering) console.error("No se encontró oferta para BB203 en Business");
        // --- FIN LOGS DETALLADOS DEL ERROR ---
        return;
    }

    await queryInterface.bulkInsert('Bookings', [
      {
        id: uuidv4(),
        booking_code: 'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        flight_offering_id: nyLaEcoOffering.offering_id,
        user_id: userMap['usuario1@example.com'],
        seat: '15B',
        total_price: 350.75, // Asegúrate que coincida con el precio de esta oferta
        status: 'confirmed',
        passenger_name: 'Carlos',
        passenger_last_name: 'Ruiz',
        passenger_email: 'carlos.ruiz@example.com',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        booking_code: 'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        flight_offering_id: miaChiBusOffering.offering_id,
        user_id: userMap['usuario2@example.com'],
        seat: '3A',
        total_price: 600.00, // Ajusta al precio de la oferta Business de BB203 (ejemplo)
        status: 'pending',
        passenger_name: 'Ana',
        passenger_last_name: 'Gomez',
        passenger_email: 'ana.gomez@example.com',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bookings', null, {});
  }
};