"use strict";
const db = require("../../models/index.js");

exports.getFlights = async (req, res) => {
  try {
    const where = {};

    // Filtro por aeropuerto
    if (req.query.origin_airport_id)
      where.origin_airport_id = req.query.origin_airport_id;
    if (req.query.destination_airport_id)
      where.destination_airport_id = req.query.destination_airport_id;

    // Filtro por ciudad (requiere include y having)
    const include = [
      {
        model: db.Airport,
        as: "originAirport",
        include: [{ model: db.City, as: "city" }],
      },
      {
        model: db.Airport,
        as: "destinationAirport",
        include: [{ model: db.City, as: "city" }],
      },
      {
        model: db.FlightOffering,
        as: "offerings",
        attributes: ["id", "seats_available", "price"],
        include: [
          {
            model: db.FlightClass,
            as: "flightClass",
            attributes: ["id", "name", "description"],
          },
        ],
      },
    ];

    // Si filtras por ciudad, filtra en memoria después de la consulta
    let flights = await db.Flight.findAll({
      where,
      include,
      order: [["departure_time", "ASC"]],
    });

    if (req.query.origin_city_id) {
      flights = flights.filter(
        (f) =>
          f.originAirport &&
          f.originAirport.city &&
          f.originAirport.city.id === req.query.origin_city_id
      );
    }
    if (req.query.destination_city_id) {
      flights = flights.filter(
        (f) =>
          f.destinationAirport &&
          f.destinationAirport.city &&
          f.destinationAirport.city.id === req.query.destination_city_id
      );
    }

    res.json(flights);
  } catch (error) {
    console.error("Error al obtener vuelos:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getFlightById = async (req, res) => {
  try {
    const flight = await db.Flight.findByPk(req.params.id, {
      include: [
        {
          model: db.Airport,
          as: "originAirport",
          include: [{ model: db.City, as: "city" }],
        },
        {
          model: db.Airport,
          as: "destinationAirport",
          include: [{ model: db.City, as: "city" }],
        },
        {
          model: db.FlightOffering,
          as: "offerings",
          attributes: ["id", "seats_available", "price"],
          include: [
            {
              model: db.FlightClass,
              as: "flightClass",
              attributes: ["id", "name", "description"],
            },
          ],
        },
      ],
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
    const {
      flight_number,
      origin_airport_id,
      destination_airport_id,
      departure_time,
      arrival_time,
      image_url,
    } = req.body;

    if (
      !flight_number ||
      !origin_airport_id ||
      !destination_airport_id ||
      !departure_time ||
      !arrival_time
    ) {
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios para el vuelo." });
    }

    const flightData = {
      flight_number,
      origin_airport_id,
      destination_airport_id,
      departure_time,
      arrival_time,
      image_url,
    };

    const flight = await db.Flight.create(flightData);
    res.status(201).json(flight);
  } catch (error) {
    console.error("Error al crear vuelo:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ error: "El número de vuelo ya existe." });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.updateFlight = async (req, res) => {
  try {
    const {
      flight_number,
      origin_airport_id,
      destination_airport_id,
      departure_time,
      arrival_time,
      image_url,
    } = req.body;
    const updateData = {};

    if (flight_number !== undefined) updateData.flight_number = flight_number;
    if (origin_airport_id !== undefined)
      updateData.origin_airport_id = origin_airport_id;
    if (destination_airport_id !== undefined)
      updateData.destination_airport_id = destination_airport_id;
    if (departure_time !== undefined)
      updateData.departure_time = departure_time;
    if (arrival_time !== undefined) updateData.arrival_time = arrival_time;
    if (image_url !== undefined) updateData.image_url = image_url;

    if (Object.keys(updateData).length === 0) {
      return res
        .status(400)
        .json({ error: "No se proporcionaron datos para actualizar." });
    }

    const [updatedRows] = await db.Flight.update(updateData, {
      where: { id: req.params.id },
      returning: true,
    });

    if (updatedRows > 0) {
      const updatedFlight = await db.Flight.findByPk(req.params.id, {
        include: [
          {
            model: db.Airport,
            as: "originAirport",
            include: [{ model: db.City, as: "city" }],
          },
          {
            model: db.Airport,
            as: "destinationAirport",
            include: [{ model: db.City, as: "city" }],
          },
          {
            model: db.FlightOffering,
            as: "offerings",
            attributes: ["id", "seats_available", "price"],
            include: [
              {
                model: db.FlightClass,
                as: "flightClass",
                attributes: ["id", "name"],
              },
            ],
          },
        ],
      });
      return res.json(updatedFlight);
    }
    return res
      .status(404)
      .json({ message: "Vuelo no encontrado o sin cambios." });
  } catch (error) {
    console.error("Error al actualizar vuelo:", error);
    res.status(400).json({ error: error.message });
  }
};

exports.deleteFlight = async (req, res) => {
  try {
    const flightId = req.params.id;
    const flight = await db.Flight.findByPk(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Vuelo no encontrado" });
    }
    await db.Flight.destroy({
      where: { id: flightId },
    });
    return res
      .status(200)
      .json({
        message: "Vuelo y sus ofertas/reservas asociadas eliminados con éxito",
      });
  } catch (error) {
    console.error("Error al eliminar vuelo:", error);
    res.status(500).json({ error: error.message });
  }
};
