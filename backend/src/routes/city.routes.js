const express = require("express");
const router = express.Router();
const cityController = require("../api/controllers/city.controller");

router.get("/cities", cityController.getAllCities);

module.exports = router;
