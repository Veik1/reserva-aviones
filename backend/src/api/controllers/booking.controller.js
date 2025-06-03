"use strict";
const db = require("../../models/index.js");
const { Op } = require("sequelize");

exports.createBooking = async (req, res) => {
  const t = await db.sequelize.transaction();
  const { card_number, expiry, cvv, ...rest } = req.body;

  try {
    // --- Validación de pago (simulada) ---
    if (!card_number || !expiry || !cvv) {
      await t.rollback();
      return res.status(400).json({ error: "Faltan datos de pago." });
    }
    if (!/^\d{4}-\d{4}-\d{4}-\d{4}$/.test(card_number)) {
      await t.rollback();
      return res.status(400).json({ error: "Número de tarjeta inválido. Debe tener el formato XXXX-XXXX-XXXX-XXXX" });
    }
    if (!/^\d{2}\/\d{2}$/.test(expiry)) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Formato de vencimiento inválido." });
    }
    const [mm, yy] = expiry.split("/").map(Number);
    const now = new Date();
    const expDate = new Date(2000 + yy, mm);
    if (expDate < now) {
      await t.rollback();
      return res.status(400).json({ error: "La tarjeta está vencida." });
    }
    if (!/^\d{3,4}$/.test(cvv)) {
      await t.rollback();
      return res.status(400).json({ error: "CVV inválido." });
    }
    // --- Fin validación de pago ---

    const {
      flight_offering_id,
      seat,
      passenger_name,
      passenger_last_name,
      passenger_email,
      booking_code,
    } = rest;
    const user_id = req.userId;

    if (
      !flight_offering_id ||
      !seat ||
      !passenger_name ||
      !passenger_last_name ||
      !passenger_email
    ) {
      await t.rollback();
      return res
        .status(400)
        .json({ error: "Faltan campos obligatorios para la reserva." });
    }

    const user = await db.User.findByPk(user_id, { transaction: t });
    if (!user) {
      await t.rollback();
      return res.status(404).json({ error: "Usuario no encontrado." });
    }
    if (!user.fecha_nacimiento) {
      await t.rollback();
      return res.status(400).json({
        error:
          "El usuario no tiene registrada una fecha de nacimiento para validar la edad.",
      });
    }

    const hoy = new Date();
    const fechaNac = new Date(user.fecha_nacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if (edad < 18) {
      await t.rollback();
      return res.status(403).json({
        error:
          "El usuario debe ser mayor de 18 años para realizar una reserva.",
      });
    }

    const offering = await db.FlightOffering.findByPk(flight_offering_id, {
      include: [
        { model: db.Flight, as: "flight", attributes: ["id", "flight_number"] },
      ],
      transaction: t,
    });

    if (!offering) {
      await t.rollback();
      return res.status(404).json({ error: "Oferta de vuelo no encontrada." });
    }

    if (offering.seats_available <= 0) {
      await t.rollback();
      return res.status(400).json({
        error: "No hay asientos disponibles para esta clase en este vuelo.",
      });
    }

    let finalBookingCode = booking_code;
    if (!finalBookingCode) {
      const flightNumberPart =
        offering.flight?.flight_number?.replace(/\s+/g, "") || "FL";
      const userPart = user_id.substring(0, 4);
      const timePart = Date.now().toString().slice(-5);
      finalBookingCode =
        `BK-${userPart}-${flightNumberPart}-${timePart}`.toUpperCase();
    }

    const bookingData = {
      flight_offering_id,
      user_id,
      seat,
      total_price: offering.price,
      passenger_name,
      passenger_last_name,
      passenger_email,
      booking_code: finalBookingCode,
      status: "confirmed",
    };

    const newBooking = await db.Booking.create(bookingData, { transaction: t });
    await offering.decrement("seats_available", { by: 1, transaction: t });
    await t.commit();

    const resultBooking = await db.Booking.findByPk(newBooking.id, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: db.FlightOffering,
          as: "flightOffering",
          include: [
            {
              model: db.Flight,
              as: "flight",
              attributes: [
                "id",
                "flight_number",
                "origin_airport_id",
                "destination_airport_id",
                "departure_time",
                "arrival_time",
                "image_url",
              ],
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
              ],
            },
            {
              model: db.FlightClass,
              as: "flightClass",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
    });

    res.status(201).json(resultBooking);
  } catch (error) {
    await t.rollback();
    console.error("Error al crear reserva:", error);
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({
        error: "El código de reserva ya existe o conflicto de asiento.",
      });
    }
    res.status(400).json({ error: error.message });
  }
};

