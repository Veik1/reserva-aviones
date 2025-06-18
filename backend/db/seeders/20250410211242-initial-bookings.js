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
    const flightOfferings = await queryInterface.sequelize.query(
      `SELECT fo.id as offering_id, f.flight_number, fc.name as class_name
       FROM "FlightOfferings" fo
       JOIN "Flights" f ON fo.flight_id = f.id
       JOIN "FlightClasses" fc ON fo.flight_class_id = fc.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // 3. Obtener IDs de Asientos
    // Esto es crucial. Necesitamos los IDs de asientos reales generados por initial-seats.js.
    const seats = await queryInterface.sequelize.query(
      `SELECT id, seat_number, flight_offering_id, is_available FROM "Seats";`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    // Encontrar las ofertas específicas que queremos
    const nyLaEcoOffering = flightOfferings.find(fo => fo.flight_number === 'AA102' && fo.class_name === 'Economica');
    const miaChiBusOffering = flightOfferings.find(fo => fo.flight_number === 'BB203' && fo.class_name === 'Business');

    // Encontrar asientos específicos para esas ofertas y marcarlos como no disponibles temporalmente para el seeder
    // Tomamos el primer asiento disponible que coincida con la oferta y el número deseado
    const seat1 = seats.find(s => s.flight_offering_id === nyLaEcoOffering?.offering_id && s.seat_number === '1A' && s.is_available);
    const seat2 = seats.find(s => s.flight_offering_id === miaChiBusOffering?.offering_id && s.seat_number === '1B' && s.is_available);

    // --- LOGS PARA DEPURAR (mantenerlos, son muy útiles) ---
    console.log("--- Seeder Bookings: User Map ---");
    console.log(userMap);
    console.log("--- Seeder Bookings: Flight Offerings Encontradas (primeras 5) ---");
    console.log(flightOfferings.slice(0, 5));
    console.log("--- Seeder Bookings: Asientos Encontrados (primeros 5) ---");
    console.log(seats.slice(0, 5));
    console.log("--- Seeder Bookings: nyLaEcoOffering ---");
    console.log(nyLaEcoOffering);
    console.log("--- Seeder Bookings: miaChiBusOffering ---");
    console.log(miaChiBusOffering);
    console.log("--- Seeder Bookings: Seat 1 (1A) ---");
    console.log(seat1);
    console.log("--- Seeder Bookings: Seat 2 (1B) ---");
    console.log(seat2);
    // --- FIN LOGS ---

    // Validar que se encontraron todos los elementos necesarios
    if (!userMap['usuario1@example.com'] || !userMap['usuario2@example.com'] || !nyLaEcoOffering || !miaChiBusOffering || !seat1 || !seat2) {
        console.error("ERROR: No se encontraron usuarios, ofertas de vuelo o asientos necesarios para el seeder de Bookings.");
        if (!userMap['usuario1@example.com']) console.error("Falta usuario1@example.com en userMap");
        if (!userMap['usuario2@example.com']) console.error("Falta usuario2@example.com en userMap");
        if (!nyLaEcoOffering) console.error("No se encontró oferta para AA102 en Economica");
        if (!miaChiBusOffering) console.error("No se encontró oferta para BB203 en Business");
        if (!seat1) console.error("No se encontró el asiento '1A' disponible para la oferta de AA102 Economica. Quizás ya esté ocupado o no se generó.");
        if (!seat2) console.error("No se encontró el asiento '1B' disponible para la oferta de BB203 Business. Quizás ya esté ocupado o no se generó.");
        return; // Detener el seeder si faltan datos críticos
    }

    // --- Inserción de Reservas ---
    await queryInterface.bulkInsert('Bookings', [
      {
        id: uuidv4(),
        booking_code: 'BOOK-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
        flight_offering_id: nyLaEcoOffering.offering_id,
        user_id: userMap['usuario1@example.com'],
        seat_id: seat1.id, // <-- ¡USAR EL ID DEL ASIENTO REAL!
        total_price: 350.75, // Ajusta al precio de la oferta
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
        seat_id: seat2.id, // <-- ¡USAR EL ID DEL ASIENTO REAL!
        total_price: 600.00, // Ajusta al precio de tu oferta BB203 Business
        status: 'pending',
        passenger_name: 'Ana',
        passenger_last_name: 'Gomez',
        passenger_email: 'ana.gomez@example.com',
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});

    // --- OPCIONAL: Actualizar el estado de los asientos después de la inserción ---
    // Esto es muy importante para que el seeder de Bookings "ocupe" los asientos
    // Si no lo haces, la base de datos tendrá reservas, pero los asientos seguirán como 'is_available: true'
    await queryInterface.sequelize.query(
      `UPDATE "Seats" SET is_available = FALSE, updated_at = NOW() WHERE id IN (:seat1Id, :seat2Id);`,
      {
        replacements: { seat1Id: seat1.id, seat2Id: seat2.id },
        type: queryInterface.sequelize.QueryTypes.UPDATE
      }
    );
    // Y también decrementar el contador de asientos disponibles en las ofertas
    await queryInterface.sequelize.query(
      `UPDATE "FlightOfferings" SET seats_available = seats_available - 1, updated_at = NOW() WHERE id = :offering1Id;`,
      { replacements: { offering1Id: nyLaEcoOffering.offering_id }, type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
    await queryInterface.sequelize.query(
      `UPDATE "FlightOfferings" SET seats_available = seats_available - 1, updated_at = NOW() WHERE id = :offering2Id;`,
      { replacements: { offering2Id: miaChiBusOffering.offering_id }, type: queryInterface.sequelize.QueryTypes.UPDATE }
    );
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Bookings', null, {});
    // Al deshacer Bookings, es buena práctica reponer los asientos
    const seatsToRepopulate = await queryInterface.sequelize.query(
      `SELECT seat_id FROM "Bookings" WHERE booking_code IN ('BOOK-...');`, // Usar los códigos de reserva o IDs de los asientos que insertaste
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );
    const seatIds = seatsToRepopulate.map(s => s.seat_id);

    if (seatIds.length > 0) {
        await queryInterface.sequelize.query(
            `UPDATE "Seats" SET is_available = TRUE, updated_at = NOW() WHERE id IN (:seatIds);`,
            { replacements: { seatIds: seatIds }, type: queryInterface.sequelize.QueryTypes.UPDATE }
        );
        // También incrementar el contador de asientos en FlightOfferings
        // (Esto es más complejo en down, podrías omitirlo para simplificar)
    }
  }
};