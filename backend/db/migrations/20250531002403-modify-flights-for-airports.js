'use strict';
const { DataTypes } = require('sequelize');

module.exports = {
  async up (queryInterface, Sequelize) {
    // Primero, añadimos las nuevas columnas de clave foránea
    await queryInterface.addColumn('Flights', 'origin_airport_id', {
      type: DataTypes.UUID,
      allowNull: true, // Permitir nulo temporalmente para poder migrar datos si los hubiera
      references: {
        model: 'Airports',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL' // O RESTRICT si un vuelo no puede existir sin aeropuerto
    });

    await queryInterface.addColumn('Flights', 'destination_airport_id', {
      type: DataTypes.UUID,
      allowNull: true, // Permitir nulo temporalmente
      references: {
        model: 'Airports',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // (Opcional: Si tuvieras datos existentes en 'origin' y 'destination' string,
    // aquí iría la lógica para migrar esos datos a los nuevos *_airport_id.
    // Como estamos reiniciando la BD y usando seeders, lo omitimos por simplicidad.)

    // Luego, eliminamos las columnas antiguas
    await queryInterface.removeColumn('Flights', 'origin');
    await queryInterface.removeColumn('Flights', 'destination');

    // Finalmente, si decidiste que las FK no pueden ser nulas, las alteras
    // (Esto requiere que los seeders ya asignen valores)
    // O dejas allowNull: true si un vuelo podría no tener aeropuerto definido (poco probable)
    // Por ahora, las dejamos como allowNull: true y nos aseguraremos en los seeders.
    // Si quisieras hacerlas NOT NULL después de poblar:
    // await queryInterface.changeColumn('Flights', 'origin_airport_id', {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    // });
    // await queryInterface.changeColumn('Flights', 'destination_airport_id', {
    //   type: DataTypes.UUID,
    //   allowNull: false,
    // });
  },

  async down (queryInterface, Sequelize) {
    // Revertir en orden inverso

    // 1. Volver a añadir las columnas string
    await queryInterface.addColumn('Flights', 'origin', {
      type: DataTypes.STRING,
      allowNull: true // O false si antes era not null
    });
    await queryInterface.addColumn('Flights', 'destination', {
      type: DataTypes.STRING,
      allowNull: true // O false si antes era not null
    });

    // (Opcional: Lógica para re-poblar 'origin' y 'destination' desde los *_airport_id)

    // 2. Eliminar las columnas de clave foránea
    await queryInterface.removeColumn('Flights', 'destination_airport_id');
    await queryInterface.removeColumn('Flights', 'origin_airport_id');
  }
};