const { validationResult } = require('express-validator');
const Reserva = require('../../db/models/Reserva');
const Persona = require('../../db/models/Persona');
const Vuelo = require('../../db/models/Vuelo');

// Obtener todas las reservas
exports.getReservas = async (req, res) => {
  try {
    const reservas = await Reserva.findAll({
      include: [
        { model: Persona, as: 'persona' },
        { model: Vuelo, as: 'vuelo' },
      ],
    });
    res.json(reservas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las reservas', details: error.message });
  }
};

// Obtener una reserva por ID
exports.getReservaById = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await Reserva.findByPk(id, {
      include: [
        { model: Persona, as: 'persona' },
        { model: Vuelo, as: 'vuelo' },
      ],
    });
    if (!reserva) {
      return res.status(404).json({ error: `Reserva con ID ${id} no encontrada` });
    }
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la reserva', details: error.message });
  }
};

// Crear una nueva reserva
exports.createReserva = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { personaId, vueloId, fecha_reserva } = req.body;

  // Validar que los campos requeridos estén presentes
  if (!personaId || !vueloId || !fecha_reserva) {
    return res.status(400).json({ error: 'personaId, vueloId y fecha_reserva son obligatorios' });
  }

  try {
    // Validar que la persona exista
    const persona = await Persona.findByPk(personaId);
    if (!persona) {
      return res.status(400).json({ error: 'La persona no existe' });
    }

    // Validar que el vuelo exista
    const vuelo = await Vuelo.findByPk(vueloId);
    if (!vuelo) {
      return res.status(400).json({ error: 'El vuelo no existe' });
    }

    // Crear la reserva
    const nuevaReserva = await Reserva.create({ personaId, vueloId, fecha_reserva });
    res.status(201).json(nuevaReserva);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la reserva', details: error.message });
  }
};

// Actualizar una reserva existente
exports.updateReserva = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { personaId, vueloId, fecha_reserva } = req.body;

  try {
    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ error: `Reserva con ID ${id} no encontrada` });
    }

    if (personaId) {
      const persona = await Persona.findByPk(personaId);
      if (!persona) {
        return res.status(400).json({ error: 'La persona no existe' });
      }
      reserva.personaId = personaId;
    }

    if (vueloId) {
      const vuelo = await Vuelo.findByPk(vueloId);
      if (!vuelo) {
        return res.status(400).json({ error: 'El vuelo no existe' });
      }
      reserva.vueloId = vueloId;
    }

    if (fecha_reserva) {
      reserva.fecha_reserva = fecha_reserva;
    }

    await reserva.save();
    res.json(reserva);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la reserva', details: error.message });
  }
};

// Eliminar una reserva
exports.deleteReserva = async (req, res) => {
  const { id } = req.params;

  try {
    const reserva = await Reserva.findByPk(id);
    if (!reserva) {
      return res.status(404).json({ error: `Reserva con ID ${id} no encontrada` });
    }

    await reserva.destroy();
    res.json({ message: 'Reserva eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la reserva', details: error.message });
  }
};