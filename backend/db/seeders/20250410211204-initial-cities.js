'use strict';
const { v4: uuidv4 } = require('uuid');

// Pre-generamos IDs para poder usarlos en el seeder de Airports
const city_NYC_Id = uuidv4();
const city_LAX_Id = uuidv4();
const city_MIA_Id = uuidv4();
const city_CHI_Id = uuidv4();
const city_LON_Id = uuidv4();
const city_TOK_Id = uuidv4();
const city_MAD_Id = uuidv4();
const city_BUE_Id = uuidv4(); // Buenos Aires
const city_FRA_Id = uuidv4();
const city_PAR_Id = uuidv4();
const city_ATL_Id = uuidv4();
const city_SCL_Id = uuidv4(); // Santiago
const city_DAL_Id = uuidv4();
const city_AMS_Id = uuidv4();
const city_BOG_Id = uuidv4(); // Bogotá
const city_MEX_Id = uuidv4(); // Ciudad de México
const city_DXB_Id = uuidv4(); // Dubái
const city_PTY_Id = uuidv4(); // Ciudad de Panamá

module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.bulkInsert('Cities', [
      { id: city_NYC_Id, name: 'Nueva York', country_code: 'US', created_at: new Date(), updated_at: new Date() },
      { id: city_LAX_Id, name: 'Los Ángeles', country_code: 'US', created_at: new Date(), updated_at: new Date() },
      { id: city_MIA_Id, name: 'Miami', country_code: 'US', created_at: new Date(), updated_at: new Date() },
      { id: city_CHI_Id, name: 'Chicago', country_code: 'US', created_at: new Date(), updated_at: new Date() },
      { id: city_LON_Id, name: 'Londres', country_code: 'GB', created_at: new Date(), updated_at: new Date() },
      { id: city_TOK_Id, name: 'Tokio', country_code: 'JP', created_at: new Date(), updated_at: new Date() },
      { id: city_MAD_Id, name: 'Madrid', country_code: 'ES', created_at: new Date(), updated_at: new Date() },
      { id: city_BUE_Id, name: 'Buenos Aires', country_code: 'AR', created_at: new Date(), updated_at: new Date() },
      { id: city_FRA_Id, name: 'Frankfurt', country_code: 'DE', created_at: new Date(), updated_at: new Date() },
      { id: city_PAR_Id, name: 'París', country_code: 'FR', created_at: new Date(), updated_at: new Date() },
      { id: city_ATL_Id, name: 'Atlanta', country_code: 'US', created_at: new Date(), updated_at: new Date() },
      { id: city_SCL_Id, name: 'Santiago', country_code: 'CL', created_at: new Date(), updated_at: new Date() },
      { id: city_DAL_Id, name: 'Dallas', country_code: 'US', created_at: new Date(), updated_at: new Date() },
      { id: city_AMS_Id, name: 'Ámsterdam', country_code: 'NL', created_at: new Date(), updated_at: new Date() },
      { id: city_BOG_Id, name: 'Bogotá', country_code: 'CO', created_at: new Date(), updated_at: new Date() },
      { id: city_MEX_Id, name: 'Ciudad de México', country_code: 'MX', created_at: new Date(), updated_at: new Date() },
      { id: city_DXB_Id, name: 'Dubái', country_code: 'AE', created_at: new Date(), updated_at: new Date() },
      { id: city_PTY_Id, name: 'Ciudad de Panamá', country_code: 'PA', created_at: new Date(), updated_at: new Date() },
    ], {});
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.bulkDelete('Cities', null, {});
  }
};

// Exportar IDs para el siguiente seeder (opcional, pero útil para este ejemplo)
// En un escenario real, el seeder de Airports podría consultar los IDs de City por nombre.
module.exports.cityIds = {
    city_NYC_Id, city_LAX_Id, city_MIA_Id, city_CHI_Id, city_LON_Id, city_TOK_Id,
    city_MAD_Id, city_BUE_Id, city_FRA_Id, city_PAR_Id, city_ATL_Id, city_SCL_Id,
    city_DAL_Id, city_AMS_Id, city_BOG_Id, city_MEX_Id, city_DXB_Id, city_PTY_Id
};