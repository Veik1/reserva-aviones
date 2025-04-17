const jwt = require('jsonwebtoken');
const getDb = require('../models/index.js'); // Asegúrate de que esta ruta sea correcta

const verifyToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No autorizado: Token JWT no encontrado' });
        }

        const token = authHeader.split(' ')[1];

        jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
            if (err) {
                return res.status(401).json({ message: 'No autorizado: Token JWT inválido' });
            }

            req.userId = decoded.id;
            next();
        });
    } catch (error) {
        console.error('Error en el middleware de autenticación:', error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
};

const authorizeRole = (role) => {
    return async (req, res, next) => {
        try {
            const db = await getDb();
            const user = await db.User.findByPk(req.userId);

            if (!user || user.role !== role) {
                return res.status(403).json({ message: 'No autorizado: No tienes permisos para acceder a esta ruta' });
            }

            next();
        } catch (error) {
            console.error('Error al verificar el rol del usuario:', error);
            res.status(500).json({ message: 'Error interno del servidor' });
        }
    };
};

module.exports = { verifyToken, authorizeRole };