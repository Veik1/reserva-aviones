'use strict';
const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs');

// Pre-generamos IDs para poder referenciarlos fácilmente en el seeder de Bookings
const userId1 = uuidv4();
const userId2 = uuidv4();
const adminId = uuidv4();

module.exports = {
    async up (queryInterface, Sequelize) { // Añadido async
        const hashedPasswordUser = bcrypt.hashSync('user123', 10); // Contraseñas diferentes
        const hashedPasswordAdmin = bcrypt.hashSync('admin123', 10);

        await queryInterface.bulkInsert('Users', [
            {
                id: userId1,
                name: 'Usuario Uno',
                email: 'usuario1@example.com',
                password: hashedPasswordUser,
                role: 'user',
                dni: '11111111A',
                fecha_nacimiento: new Date('1990-05-15'), // YYYY-MM-DD
                telefono: '123456789',
                direccion: 'Calle Falsa 123, Ciudad',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: userId2,
                name: 'Usuario Dos',
                email: 'usuario2@example.com',
                password: hashedPasswordUser, // Puede ser la misma para usuarios de prueba
                role: 'user',
                dni: '22222222B',
                fecha_nacimiento: new Date('1985-10-20'),
                telefono: '987654321',
                direccion: 'Avenida Siempreviva 742',
                created_at: new Date(),
                updated_at: new Date()
            },
            {
                id: adminId,
                name: 'Administrador Principal',
                email: 'admin@example.com',
                password: hashedPasswordAdmin,
                role: 'admin',
                dni: 'ADMIN001X',
                fecha_nacimiento: new Date('1980-01-01'),
                telefono: '555555555',
                direccion: 'Oficina Central',
                created_at: new Date(),
                updated_at: new Date()
            },
        ], {});
    },

    async down (queryInterface, Sequelize) { // Añadido async
        await queryInterface.bulkDelete('Users', null, {});
    }
};