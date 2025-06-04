'use strict';
const db = require('../../models/index.js'); // Asumiendo que exporta el objeto db directamente
const { Op } = require('sequelize'); // Necesario para algunas consultas

exports.createBooking = async (req, res) => {
  //const db = await getDb();
  const t = await db.sequelize.transaction(); // Iniciar transacción

  try {
    const {
      flight_offering_id, // CAMBIO: Recibimos el ID de la oferta
      seat,
      passenger_name,
      passenger_last_name,
      passenger_email,
      booking_code // Este debería generarse en el backend idealmente
    } = req.body;
    const user_id = req.userId; // Obtenido del token

    // --- Validaciones previas ---
    if (!flight_offering_id || !seat || !passenger_name || !passenger_last_name || !passenger_email) {
      await t.rollback();
      return res.status(400).json({ error: 'Faltan campos obligatorios para la reserva.' });
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

    // 2. Obtener la FlightOffering y verificar asientos disponibles
    const offering = await db.FlightOffering.findByPk(flight_offering_id, {
        include: [ // Incluir el vuelo para el código de reserva
            { model: db.Flight, as: 'flight', attributes: ['id', 'flight_number'] }
        ],
        transaction: t
    });

    if (!offering) {
      await t.rollback();
      return res.status(404).json({ error: 'Oferta de vuelo no encontrada.' });
    }

    if (offering.seats_available <= 0) {
      await t.rollback();
      return res.status(400).json({ error: 'No hay asientos disponibles para esta clase en este vuelo.' });
    }

    // 3. Generar booking_code si no se proporciona (mejor si es en backend)
    let finalBookingCode = booking_code;
    if (!finalBookingCode) {
        const flightNumberPart = offering.flight?.flight_number?.replace(/\s+/g, '') || 'FL';
        const userPart = user_id.substring(0, 4);
        const timePart = Date.now().toString().slice(-5);
        finalBookingCode = `BK-${userPart}-${flightNumberPart}-${timePart}`.toUpperCase();
    }


    // 4. Crear la reserva
    const bookingData = {
      flight_offering_id,
      user_id,
      seat,
      total_price: offering.price, // Tomar el precio de la oferta
      passenger_name,
      passenger_last_name,
      passenger_email,
      booking_code: finalBookingCode,
      status: 'confirmed' // O 'pending' si hay un paso de pago
    };

    const newBooking = await db.Booking.create(bookingData, { transaction: t });

    // 5. Descontar un asiento del FlightOffering
    await offering.decrement('seats_available', { by: 1, transaction: t });

    // Si todo fue bien, confirmar la transacción
    await t.commit();

    // Devolver la reserva creada con información anidada
    const resultBooking = await db.Booking.findByPk(newBooking.id, {
        include: [
            { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
            {
                model: db.FlightOffering,
                as: 'flightOffering',
                include: [
                    { model: db.Flight, as: 'flight', attributes: { exclude: ['created_at', 'updated_at'] } },
                    { model: db.FlightClass, as: 'flightClass', attributes: ['id', 'name'] }
                ]
            }
        ]
    });

    res.status(201).json(resultBooking);

  } catch (error) {
    await t.rollback(); // Asegurar rollback en cualquier error
    console.error('Error al crear reserva:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El código de reserva ya existe o conflicto de asiento.' }); // Ajustar mensaje
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => { // Para Admin
  try {
    const bookings = await db.Booking.findAll({
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
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

exports.updateBooking = async (req, res) => { // Principalmente para que admin cambie estado
  const { id: bookingId } = req.params;
  // Solo permitir actualizar campos específicos, ej: status
  const { status, seat, passenger_name, passenger_last_name, passenger_email } = req.body;
  const userId = req.userId; // Para verificar si es admin

  const updateData = {};
  if (status) updateData.status = status;
  // Un admin podría querer editar más datos si es necesario
  if (seat) updateData.seat = seat;
  if (passenger_name) updateData.passenger_name = passenger_name;
  if (passenger_last_name) updateData.passenger_last_name = passenger_last_name;
  if (passenger_email) updateData.passenger_email = passenger_email;


  if (Object.keys(updateData).length === 0) {
    return res.status(400).json({ error: 'No se proporcionaron datos para actualizar.' });
  }

  try {
    //const db = await getDb();

    // Verificar que quien actualiza es admin (o el dueño si solo actualiza ciertos campos)
    const requestingUser = await db.User.findByPk(userId);
    if (requestingUser?.role !== 'admin') {
        // Podrías añadir lógica para que el usuario actualice algo, pero es más complejo
        return res.status(403).json({ message: 'Solo los administradores pueden modificar reservas directamente.' });
    }

    const [updatedRows] = await db.Booking.update(updateData, {
      where: { id: bookingId }
    });

    if (updatedRows > 0) {
      const updatedBooking = await db.Booking.findByPk(bookingId, { /* ... include completo ... */ });
      return res.json(updatedBooking);
    }
    return res.status(404).json({ message: 'Reserva no encontrada o sin cambios.' });
  } catch (error) {
    console.error('Error al actualizar reserva:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  // La lógica de deleteBooking que ya tenías para verificar dueño o admin es buena.
  // La diferencia ahora es que si se borra una reserva, NO se debería reponer el asiento automáticamente
  // a menos que esa sea la lógica de negocio (ej. "cancelar" vs "eliminar").
  // La implementación actual simplemente borra el registro.
  try {
    //const db = await getDb();
    const { Booking, User } = await db;
    const bookingId = req.params.id;
    const userId = req.userId;

    const booking = await db.Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    const requestingUser = await User.findByPk(userId);
    const isAdmin = requestingUser?.role === 'admin';

    if (booking.user_id !== userId && !isAdmin) {
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta reserva.' });
    }

    // ANTES de borrar la reserva, podrías reponer el asiento si el status es 'confirmed' o 'pending'
    // if (booking.status === 'confirmed' || booking.status === 'pending') {
    //    const offering = await db.FlightOffering.findByPk(booking.flight_offering_id);
    //    if (offering) {
    //        await offering.increment('seats_available', { by: 1 });
    //    }
    // } // Esta lógica de reponer asiento es opcional y depende de tu negocio.

    await booking.destroy();
    return res.status(204).send();
  } catch (error) {
     console.error('Error al eliminar reserva:', error);
     res.status(500).json({ error: error.message });
  }
};