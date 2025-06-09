'use strict';
const { v4: uuidv4 } = require('uuid');

module.exports = {
  async up (queryInterface, Sequelize) {
    // 1. Obtener todas las FlightOfferings existentes
    const offerings = await queryInterface.sequelize.query(
      `SELECT fo.id, fo.seats_available,
              f.flight_number, fc.name as class_name
       FROM "FlightOfferings" fo
       JOIN "Flights" f ON fo.flight_id = f.id
       JOIN "FlightClasses" fc ON fo.flight_class_id = fc.id;`,
      { type: queryInterface.sequelize.QueryTypes.SELECT }
    );

    const allSeats = [];
    const seatRows = ['A', 'B', 'C', 'D', 'E', 'F']; // Columnas de asientos comunes
    const maxRowNumber = 20; // Número máximo de filas para generar asientos

    if (offerings.length === 0) {
        console.warn("ADVERTENCIA: No se encontraron ofertas de vuelo para generar asientos. Asegúrate de que el seeder de FlightOfferings se haya ejecutado.");
    }

    // 2. Para cada oferta, generar sus asientos
    for (const offering of offerings) {
      const numSeatsToGenerate = parseInt(offering.seats_available, 10);
      let generatedCount = 0;

      // Generar asientos hasta alcanzar seats_available o hasta que nos quedemos sin combinaciones
      for (let row = 1; row <= maxRowNumber && generatedCount < numSeatsToGenerate; row++) {
        for (const col of seatRows) {
          if (generatedCount >= numSeatsToGenerate) {
            break; // Ya generamos suficientes asientos para esta oferta
          }
          const seatNumber = `${row}${col}`;
          allSeats.push({
            id: uuidv4(),
            flight_offering_id: offering.id,
            seat_number: seatNumber,
            is_available: true, // Todos disponibles al inicio
            created_at: new Date(),
            updated_at: new Date()
          });
          generatedCount++;
        }
      }
      if (generatedCount < numSeatsToGenerate) {
          console.warn(`ADVERTENCIA: No se pudieron generar suficientes combinaciones de asientos para la oferta ${offering.flight_number} (${offering.class_name}). Generados ${generatedCount} de ${numSeatsToGenerate}.`);
      }
    }

    // 3. Insertar todos los asientos generados en la base de datos
    if (allSeats.length > 0) {
      await queryInterface.bulkInsert('Seats', allSeats, {});
      console.log(`Seeder de Asientos: Se insertaron ${allSeats.length} asientos.`);
    } else {
      console.log("Seeder de Asientos: No se generaron asientos para insertar.");
    }
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Seats', null, {});
  }
};