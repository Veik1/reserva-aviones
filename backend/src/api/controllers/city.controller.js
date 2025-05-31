const db = require("../../models");

exports.getAllCities = async (req, res) => {
  try {
    const cities = await db.City.findAll({
      include: [{ model: db.Airport, as: "airports" }],
    });
    res.json(cities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
