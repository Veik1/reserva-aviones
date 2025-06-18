'use strict';
const db = require('../../models/index.js'); // Acceso directo al objeto db

// Obtener todas las clases de vuelo
exports.getFlightClasses = async (req, res) => {
    console.log("ACCEDIENDO A getFlightClasses en el controlador");
    try {
        const { FlightClass } = db; // Obtener el modelo FlightClass
        const flightClasses = await FlightClass.findAll({
            attributes: ['id', 'name', 'description'], // Seleccionar los atributos deseados
            order: [['name', 'ASC']] // Opcional: ordenar por nombre
        });
        res.json(flightClasses);
    } catch (error) {
        console.error('Error al obtener las clases de vuelo:', error);
        res.status(500).json({ error: error.message });
    }
};

// Opcional: Crear una nueva clase de vuelo (SOLO ADMIN)
exports.createFlightClass = async (req, res) => {
    try {
        const { FlightClass } = db;
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'El nombre de la clase es obligatorio.' });
        }

        const newFlightClass = await FlightClass.create({ name, description });
        res.status(201).json(newFlightClass);
    } catch (error) {
        console.error('Error al crear clase de vuelo:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Ya existe una clase de vuelo con ese nombre.' });
        }
        res.status(400).json({ error: error.message });
    }
};

// Opcional: Actualizar una clase de vuelo (SOLO ADMIN)
exports.updateFlightClass = async (req, res) => {
    try {
        const { FlightClass } = db;
        const { classId } = req.params;
        const { name, description } = req.body;

        const [updatedRows] = await FlightClass.update({ name, description }, {
            where: { id: classId }
        });

        if (updatedRows > 0) {
            const updatedFlightClass = await FlightClass.findByPk(classId);
            return res.json(updatedFlightClass);
        }
        return res.status(404).json({ message: 'Clase de vuelo no encontrada.' });
    } catch (error)
    {
        console.error('Error al actualizar clase de vuelo:', error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'Ya existe otra clase de vuelo con ese nombre.' });
        }
        res.status(400).json({ error: error.message });
    }
};

// Opcional: Eliminar una clase de vuelo (SOLO ADMIN)
exports.deleteFlightClass = async (req, res) => {
    try {
        const { FlightClass, FlightOffering } = db;
        const { classId } = req.params;

        // Verificar si la clase está siendo usada en alguna FlightOffering
        const offeringCount = await FlightOffering.count({ where: { flight_class_id: classId } });
        if (offeringCount > 0) {
            return res.status(400).json({ message: `No se puede eliminar la clase porque está asignada a ${offeringCount} ofertas de vuelo.` });
        }

        const deleted = await FlightClass.destroy({
            where: { id: classId }
        });

        if (deleted) {
            return res.status(200).json({ message: 'Clase de vuelo eliminada correctamente.' });
        }
        return res.status(404).json({ message: 'Clase de vuelo no encontrada.' });
    } catch (error) {
        console.error('Error al eliminar clase de vuelo:', error);
        res.status(500).json({ error: error.message });
    }
};