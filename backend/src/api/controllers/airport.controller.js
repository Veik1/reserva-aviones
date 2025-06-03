const db = require("../../models");

exports.getAllAirports = async (req, res) => {
  try {
    const where = {};
    if (req.query.cityId) where.city_id = req.query.cityId;
    const airports = await db.Airport.findAll({
      where,
      include: [{ model: db.City, as: "city" }],
    });
    res.json(airports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
