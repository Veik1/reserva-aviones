'use strict'; // Buena práctica añadir 'use strict'
const { DataTypes } = require('sequelize');

module.exports = {
    async up (queryInterface, Sequelize) { // 'async' para up y down
        await queryInterface.createTable('Users', {
            id: {
                type: DataTypes.UUID,
                defaultValue: DataTypes.UUIDV4,
                primaryKey: true,
                allowNull: false // El ID no debería ser nulo
            },
            name: {
                type: DataTypes.STRING,
                allowNull: false
            },
            email: {
                type: DataTypes.STRING,
                allowNull: false,
                unique: true,
                validate: { // Opcional: añadir validación de formato email
                    isEmail: true
                }
            },
            password: {
                type: DataTypes.STRING,
                allowNull: false
            },
            role: {
                type: DataTypes.ENUM('user', 'admin'),
                defaultValue: 'user',
                allowNull: false
            },
            // --- NUEVOS CAMPOS AÑADIDOS DIRECTAMENTE ---
            dni: {
                type: DataTypes.STRING,
                allowNull: true, // Cambiar a false si es obligatorio al registrarse
                unique: true     // El DNI generalmente es único
            },
            fecha_nacimiento: {
                type: DataTypes.DATEONLY, // Solo la fecha, sin hora
                allowNull: true // Cambiar a false si es obligatorio al registrarse
            },
            telefono: {
                type: DataTypes.STRING,
                allowNull: true
            },
            direccion: {
                type: DataTypes.STRING,
                allowNull: true
            },
            // --- FIN NUEVOS CAMPOS ---
            created_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            },
            updated_at: {
                type: DataTypes.DATE,
                allowNull: false,
                defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
            }
        });
    },
    async down (queryInterface, Sequelize) { // 'async' para up y down
        await queryInterface.dropTable('Users');
    }
};