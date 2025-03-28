const { Vuelo } = require('../../db/models');
const { validationResult } = require('express-validator');

const vueloController = {
  getVuelos: async (req, res) => {
    try {
      const vuelos = await Vuelo.findAll();
      res.json(vuelos);
    } catch (error) {
      console.error('Error al obtener vuelos:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  getVueloById: async (req, res) => {
    try {
      const vuelo = await Vuelo.findByPk(req.params.id);
      if (!vuelo) {
        return res.status(404).json({ error: 'Vuelo no encontrado' });
      }
      res.json(vuelo);
    } catch (error) {
      console.error('Error al obtener vuelo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  createVuelo: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const nuevoVuelo = await Vuelo.create(req.body);
      res.status(201).json(nuevoVuelo);
    } catch (error) {
      console.error('Error al crear vuelo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  updateVuelo: async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const vuelo = await Vuelo.findByPk(req.params.id);
      if (!vuelo) {
        return res.status(404).json({ error: 'Vuelo no encontrado' });
      }

      await vuelo.update(req.body);
      res.json(vuelo);
    } catch (error) {
      console.error('Error al actualizar vuelo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  },

  deleteVuelo: async (req, res) => {
    try {
      const vuelo = await Vuelo.findByPk(req.params.id);
      if (!vuelo) {
        return res.status(404).json({ error: 'Vuelo no encontrado' });
      }

      await vuelo.destroy();
      res.status(204).end();
    } catch (error) {
      console.error('Error al eliminar vuelo:', error);
      res.status(500).json({ error: 'Error interno del servidor' });
    }
  }
};

module.exports = vueloController;