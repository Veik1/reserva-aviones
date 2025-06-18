'use strict';
const db = require('../../models/index.js');

exports.getFlights = async (req, res) => {
  try {
    const flights = await db.Flight.findAll({
      include: [
        { // Para las ofertas de clase
          model: db.FlightOffering,
          as: 'offerings',
          attributes: ['id', 'seats_available', 'price'],
          include: [{ model: db.FlightClass, as: 'flightClass', attributes: ['id', 'name'] }]
        },
        // --- INCLUDES PARA ORIGEN Y DESTINO ---
        {
          model: db.Airport,
          as: 'originAirport', // Alias definido en Flight.associate
          attributes: ['id', 'name', 'iata_code'],
          include: [{ model: db.City, as: 'city', attributes: ['id', 'name'] }] // Alias definido en Airport.associate
        },
        {
          model: db.Airport,
          as: 'destinationAirport', // Alias definido en Flight.associate
          attributes: ['id', 'name', 'iata_code'],
          include: [{ model: db.City, as: 'city', attributes: ['id', 'name'] }] // Alias definido en Airport.associate
        }
        // --- FIN INCLUDES ---
      ],
      order: [['departure_time', 'ASC']]
    });
    res.json(flights);
  } catch (error) {
    console.error("Error al obtener vuelos:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await db.Flight.findByPk(req.params.id, {
      include: [ // Mismo include completo que en getFlights
        {
          model: db.FlightOffering,
          as: "offerings",
          attributes: ["id", "seats_available", "price"],
          include: [
            {
              model: db.FlightClass,
              as: 'flightClass',
              attributes: ['id', 'name', 'description']
            }
          ]
        },
        // --- AÑADIR ESTOS PARA DETALLES DEL VUELO ---
        {
          model: db.Airport,
          as: 'originAirport',
          attributes: ['name', 'iata_code'],
          include: [{ model: db.City, as: 'city', attributes: ['name'] }]
        },
        {
          model: db.Airport,
          as: 'destinationAirport',
          attributes: ['name', 'iata_code'],
          include: [{ model: db.City, as: 'city', attributes: ['name'] }]
        }
        // --- FIN AÑADIR ---
      ]
    });
    if (!flight) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }
    res.json(flight);
  } catch (error) {
    console.error("Error al obtener vuelo por ID:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createFlight = async (req, res) => {
  try {
    // Ahora esperamos IDs de aeropuerto, no strings de origen/destino
    const {
        flight_number,
        origin_airport_id,      // CAMBIADO
        destination_airport_id, // CAMBIADO
        departure_time,
        arrival_time,
        image_url
    } = req.body;

    if (!flight_number || !origin_airport_id || !destination_airport_id || !departure_time || !arrival_time) {
        return res.status(400).json({ error: 'Faltan campos obligatorios para el vuelo (incluyendo IDs de aeropuerto).' });
    }

    // Verificar que los aeropuertos existan (opcional pero recomendado)
    const originAirport = await db.Airport.findByPk(origin_airport_id);
    const destinationAirport = await db.Airport.findByPk(destination_airport_id);
    if (!originAirport || !destinationAirport) {
        return res.status(404).json({ error: 'Uno o ambos aeropuertos especificados no existen.' });
    }

    const flightData = {
        flight_number,
        origin_airport_id,      // USAR ID
        destination_airport_id, // USAR ID
        departure_time,
        arrival_time,
        image_url
    };

    const flight = await db.Flight.create(flightData);
    // Para devolver el vuelo con los nombres de aeropuerto/ciudad, necesitamos volver a buscarlo con includes
    const newFlightWithDetails = await db.Flight.findByPk(flight.id, {
        include: [
            { model: db.Airport, as: 'originAirport', include: [{ model: db.City, as: 'city'}] },
            { model: db.Airport, as: 'destinationAirport', include: [{ model: db.City, as: 'city'}] }
        ]
    });
    res.status(201).json(newFlightWithDetails);
  } catch (error) {
    console.error('Error al crear vuelo:', error);
    if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({ error: 'El número de vuelo ya existe.' });
    }
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'ID de aeropuerto de origen o destino inválido.' });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const {
        flight_number,
        origin_airport_id,      // CAMBIADO
        destination_airport_id, // CAMBIADO
        departure_time,
        arrival_time,
        image_url
    } = req.body;
    const updateData = {};

    if (flight_number !== undefined) updateData.flight_number = flight_number;
    if (origin_airport_id !== undefined) updateData.origin_airport_id = origin_airport_id;
    if (destination_airport_id !== undefined) updateData.destination_airport_id = destination_airport_id;
    if (departure_time !== undefined) updateData.departure_time = departure_time;
    if (arrival_time !== undefined) updateData.arrival_time = arrival_time;
    if (image_url !== undefined) updateData.image_url = image_url;

    if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ error: 'No se proporcionaron datos para actualizar.' });
    }

    // Opcional: Validar que los nuevos airport_ids existen si se están actualizando
    if (updateData.origin_airport_id && !(await db.Airport.findByPk(updateData.origin_airport_id))) {
        return res.status(404).json({ error: 'El nuevo aeropuerto de origen no existe.' });
    }
    if (updateData.destination_airport_id && !(await db.Airport.findByPk(updateData.destination_airport_id))) {
        return res.status(404).json({ error: 'El nuevo aeropuerto de destino no existe.' });
    }

    const [updatedRows] = await db.Flight.update(updateData, {
      where: { id: req.params.id }
      // No podemos usar 'returning: true' directamente con update si no tenemos la instancia.
    });

    if (updatedRows > 0) {
      const updatedFlight = await db.Flight.findByPk(req.params.id, { // Volver a buscar con todos los includes
         include: [
            { model: db.FlightOffering, as: 'offerings', include: [ { model: db.FlightClass, as: 'flightClass' } ] },
            { model: db.Airport, as: 'originAirport', include: [{ model: db.City, as: 'city'}] },
            { model: db.Airport, as: 'destinationAirport', include: [{ model: db.City, as: 'city'}] }
          ]
      });
      return res.json(updatedFlight);
    }
    return res
      .status(404)
      .json({ message: "Vuelo no encontrado o sin cambios." });
  } catch (error) {
    console.error('Error al actualizar vuelo:', error);
    if (error.name === 'SequelizeForeignKeyConstraintError') {
        return res.status(400).json({ error: 'ID de aeropuerto de origen o destino inválido al actualizar.' });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFlight = async (req, res) => {
  // ... (Esta función no necesita grandes cambios, la cascada debería funcionar) ...
  try {
    const flightId = req.params.id;
    const flight = await db.Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }
    await db.Flight.destroy({ where: { id: flightId } });
    return res.status(200).json({ message: 'Vuelo y sus ofertas/reservas asociadas eliminados con éxito' });
  } catch (error) {
    console.error("Error al eliminar vuelo:", error);
    res.status(500).json({ error: error.message });
  }
};
