'use strict';
const fs = require('fs');
const path = require('path');
const { Sequelize, DataTypes } = require('sequelize');
const sequelizeInstance = require('../../db/database.js'); // Asumiendo que este es tu objeto sequelize configurado

const db = {};
const basename = path.basename(__filename);

// Cargar todos los modelos de la carpeta actual automáticamente
fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  })
  .forEach(file => {
    // const model = require(path.join(__dirname, file))(sequelizeInstance, Sequelize.DataTypes); // Modo antiguo
    const modelDefinition = require(path.join(__dirname, file));
    const model = modelDefinition(sequelizeInstance, DataTypes); // Modo estándar
    db[model.name] = model;
  });

// Ejecutar las asociaciones si están definidas
Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelizeInstance;
db.Sequelize = Sequelize;

// Eliminamos la función getDb y exportamos db directamente, que es más común
// async function getDb() {
//   return db;
// }
// module.exports = getDb;

module.exports = db; // Exportar el objeto db completo