const getDb = require('../../models/index.js'); // Ruta corregida

exports.createBooking = async (req, res) => {
  try {
    const db = await getDb();
    const { Booking } = await db;
    const { flight_id, seat, total_price, passenger_name, passenger_last_name, passenger_email, booking_code } = req.body;
    const user_id = req.userId;

    const bookingData = {
      flight_id,
      user_id,
      seat,
      total_price,
      passenger_name,
      passenger_last_name,
      passenger_email,
      booking_code
    };

    const booking = await Booking.create(bookingData);
    res.status(201).json(booking);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  try {
    const db = await getDb();
    const { Booking } = await db;
    const bookings = await Booking.findAll({
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: db.Flight, as: 'flight', attributes: ['id', 'flight_number', 'origin', 'destination'] },
        // No incluimos Passenger ya que los datos están en la misma tabla
      ]
    });
    res.json(bookings);
  } catch (error) {
    console.error('Error al obtener todas las reservas:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const db = await getDb();
    const { Booking } = await db;
    const booking = await Booking.findByPk(req.params.id, {
      include: [
        { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
        { model: db.Flight, as: 'flight', attributes: ['id', 'flight_number', 'origin', 'destination'] },
        // No incluimos Passenger
      ]
    });
    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }
    res.json(booking);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const updateData = req.body;

  try {
    const db = await getDb();
    const { Booking } = await db;
    const [updated] = await Booking.update(updateData, {
      where: { id }
    });
    if (updated) {
      const updatedBooking = await Booking.findByPk(id, {
        include: [
          { model: db.User, as: 'user', attributes: ['id', 'name', 'email'] },
          { model: db.Flight, as: 'flight', attributes: ['id', 'flight_number', 'origin', 'destination'] },
          // No incluimos Passenger
        ]
      });
      return res.json(updatedBooking);
    }
    return res.status(404).json({ message: 'Reserva no encontrada' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// --- MODIFICAR deleteBooking ---
exports.deleteBooking = async (req, res) => {
  try {
    const db = await getDb();
    const { Booking, User } = await db; // Necesitamos User para verificar rol admin
    const bookingId = req.params.id;
    const userId = req.userId; // ID del usuario que hace la petición

    // 1. Encontrar la reserva
    const booking = await Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Reserva no encontrada' });
    }

    // 2. Verificar Permisos: ¿Es el dueño O es admin?
    const requestingUser = await User.findByPk(userId); // Necesitamos saber si es admin
    const isAdmin = requestingUser?.role === 'admin';

    if (booking.user_id !== userId && !isAdmin) {
      // Si NO es el dueño Y NO es admin -> No autorizado
      return res.status(403).json({ message: 'No tienes permiso para eliminar esta reserva.' });
    }

    // 3. Si tiene permiso, eliminarla
    await booking.destroy(); // Usamos destroy en la instancia encontrada

    return res.status(204).send(); // No Content

  } catch (error) {
     console.error('Error al eliminar reserva:', error);
     // Devolvemos 400 o 500 según el tipo de error si es necesario
     res.status(500).json({ error: error.message });
  }
};

// --- NUEVA FUNCIÓN ---
exports.getMyBookings = async (req, res) => {
  try {
    const db = await getDb();
    const { Booking } = await db;
    const userId = req.userId; // Obtenido del token JWT por verifyToken middleware

    if (!userId) {
      // Esto no debería pasar si verifyToken funciona, pero por si acaso
      return res.status(401).json({ message: 'Usuario no autenticado.' });
    }

    const bookings = await Booking.findAll({
      where: { user_id: userId }, // Filtra por el ID del usuario logueado
      include: [
        // Incluimos el vuelo asociado, pero no el usuario (ya sabemos quién es)
        {
          model: db.Flight,
          as: 'flight',
          attributes: ['id', 'flight_number', 'origin', 'destination', 'departure_time', 'arrival_time']
        },
        // No necesitamos incluir db.User aquí normalmente
      ],
      order: [['created_at', 'DESC']] // Ordenar por fecha de creación descendente
    });

    res.json(bookings);
  } catch (error) {
    console.error('Error al obtener mis reservas:', error);
    res.status(500).json({ error: error.message });
  }
};