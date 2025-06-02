'use strict';
const db = require('../../models/index.js'); // Asumiendo que exporta el objeto db directamente

exports.getFlights = async (req, res) => {
  try {
    const flights = await db.Flight.findAll({
      include: [
        {
          model: db.FlightOffering,
          as: 'offerings', // El alias que definimos en el modelo Flight
          attributes: ['id', 'seats_available', 'price'], // Atributos de la oferta
          include: [ // Anidamos para obtener el nombre de la clase
            {
              model: db.FlightClass,
              as: 'flightClass', // El alias que definimos en FlightOffering
              attributes: ['id', 'name', 'description'] // Atributos de la clase
            }
          ]
        }
      ],
      order: [['departure_time', 'ASC']] // Opcional: ordenar por fecha de salida
    });
    res.json(flights);
  } catch (error) {
    console.error('Error al obtener vuelos:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    //const db = await getDb();
    const flight = await db.Flight.findByPk(req.params.id, {
      include: [ // Mismo include que en getFlights
        {
          model: db.FlightOffering,
          as: 'offerings',
          attributes: ['id', 'seats_available', 'price'],
          include: [
            {
              model: db.FlightClass,
              as: 'flightClass',
              attributes: ['id', 'name', 'description']
            }
          ]
        }
      ]
    });
    if (!flight) {
      return res.status(404).json({ message: 'Vuelo no encontrado' });
    }
    res.json(flight);
  } catch (error) {
    console.error('Error al obtener vuelo por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createFlight = async (req, res) => {
  try {
    //const db = await getDb();
    // Extraemos los campos que SÍ pertenecen al modelo Flight
    const { flight_number, origin, destination, departure_time, arrival_time, image_url } = req.body;

    // Validaciones básicas (puedes añadir más)
    if (!flight_number || !origin || !destination || !departure_time || !arrival_time) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para el vuelo.' });
    }

    const flightData = {
        flight_number,
        origin,
        destination,
        departure_time,
        arrival_time,
        image_url // puede ser null
    };

    const flight = await db.Flight.create(flightData);
    // Nota: La creación de FlightOfferings se manejará por separado
    res.status(201).json(flight);
  } catch (error) {
    console.error('Error al crear vuelo:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El número de vuelo ya existe.' });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    //const db = await getDb();
    // Solo permitir actualizar campos que pertenecen a Flight
    const { flight_number, origin, destination, departure_time, arrival_time, image_url } = req.body;
    const updateData = {};

    if (flight_number !== undefined) updateData.flight_number = flight_number;
    if (origin !== undefined) updateData.origin = origin;
    if (destination !== undefined) updateData.destination = destination;
    if (departure_time !== undefined) updateData.departure_time = departure_time;
    if (arrival_time !== undefined) updateData.arrival_time = arrival_time;
    if (image_url !== undefined) updateData.image_url = image_url; // Permitir null para borrarla

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar.' });
    }

    const [updatedRows] = await db.Flight.update(updateData, {
      where: { id: req.params.id },
      returning: true // Para PostgreSQL, para obtener el objeto actualizado
    });

    if (updatedRows > 0) {
      // Volver a buscar el vuelo con sus ofertas para devolverlo completo
      const updatedFlight = await db.Flight.findByPk(req.params.id, {
         include: [
            {
              model: db.FlightOffering,
              as: 'offerings',
              attributes: ['id', 'seats_available', 'price'],
              include: [ { model: db.FlightClass, as: 'flightClass', attributes: ['id', 'name'] } ]
            }
          ]
      });
      return res.json(updatedFlight);
    }
    return res.status(404).json({ message: 'Vuelo no encontrado o sin cambios.' });
  } catch (error) {
    console.error('Error al actualizar vuelo:', error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFlight = async (req, res) => {
  try {
    //const db = await getDb();
    const flightId = req.params.id;

    // Opcional: Verificar si el vuelo existe antes de intentar eliminar
    const flight = await db.Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ message: 'Vuelo no encontrado' });
    }

    // La eliminación en cascada debería manejar FlightOfferings y Bookings
    // si las FK están configuradas con ON DELETE CASCADE
    await db.Flight.destroy({
      where: { id: flightId }
    });

    return res.status(200).json({ message: 'Vuelo y sus ofertas/reservas asociadas eliminados con éxito' });
  } catch (error) {
    console.error('Error al eliminar vuelo:', error);
    res.status(500).json({ error: error.message });
  }
};