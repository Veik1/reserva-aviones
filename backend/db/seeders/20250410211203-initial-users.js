const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

module.exports = {
    up: async (queryInterface, Sequelize) => {
        const hashedPassword = bcrypt.hashSync('password123', 10);
        await queryInterface.bulkInsert('Users', [
            {
                id: uuidv4(),
                name: 'Usuario 1',
                email: 'usuario1@example.com',
                password: hashedPassword,
                role: 'user', // Establecer el rol como 'user'
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: uuidv4(),
                name: 'Usuario 2',
                email: 'usuario2@example.com',
                password: hashedPassword,
                role: 'user', // Establecer el rol como 'user'
                created_at: new Date(),
                updated_at: new Date()
            },
            // Agregar un usuario administrador
            {
                id: uuidv4(),
                name: 'Administrador',
                email: 'admin@example.com',
                password: bcrypt.hashSync('admin123', 10), // Una contraseña diferente para el admin
                role: 'admin', // Establecer el rol como 'admin'
                created_at: new Date(),
                updated_at: new Date()
            },
            // ... más usuarios si los tienes ...
        ], {});
    },

    down: async (queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('Users', null, {});
    }
};