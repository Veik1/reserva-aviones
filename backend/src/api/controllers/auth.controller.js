'use strict'; // Buena práctica
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
// ---> CAMBIO EN LA IMPORTACIÓN <---
const db = require('../../models/index.js'); // Ahora 'db' es el objeto directamente

exports.register = async (req, res) => {
    try {
        const { name, email, password, dni, fecha_nacimiento, telefono, direccion } = req.body; // Incluir nuevos campos
        // const db = await getDb(); // <-- ELIMINAR ESTA LÍNEA
        const { User } = db; // Acceder a User desde el objeto db importado

        // Validaciones básicas (puedes expandirlas)
        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Nombre, email y contraseña son obligatorios.' });
        }
        // Podrías añadir validación para formato de DNI, fecha, etc.

        const hashedPassword = bcrypt.hashSync(password, 10);

        const userData = {
            name,
            email,
            password: hashedPassword,
            role: 'user', // Por defecto al registrarse
            dni,
            fecha_nacimiento,
            telefono,
            direccion
        };

        const user = await User.create(userData);
        res.status(201).json({ message: 'Usuario registrado', userId: user.id });
    } catch (error) {
        console.error("Error en registro:", error);
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ error: 'El email o DNI ya está registrado.' });
        }
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // const db = await getDb(); // <-- ELIMINAR ESTA LÍNEA
        const { User } = db; // Acceder a User desde el objeto db importado

        if (!email || !password) {
            return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
        }

        const user = await User.findOne({ where: { email } });
        if (!user) { // Usuario no encontrado
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const isPasswordValid = bcrypt.compareSync(password, user.password);
        if (!isPasswordValid) { // Contraseña incorrecta
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id, role: user.role }, // Incluir el rol en el token es útil
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Devolver solo la información necesaria del usuario, excluyendo la contraseña
        res.json({
            message: "Inicio de sesión exitoso",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
                // No envíes más datos sensibles como DNI o dirección aquí a menos que sea necesario
            },
            token
        });
    } catch (error) {
        console.error("Error en login:", error);
        res.status(500).json({ error: error.message });
    }
};