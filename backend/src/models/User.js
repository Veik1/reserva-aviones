const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING,
            allowNull: false
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true
            }
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false
        },
        role: { // Nuevo campo para el rol del usuario
            type: DataTypes.ENUM('user', 'admin'), // Usamos ENUM para definir los roles posibles
            defaultValue: 'user', // El rol por defecto será 'user'
            allowNull: false
        }
    }, {
        tableName: 'Users',
        timestamps: true,
        underscored: true
    });
    User.associate = (models) => {
        User.hasMany(models.Booking, {
            foreignKey: 'userId',
            as: 'bookings'
        });
    };
    return User;
};