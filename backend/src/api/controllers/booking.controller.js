'use strict';
const db = require('../../models/index.js'); // Asumiendo que exporta el objeto db directamente
const { Op } = require('sequelize'); // Necesario para algunas consultas

exports.createBooking = async (req, res) => {
  //const db = await getDb();
  const t = await db.sequelize.transaction(); // Iniciar transacción

  try {
    const {
      flight_offering_id, // CAMBIO: Recibimos el ID de la oferta
      seat_ids,
      passenger_name,
      passenger_last_name,
      passenger_email,
      booking_code // Este debería generarse en el backend idealmente
    } = req.body;
    const user_id = req.userId; // Obtenido del token

    // --- Validaciones ---
    if (!flight_offering_id || !seat_ids || !Array.isArray(seat_ids) || seat_ids.length === 0 || !passenger_name || !passenger_last_name || !passenger_email) {
      await t.rollback();
      return res.status(400).json({ error: 'Faltan campos obligatorios (oferta, al menos un asiento, pasajero).' });
    }

    // 1. Obtener el usuario para validar edad
    const user = await db.User.findByPk(user_id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }
    if (!user.fecha_nacimiento) {
      await t.rollback();
      return res.status(400).json({ error: 'El usuario no tiene registrada una fecha de nacimiento para validar la edad.' });
    }
    const hoy = new Date();
    const fechaNac = new Date(user.fecha_nacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if (edad < 18) { // Asumiendo 18 como mayoría de edad
      await t.rollback();
      return res.status(403).json({ error: 'El usuario debe ser mayor de 18 años para realizar una reserva.' });
    }

     // --- Obtener asientos y oferta ---
    const selectedSeats = await db.Seat.findAll({
        where: { id: seat_ids, is_available: true, flight_offering_id: flight_offering_id },
        transaction: t,
        include: [{ model: db.FlightOffering, as: 'flightOffering' }]
    });

    if (selectedSeats.length !== seat_ids.length) {
      await t.rollback();
      return res.status(400).json({ error: 'Alguno de los asientos seleccionados no es válido, no está disponible o no pertenece a esta oferta.' });
    }
    // Si algún asiento no está disponible, la consulta where: { is_available: true } ya lo filtraría.
    // También se valida que todos los asientos pertenezcan a la misma oferta.
    if (selectedSeats.some(seat => seat.flight_offering_id !== flight_offering_id)) {
        await t.rollback();
        return res.status(400).json({ error: 'Todos los asientos deben pertenecer a la misma oferta de vuelo.' });
    }


    // 3. Obtener la FlightOffering
    const offering = selectedSeats[0].flightOffering; // La oferta del primer asiento (debería ser la misma para todos)
    if (!offering) { await t.rollback(); return res.status(404).json({ error: 'Oferta de vuelo no asociada a los asientos.' }); }
    if (offering.seats_available < seat_ids.length) {
        await t.rollback();
        return res.status(400).json({ error: `Solo quedan ${offering.seats_available} asientos disponibles para esta clase, pero intentas reservar ${seat_ids.length}.` });
    }


    // 4. Generar booking_code
    let finalBookingCode = booking_code;
    if (!finalBookingCode) {
        const flightNumberPart = offering.flight?.flight_number?.replace(/\s+/g, '') || 'FL';
        const userPart = user_id.substring(0, 4);
        const timePart = Date.now().toString().slice(-5);
        finalBookingCode = `BK-${userPart}-${flightNumberPart}-${timePart}`.toUpperCase();
    }


    // 5. Crear la reserva
    const bookingData = {
      flight_offering_id: offering.id,
      user_id, 
      //seat_id: selectedSeats[0].id, // Usamos el primer asiento como referencia
      total_price: parseFloat(offering.price) * seat_ids.length, // Multiplicar por la cantidad de asientos
      passenger_name,
      passenger_last_name,
      passenger_email,
      booking_code: finalBookingCode,
      status: 'confirmed'
    };

    const newBooking = await db.Booking.create(bookingData, { transaction: t });

    // 6. Asociar los asientos a la reserva en la tabla intermedia BookingSeats
    const bookingSeatsEntries = seat_ids.map(seatId => ({
        booking_id: newBooking.id,
        seat_id: seatId,
        created_at: new Date(), // Asegúrate que BookingSeats tenga timestamps
        updated_at: new Date()
    }));
    await db.BookingSeats.bulkCreate(bookingSeatsEntries, { transaction: t });

     // 7. Marcar los asientos como no disponibles y descontar del contador de la oferta
    await db.Seat.update({ is_available: false }, { where: { id: seat_ids }, transaction: t });
    await offering.decrement('seats_available', { by: seat_ids.length, transaction: t });


    await t.commit(); // Confirmar transacción

    // Devolver la reserva creada con información anidada
    const resultBooking = await db.Booking.findByPk(newBooking.id, {
        include: [
            { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
            // Incluimos los asientos a través de la relación belongsToMany
            {
              model: db.Seat,
              as: 'seats', // <-- Alias 'seats' definido en Booking.js belongsToMany
              attributes: ['seat_number']
            },
            {
              model: db.FlightOffering,
              as: 'flightOffering',
              include: [
                  {
                    model: db.Flight,
                    as: 'flight',
                    attributes: { exclude: ['created_at', 'updated_at'] },
                    include: [
                        { model: db.Airport, as: 'originAirport', include: [{ model: db.City, as: 'city'}] },
                        { model: db.Airport, as: 'destinationAirport', include: [{ model: db.City, as: 'city'}] }
                    ]
                  },
                  { model: db.FlightClass, as: 'flightClass', attributes: ['id', 'name'] }
              ],
            }
        ]
    });

    res.status(201).json(resultBooking);

  } catch (error) {
    await t.rollback();
    console.error('Error al crear reserva:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El código de reserva ya existe o conflicto de asiento.' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'ID de asiento o de oferta de vuelo inválido.' });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => { // Para Admin
  try {
    const bookings = await db.Booking.findAll({
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
        // Incluir los asientos a través de la relación belongsToMany
        {
            model: db.Seat,
            as: 'seats', // Alias 'seats'
            attributes: ['seat_number']
        },
        {
          model: db.FlightOffering,
          as: 'flightOffering',
          attributes: ['id', 'price', 'seats_available'],
          include: [
            {
              model: db.FlightClass,
              as: 'flightClass',
              attributes: ['id', 'name']
            },
            { // Vuelo asociado a la oferta
              model: db.Flight,
              as: 'flight',
              attributes: ['id', 'flight_number', 'image_url', 'departure_time', 'arrival_time'],
              include: [ // Anidar Aeropuertos y Ciudades DENTRO de Flight
                {
                  model: db.Airport,
                  as: 'originAirport', // Alias definido en Flight.associate
                  attributes: ['name', 'iata_code'],
                  include: [{ model: db.City, as: 'city', attributes: ['name'] }]
                },
                {
                  model: db.Airport,
                  as: 'destinationAirport', // Alias definido en Flight.associate
                  attributes: ['name', 'iata_code'],
                  include: [{ model: db.City, as: 'city', attributes: ['name'] }]
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error al obtener todas las reservas (admin):', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) { /* ... */ }

    const bookings = await db.Booking.findAll({
      where: { user_id: userId },
      include: [
        {
            model: db.Seat,
            as: 'seats', // Alias 'seats'
            attributes: ['id', 'seat_number']
        },
        {
          model: db.FlightOffering,
          as: 'flightOffering',
          attributes: ['id', 'price'],
          include: [
            {
              model: db.FlightClass,
              as: 'flightClass',
              attributes: ['id', 'name', 'description']
            },
            { // Vuelo asociado a la oferta
              model: db.Flight,
              as: 'flight',
              attributes: ['id', 'flight_number', 'departure_time', 'arrival_time', 'image_url'],
              include: [ // Anidar Aeropuertos y Ciudades DENTRO de Flight
                {
                  model: db.Airport,
                  as: 'originAirport', // Alias definido en Flight.associate
                  attributes: ['name', 'iata_code'],
                  include: [{ model: db.City, as: 'city', attributes: ['name'] }]
                },
                {
                  model: db.Airport,
                  as: 'destinationAirport', // Alias definido en Flight.associate
                  attributes: ['name', 'iata_code'],
                  include: [{ model: db.City, as: 'city', attributes: ['name'] }]
                }
              ]
            }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    //const db = await getDb();
    const bookingId = req.params.id;
    const userId = req.userId; // Para verificar permisos

    const booking = await db.Booking.findByPk(bookingId, {
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] }, // Incluir para que el admin vea
        {
            model: db.Seat,
            as: 'seats', // Alias 'seats'
            attributes: ['seat_number']
        },
        {
          model: db.FlightOffering,
          as: 'flightOffering',
          include: [
            { model: db.Flight, as: 'flight' }, // Todos los atributos por defecto
            { model: db.FlightClass, as: 'flightClass' }
          ]
        }
      ]
    });

    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // Opcional: Verificar si el usuario logueado es el dueño o admin para ver esta reserva específica
    // const requestingUser = await db.User.findByPk(userId);
    // if (booking.user_id !== userId && requestingUser?.role !== 'admin') {
    //   return res.status(403).json({ message: 'No tienes permiso para ver esta reserva.' });
    // }

    res.json(booking);
  } catch (error) {
    console.error('Error al obtener reserva por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  const { id: bookingId } = req.params;
  // --- CAMBIO: Solo permitimos actualizar el estado (status) y quizás los datos del pasajero ---
  const { status, passenger_name, passenger_last_name, passenger_email } = req.body;
  const userId = req.userId;

  const updateData = {};
  if (status !== undefined) { // Usar !== undefined para permitir null o ""
      updateData.status = status;
  }
  if (passenger_name !== undefined) {
      updateData.passenger_name = passenger_name;
  }
  if (passenger_last_name !== undefined) {
      updateData.passenger_last_name = passenger_last_name;
  }
  if (passenger_email !== undefined) {
      updateData.passenger_email = passenger_email;
  }

  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron datos para actualizar.' });
  }

  try {
    const requestingUser = await db.User.findByPk(userId);
    if (requestingUser?.role !== 'admin') {
        return res.status(403).json({ message: 'Solo los administradores pueden modificar reservas.' });
    }

    const [updatedRows] = await db.Booking.update(updateData, {
      where: { id: bookingId }
    });

    if (updatedRows > 0) {
      // Devolver la reserva actualizada con todos sus includes (importante para el frontend)
      const updatedBooking = await db.Booking.findByPk(bookingId, {
          include: [
              { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
              { model: db.Seat, as: 'seats', attributes: ['seat_number'] }, // <-- Incluir asientos
              {
                  model: db.FlightOffering,
                  as: 'flightOffering',
                  include: [
                      { model: db.Flight, as: 'flight', include: [ { model: db.Airport, as: 'originAirport', include: [{ model: db.City, as: 'city'}]}, { model: db.Airport, as: 'destinationAirport', include: [{ model: db.City, as: 'city'}]} ] },
                      { model: db.FlightClass, as: 'flightClass' }
                  ]
              }
          ]
      });
      return res.json(updatedBooking);
    }
    return res.status(404).json({ message: 'Reserva no encontrada o sin cambios.' });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  const t = await db.sequelize.transaction(); // Iniciar transacción

  try {
    const { Booking, User, Seat, FlightOffering } = db;
    const bookingId = req.params.id;
    const userId = req.userId;

    // 1. Encontrar la reserva con sus asientos asociados
    const booking = await Booking.findByPk(bookingId, {
      include: [
        { model: db.Seat, as: 'seats', attributes: ['id', 'is_available'] }, // Incluir los asientos para reponer
        { model: db.FlightOffering, as: 'flightOffering', attributes: ['id', 'seats_available'] } // Incluir la oferta para reponer contador
      ],
      transaction: t // La búsqueda también debe ser parte de la transacción
    });

    if (!booking) { await t.rollback(); return res.status(404).json({ message: 'Reserva no encontrada' }); }

    // 2. Verificar Permisos
    const requestingUser = await User.findByPk(userId);
    const isAdmin = requestingUser?.role === 'admin';

    if (booking.user_id !== userId && !isAdmin) {
      await t.rollback();
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta reserva.' });
    }

    // 3. Reponer los asientos y el contador de la oferta (SI LA RESERVA ESTABA CONFIRMADA O PENDIENTE)
    if (booking.status === 'confirmed' || booking.status === 'pending') {
       const seatIdsToRepopulate = booking.seats.map(s => s.id); // Obtener IDs de todos los asientos de la reserva
       if (seatIdsToRepopulate.length > 0) {
           await Seat.update({ is_available: true }, { where: { id: seatIdsToRepopulate }, transaction: t }); // Marcar asientos como disponibles
       }
       if (booking.flightOffering) {
           await booking.flightOffering.increment('seats_available', { by: seatIdsToRepopulate.length, transaction: t }); // Aumentar contador de la oferta
       }
    }

    // 4. Eliminar la reserva
    await booking.destroy({ transaction: t }); // La eliminación también debe ser parte de la transacción
    await t.commit(); // Confirmar la transacción

    return res.status(204).send(); // No Content, indica éxito
  } catch (error) {
     await t.rollback(); // Asegurar rollback si algo falla
     console.error('Error al eliminar reserva:', error);
     res.status(500).json({ error: error.message });
  }
};