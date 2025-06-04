'use strict';
const db = require('../../models/index.js');
const { Op } = require('sequelize'); // Para búsquedas más flexibles

exports.getAirports = async (req, res) => {
    try {
        const { Airport } = db;
        const { cityId, search } = req.query; // Para filtrar por ciudad o buscar por nombre/iata
        let whereClause = {};

        if (cityId) {
            whereClause.city_id = cityId;
        }
        if (search) {
            whereClause[Op.or] = [
                { name: { [Op.iLike]: `%${search}%` } },
                { iata_code: { [Op.iLike]: `%${search}%` } }
            ];
        }

        const airports = await Airport.findAll({
            where: whereClause,
            attributes: ['id', 'name', 'iata_code', 'city_id'],
            include: [ // Incluir la ciudad asociada
                {
                    model: db.City,
                    as: 'city',
                    attributes: ['id', 'name', 'country_code']
                }
            ],
            order: [['name', 'ASC']]
        });
        res.json(airports);
    } catch (error) {
        console.error('Error al obtener los aeropuertos:', error);
        res.status(500).json({ error: error.message });
    }
};

// --- Opcional: CRUD para Aeropuertos (SOLO ADMIN) ---
exports.createAirport = async (req, res) => {
    try {
        const { Airport, City } = db;
        const { name, iata_code, city_id } = req.body;

        if (!name || !iata_code || !city_id) {
            return res.status(400).json({ error: 'Nombre, código IATA e ID de ciudad son obligatorios.' });
        }
        const cityExists = await City.findByPk(city_id);
        if (!cityExists) {
            return res.status(404).json({ error: 'La ciudad especificada no existe.' });
        }

        const newAirport = await Airport.create({ name, iata_code, city_id });
        res.status(201).json(newAirport);
    } catch (error) {
        console.error('Error al crear aeropuerto:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Ya existe un aeropuerto con ese código IATA.' });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.updateAirport = async (req, res) => {
    try {
        const { Airport, City } = db;
        const { airportId } = req.params;
        const { name, iata_code, city_id } = req.body;

        if (city_id) {
            const cityExists = await City.findByPk(city_id);
            if (!cityExists) {
                return res.status(404).json({ error: 'La nueva ciudad especificada no existe.' });
            }
        }
        const updateData = {};
        if (name) updateData.name = name;
        if (iata_code) updateData.iata_code = iata_code;
        if (city_id) updateData.city_id = city_id;

        const [updatedRows] = await Airport.update(updateData, { where: { id: airportId } });

        if (updatedRows > 0) {
            const updatedAirport = await Airport.findByPk(airportId, { include: [{model: City, as: 'city'}]});
            return res.json(updatedAirport);
        }
        return res.status(404).json({ message: 'Aeropuerto no encontrado.' });
    } catch (error) {
        console.error('Error al actualizar aeropuerto:', error);
         if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Ya existe otro aeropuerto con ese código IATA.' });
        }
        res.status(400).json({ error: error.message });
    }
};

exports.deleteAirport = async (req, res) => {
    try {
        const { Airport, Flight } = db;
        const { airportId } = req.params;

        // Verificar si el aeropuerto está siendo usado en algún vuelo
        const flightCountOrigin = await Flight.count({ where: { origin_airport_id: airportId } });
        const flightCountDestination = await Flight.count({ where: { destination_airport_id: airportId } });

        if (flightCountOrigin > 0 || flightCountDestination > 0) {
            return res.status(400).json({ message: `No se puede eliminar el aeropuerto porque está asignado a vuelos (como origen o destino).` });
        }

        const deleted = await Airport.destroy({ where: { id: airportId } });
        if (deleted) {
            return res.status(200).json({ message: 'Aeropuerto eliminado correctamente.' });
        }
        return res.status(404).json({ message: 'Aeropuerto no encontrado.' });
    } catch (error) {
        console.error('Error al eliminar aeropuerto:', error);
        res.status(500).json({ error: error.message });
    }
};