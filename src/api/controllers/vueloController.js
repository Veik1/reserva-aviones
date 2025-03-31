const { validationResult } = require('express-validator');
const validateId = require('../../utils/validateId');
const { Vuelo } = require('../../db/models');

// Obtener todos los vuelos
exports.getVuelos = async (req, res) => {
  try {
    const vuelos = await Vuelo.findAll();
    res.json(vuelos);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los vuelos', details: error.message });
  }
};

// Obtener un vuelo por ID
exports.getVueloById = async (req, res) => {
  const { id } = req.params;

  if (!validateId(id)) {
    return res.status(400).json({ error: 'El ID proporcionado no es válido' });
  }

  try {
    const vuelo = await Vuelo.findByPk(id);
    if (!vuelo) {
      return res.status(404).json({ error: `Vuelo con ID ${id} no encontrado` });
    }
    res.json(vuelo);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el vuelo', details: error.message });
  }
};

// Crear un nuevo vuelo
exports.createVuelo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { numero_vuelo, origen, destino, fecha } = req.body;

  try {
    const nuevoVuelo = await Vuelo.create({ numero_vuelo, origen, destino, fecha });
    res.status(201).json(nuevoVuelo);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el vuelo', details: error.message });
  }
};

// Actualizar un vuelo existente
exports.updateVuelo = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { numero_vuelo, origen, destino, fecha } = req.body;

  try {
    const vuelo = await Vuelo.findByPk(req.params.id);
    if (!vuelo) {
      return res.status(404).json({ error: `Vuelo con ID ${req.params.id} no encontrado` });
    }

    vuelo.numero_vuelo = numero_vuelo;
    vuelo.origen = origen;
    vuelo.destino = destino;
    vuelo.fecha = fecha;

    await vuelo.save();
    res.json(vuelo);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el vuelo', details: error.message });
  }
};

// Eliminar un vuelo
exports.deleteVuelo = async (req, res) => {
  try {
    const vuelo = await Vuelo.findByPk(req.params.id);
    if (!vuelo) {
      return res.status(404).json({ error: `Vuelo con ID ${req.params.id} no encontrado` });
    }

    await vuelo.destroy();
    res.json({ message: 'Vuelo eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el vuelo', details: error.message });
  }
};