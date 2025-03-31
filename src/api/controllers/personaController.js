const { validationResult } = require('express-validator');
const Persona = require('../../db/models/Persona');

// Obtener todas las personas
exports.getPersonas = async (req, res) => {
  try {
    const personas = await Persona.findAll();
    res.json(personas);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las personas', details: error.message });
  }
};

// Obtener una persona por ID
exports.getPersonaById = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({ error: `Persona con ID ${id} no encontrada` });
    }
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener la persona', details: error.message });
  }
};

// Crear una nueva persona
exports.createPersona = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { nombre, apellido, email } = req.body;

  try {
    // Verificar si el email ya existe
    const personaExistente = await Persona.findOne({ where: { email } });
    if (personaExistente) {
      return res.status(400).json({ error: 'El email ya está registrado' });
    }

    const nuevaPersona = await Persona.create({ nombre, apellido, email });
    res.status(201).json(nuevaPersona);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear la persona', details: error.message });
  }
};

// Actualizar una persona existente
exports.updatePersona = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { id } = req.params;
  const { nombre, apellido, email } = req.body;

  try {
    const persona = await Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({ error: `Persona con ID ${id} no encontrada` });
    }

    persona.nombre = nombre;
    persona.apellido = apellido;
    persona.email = email;

    await persona.save();
    res.json(persona);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar la persona', details: error.message });
  }
};

// Eliminar una persona
exports.deletePersona = async (req, res) => {
  const { id } = req.params;

  try {
    const persona = await Persona.findByPk(id);
    if (!persona) {
      return res.status(404).json({ error: `Persona con ID ${id} no encontrada` });
    }

    await persona.destroy();
    res.json({ message: 'Persona eliminada correctamente' });
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar la persona', details: error.message });
  }
};