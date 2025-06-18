'use strict';
const db = require('../../models/index.js');

// Obtener todas las ciudades
exports.getCities = async (req, res) => {
    try {
        const { City } = db;
        const cities = await City.findAll({
            attributes: ['id', 'name', 'country_code'],
            order: [['name', 'ASC']] // Ordenar alfabéticamente por nombre
        });
        res.json(cities);
    } catch (error) {
        console.error('Error al obtener las ciudades:', error);
        res.status(500).json({ error: error.message });
    }
};

// --- Opcional: CRUD para Ciudades (SOLO ADMIN) ---
exports.createCity = async (req, res) => {
    try {
        const { City } = db;
        const { name, country_code } = req.body;
        if (!name) {
            return res.status(400).json({ error: 'El nombre de la ciudad es obligatorio.' });
        }
        const newCity = await City.create({ name, country_code });
        res.status(201).json(newCity);
    } catch (error) {
        console.error('Error al crear ciudad:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Ya existe una ciudad con ese nombre.' });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.updateCity = async (req, res) => {
    try {
        const { City } = db;
        const { cityId } = req.params;
        const { name, country_code } = req.body;
        const [updatedRows] = await City.update({ name, country_code }, { where: { id: cityId } });
        if (updatedRows > 0) {
            const updatedCity = await City.findByPk(cityId);
            return res.json(updatedCity);
        }
        return res.status(404).json({ message: 'Ciudad no encontrada.' });
    } catch (error) {
        console.error('Error al actualizar ciudad:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Ya existe otra ciudad con ese nombre.' });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.deleteCity = async (req, res) => {
    try {
        const { City, Airport } = db;
        const { cityId } = req.params;
        const airportCount = await Airport.count({ where: { city_id: cityId } });
        if (airportCount > 0) {
            return res.status(400).json({ message: `No se puede eliminar la ciudad porque tiene ${airportCount} aeropuertos asociados.` });
        }
        const deleted = await City.destroy({ where: { id: cityId } });
        if (deleted) {
            return res.status(200).json({ message: 'Ciudad eliminada correctamente.' });
        }
        return res.status(404).json({ message: 'Ciudad no encontrada.' });
    } catch (error) {
        console.error('Error al eliminar ciudad:', error);
        res.status(500).json({ error: error.message });
    }
};