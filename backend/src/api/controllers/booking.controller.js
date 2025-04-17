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

exports.deleteBooking = async (req, res) => {
  try {
    const db = await getDb();
    const { Booking } = await db;
    const deleted = await Booking.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(204).send();
    }
    return res.status(404).json({ message: 'Reserva no encontrada' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};