exports.getBookings = async (req, res) => {
  // Para Admin
  try {
    const bookings = await db.Booking.findAll({
      include: [
        { model: db.User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: db.FlightOffering,
          as: "flightOffering",
          attributes: ["id", "price", "seats_available"],
          include: [
            {
              model: db.Flight,
              as: "flight",
              attributes: [
                "id",
                "flight_number",
                "origin_airport_id",
                "destination_airport_id",
                "departure_time",
                "arrival_time",
                "image_url",
              ],
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
              ],
            },
            {
              model: db.FlightClass,
              as: "flightClass",
              attributes: ["id", "name"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error al obtener todas las reservas:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.userId;

    if (!userId) {
      return res.status(401).json({ message: "Usuario no autenticado." });
    }

    const bookings = await db.Booking.findAll({
      where: { user_id: userId },
      include: [
        {
          model: db.FlightOffering,
          as: "flightOffering",
          attributes: ["id", "price"],
          include: [
            {
              model: db.Flight,
              as: "flight",
              attributes: [
                "id",
                "flight_number",
                "origin_airport_id",
                "destination_airport_id",
                "departure_time",
                "arrival_time",
                "image_url",
              ],
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
              ],
            },
            {
              model: db.FlightClass,
              as: "flightClass",
              attributes: ["id", "name", "description"],
            },
          ],
        },
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(bookings);
  } catch (error) {
    console.error("Error al obtener mis reservas:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const bookingId = req.params.id;
    const userId = req.userId;

    const booking = await db.Booking.findByPk(bookingId, {
      include: [
        { model: db.User, as: "user", attributes: ["id", "name", "email"] },
        {
          model: db.FlightOffering,
          as: "flightOffering",
          include: [
            {
              model: db.Flight,
              as: "flight",
              attributes: [
                "id",
                "flight_number",
                "origin_airport_id",
                "destination_airport_id",
                "departure_time",
                "arrival_time",
                "image_url",
              ],
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
              ],
            },
            { model: db.FlightClass, as: "flightClass" },
          ],
        },
      ],
    });

    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    res.json(booking);
  } catch (error) {
    console.error("Error al obtener reserva por ID:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateBooking = async (req, res) => {
  const { id: bookingId } = req.params;
  const { status, seat, passenger_name, passenger_last_name, passenger_email } =
    req.body;
  const userId = req.userId;

  const updateData = {};
  if (status) updateData.status = status;
  if (seat) updateData.seat = seat;
  if (passenger_name) updateData.passenger_name = passenger_name;
  if (passenger_last_name) updateData.passenger_last_name = passenger_last_name;
  if (passenger_email) updateData.passenger_email = passenger_email;

  if (Object.keys(updateData).length === 0) {
    return res
      .status(400)
      .json({ error: "No se proporcionaron datos para actualizar." });
  }

  try {
    const requestingUser = await db.User.findByPk(userId);
    if (requestingUser?.role !== "admin") {
      return res.status(403).json({
        message:
          "Solo los administradores pueden modificar reservas directamente.",
      });
    }

    const [updatedRows] = await db.Booking.update(updateData, {
      where: { id: bookingId },
    });

    if (updatedRows > 0) {
      const updatedBooking = await db.Booking.findByPk(bookingId, {
        include: [
          { model: db.User, as: "user", attributes: ["id", "name", "email"] },
          {
            model: db.FlightOffering,
            as: "flightOffering",
            include: [
              {
                model: db.Flight,
                as: "flight",
                attributes: [
                  "id",
                  "flight_number",
                  "origin_airport_id",
                  "destination_airport_id",
                  "departure_time",
                  "arrival_time",
                  "image_url",
                ],
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
                ],
              },
              { model: db.FlightClass, as: "flightClass" },
            ],
          },
        ],
      });
      return res.json(updatedBooking);
    }
    return res
      .status(404)
      .json({ message: "Reserva no encontrada o sin cambios." });
  } catch (error) {
    console.error("Error al actualizar reserva:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteBooking = async (req, res) => {
  try {
    const { Booking, User } = await db;
    const bookingId = req.params.id;
    const userId = req.userId;

    const booking = await db.Booking.findByPk(bookingId);
    if (!booking) {
      return res.status(404).json({ message: "Reserva no encontrada" });
    }

    const requestingUser = await User.findByPk(userId);
    const isAdmin = requestingUser?.role === "admin";

    if (booking.user_id !== userId && !isAdmin) {
      return res
        .status(403)
        .json({ message: "No tienes permiso para eliminar esta reserva." });
    }

    await booking.destroy();
    return res.status(204).send();
  } catch (error) {
    console.error("Error al eliminar reserva:", error);
    res.status(500).json({ error: error.message });
  }
};
