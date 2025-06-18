'use strict';
const db = require('../../models/index.js');
const { v4: uuidv4 } = require('uuid'); // Necesario para generar IDs para los asientos

// Obtener todas las ofertas para un vuelo específico
exports.getOfferingsByFlight = async (req, res) => {
    try {
        //const db = await getDb();
        const { flightId } = req.params;

        const flight = await db.Flight.findByPk(flightId);
        if (!flight) {
            return res.status(404).json({ message: 'Vuelo no encontrado.' });
        }

        const offerings = await db.FlightOffering.findAll({
            where: { flight_id: flightId },
            include: [
                { model: db.FlightClass, as: 'flightClass', attributes: ['id', 'name', 'description'] }
            ],
            order: [
                // Opcional: Ordenar por algún criterio, ej. precio o nombre de clase
                // [ { model: db.FlightClass, as: 'flightClass' }, 'name', 'ASC' ]
            ]
        });
        res.json(offerings);
    } catch (error) {
        console.error('Error al obtener ofertas del vuelo:', error);
        res.status(500).json({ error: error.message });
    }
};

// Crear una nueva oferta de clase para un vuelo
exports.createFlightOffering = async (req, res) => {
    const t = await db.sequelize.transaction(); // Iniciar transacción
    try {
        //const db = await getDb();
        const { flight_id, flight_class_id, seats_available, price } = req.body;

        const numSeats = parseInt(seats_available, 10);

        if (!flight_id || !flight_class_id || seats_available === undefined || price === undefined) {
            await t.rollback(); // Rollback si hay error de validación
            return res.status(400).json({ error: 'Faltan campos obligatorios (flight_id, flight_class_id, seats_available, price).' });
        }
        // Ahora la validación de numSeats tiene sentido
        if (isNaN(numSeats) || numSeats < 0 || parseFloat(price) < 0) { // Añadir isNaN(numSeats)
            await t.rollback();
            return res.status(400).json({ error: 'Asientos debe ser un número válido y no negativo. Precio no puede ser negativo.' });
        }

        const flight = await db.Flight.findByPk(flight_id, { transaction: t }); // Añadir transacción
        const flightClass = await db.FlightClass.findByPk(flight_class_id, { transaction: t }); // Añadir transacción

        if (!flight) { await t.rollback(); return res.status(404).json({ message: 'Vuelo no encontrado para crear la oferta.' }); }
        if (!flightClass) { await t.rollback(); return res.status(404).json({ message: 'Clase de vuelo no encontrada para crear la oferta.' }); }

        // Verificar si ya existe una oferta para esta clase en este vuelo
        const existingOffering = await db.FlightOffering.findOne({
            where: { flight_id, flight_class_id }, transaction: t // Añadir transacción
        });
        if (existingOffering) {
            await t.rollback();
            return res.status(409).json({ error: `Ya existe una oferta para la clase '${flightClass.name}' en el vuelo '${flight.flight_number}'.` });
        }

        const newOffering = await db.FlightOffering.create({
            flight_id,
            flight_class_id,
            seats_available: numSeats, // Usar numSeats
            price
        }, { transaction: t });

        if (numSeats > 0) {
            const seatsToCreate = [];
            const seatRows = ['A', 'B', 'C', 'D', 'E', 'F'];
            const maxRowNumberPerOffering = Math.ceil(numSeats / seatRows.length) + 5;
            let generatedCount = 0;

            for (let row = 1; row <= maxRowNumberPerOffering && generatedCount < numSeats; row++) {
              for (const col of seatRows) {
                if (generatedCount >= numSeats) break;
                seatsToCreate.push({
                  id: uuidv4(),
                  flight_offering_id: newOffering.id,
                  seat_number: `${row}${col}`,
                  is_available: true,
                  created_at: new Date(),
                  updated_at: new Date()
                });
                generatedCount++;
              }
            }
            if (seatsToCreate.length > 0) { // Solo si hay asientos para crear
                await db.Seat.bulkCreate(seatsToCreate, { transaction: t });
            }
        }

        await t.commit(); // Confirmar la transacción

        const result = await db.FlightOffering.findByPk(newOffering.id, {
             include: [ { model: db.FlightClass, as: 'flightClass', attributes: ['id', 'name'] } ]
        });
        res.status(201).json(result);
    } catch (error) {
        await t.rollback(); // Asegurarse de hacer rollback en cualquier error
        console.error('Error al crear oferta de vuelo:', error);
        res.status(400).json({ error: error.message });
    }
};

// Actualizar una oferta de clase
exports.updateFlightOffering = async (req, res) => {
    try {
        //const db = await getDb();
        const { offeringId } = req.params; // ID de la FlightOffering
        const { seats_available, price } = req.body;
        const updateData = {};

        if (seats_available !== undefined) {
            if(parseInt(seats_available, 10) < 0) return res.status(400).json({ error: 'Asientos no pueden ser negativos.' });
            updateData.seats_available = seats_available;
        }
        if (price !== undefined) {
            if(parseFloat(price) < 0) return res.status(400).json({ error: 'Precio no puede ser negativo.' });
            updateData.price = price;
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({ error: 'No se proporcionaron datos (seats_available o price) para actualizar.' });
        }

        const [updatedRows] = await db.FlightOffering.update(updateData, {
            where: { id: offeringId }
        });

        if (updatedRows > 0) {
            const updatedOffering = await db.FlightOffering.findByPk(offeringId, {
                include: [
                    { model: db.FlightClass, as: 'flightClass', attributes: ['id', 'name'] },
                    { model: db.Flight, as: 'flight', attributes: ['id', 'flight_number'] } // Opcional
                ]
            });
            return res.json(updatedOffering);
        }
        return res.status(404).json({ message: 'Oferta de vuelo no encontrada.' });
    } catch (error) {
        console.error('Error al actualizar oferta de vuelo:', error);
        res.status(400).json({ error: error.message });
    }
};

// Eliminar una oferta de clase
exports.deleteFlightOffering = async (req, res) => {
    try {
        //const db = await getDb();
        const { offeringId } = req.params;

        const offering = await db.FlightOffering.findByPk(offeringId);
        if (!offering) {
            return res.status(404).json({ message: 'Oferta de vuelo no encontrada.' });
        }

        // Considerar si hay reservas asociadas. Si las FK tienen ON DELETE RESTRICT, fallará.
        // Si tienen ON DELETE CASCADE, las reservas se borrarán (¿es lo deseado?).
        // Podrías añadir una lógica para impedir borrar si hay reservas activas.
        const bookingCount = await db.Booking.count({ where: { flight_offering_id: offeringId }});
        if (bookingCount > 0) {
            return res.status(400).json({ message: `No se puede eliminar la oferta porque tiene ${bookingCount} reservas asociadas. Considere cambiar el estado de las reservas primero o actualizar la oferta.` });
        }


        await offering.destroy();
        res.status(200).json({ message: 'Oferta de vuelo eliminada correctamente.' });
    } catch (error) {
        console.error('Error al eliminar oferta de vuelo:', error);
        res.status(500).json({ error: error.message });
    }
};

exports.getSeatsByOfferingId = async (req, res) => {
    try {
        const { offeringId } = req.params;
        const seats = await db.Seat.findAll({
            where: { flight_offering_id: offeringId },
            order: [['seat_number', 'ASC']]
            // AQUI NO DEBERÍA HABER INCLUDES POR AHORA, YA QUE SOLO QUEREMOS EL SEAT
        });
        res.json(seats);
    } catch (error) {
        console.error('Error al obtener asientos por oferta:', error);
        res.status(500).json({ error: error.message });
    }
};