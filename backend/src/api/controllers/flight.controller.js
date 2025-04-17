const getDb = require('../../models/index.js'); // Ruta corregida

exports.getFlights = async (req, res) => {
  try {
    const db = await getDb(); // Obtener la instancia de db
    const flights = await db.Flight.findAll();
    res.json(flights);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ... (similar para otras funciones del controlador, usando await getDb() antes de db.Flight...)
exports.getFlightById = async (req, res) => {
  try {
    const db = await getDb();
    console.log("Valor de db:", db);
    console.log("¿Existe db.Flight?", db && db.Flight);
    const flight = await db.Flight.findByPk(req.params.id);
    if (!flight) {
      return res.status(404).json({ message: 'Vuelo no encontrado' });
    }
    res.json(flight);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
exports.createFlight = async (req, res) => {
  try {
    const db = await getDb(); // Obtener la instancia de db
    const flight = await db.Flight.create(req.body);
    res.status(201).json(flight);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.updateFlight = async (req, res) => {
  try {
    const db = await getDb();
    const [updated] = await db.Flight.update(req.body, { // Usa db.Flight
      where: { id: req.params.id }
    });
    if (updated) {
      const updatedFlight = await db.Flight.findByPk(req.params.id); // Usa db.Flight
      return res.json(updatedFlight);
    }
    return res.status(404).json({ message: 'Vuelo no encontrado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
exports.deleteFlight = async (req, res) => {
  try {
    const db = await getDb();
    const deleted = await db.Flight.destroy({
      where: { id: req.params.id }
    });
    if (deleted) {
      return res.status(200).json({ message: 'Vuelo eliminado con éxito' }); // Cambia a 200 y envía un mensaje
    }
    return res.status(404).json({ message: 'Vuelo no encontrado' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};