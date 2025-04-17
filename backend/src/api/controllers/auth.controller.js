const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const getDb = require('../../models/index.js'); // Ruta corregida

exports.register = async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const hashedPassword = bcrypt.hashSync(password, 10);
        const db = await getDb(); // Obtener la promesa
        const { User } = await db; // Esperar la resolución de la promesa y obtener el modelo User
        const user = await User.create({ name, email, password: hashedPassword, role: 'user' }); // Asegúrate de incluir el rol aquí también si no lo hiciste antes
        res.status(201).json({ message: 'Usuario registrado', userId: user.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const db = await getDb(); // Obtener la promesa
        const { User } = await db; // Esperar la resolución de la promesa y obtener el modelo User
        const user = await User.findOne({ where: { email } });
        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }

        const token = jwt.sign(
            { id: user.id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            user: { id: user.id, name: user.name, email: user.email, role: user.role },
            token
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};