'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize'); // Importar DataTypes aquí
const sequelizeInstance = require('../../db/database.js'); // Tu instancia de Sequelize

const db = {};
const basename = path.basename(__filename);

fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1 // Evitar archivos de test
    );
  })
  .forEach(file => {
    const modelDefinition = require(path.join(__dirname, file));
    const model = modelDefinition(sequelizeInstance, DataTypes);
    db[model.name] = model;
  });

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize; // La clase Sequelize, no la instancia

module.exports = db;