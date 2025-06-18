'use strict';
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const User = sequelize.define('User', {
        id: {
            type: DataTypes.UUID,
            defaultValue: DataTypes.UUIDV4,
            primaryKey: true,
            allowNull: false
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
            // Considerar añadir un hook 'beforeCreate' y 'beforeUpdate' para hashear la contraseña
            // Ejemplo:
            // set(value) {
            //   const salt = bcrypt.genSaltSync(10);
            //   const hash = bcrypt.hashSync(value, salt);
            //   this.setDataValue('password', hash);
            // }
        },
        role: {
            type: DataTypes.ENUM('user', 'admin'),
            defaultValue: 'user',
            allowNull: false
        },
        dni: {
            type: DataTypes.STRING,
            allowNull: true, // O false si es obligatorio
            unique: true
        },
        fecha_nacimiento: {
            type: DataTypes.DATEONLY,
            allowNull: true // O false si es obligatorio
        },
        telefono: {
            type: DataTypes.STRING,
            allowNull: true
        },
        direccion: {
            type: DataTypes.STRING,
            allowNull: true
        }
    }, {
        tableName: 'Users',
        timestamps: true,
        underscored: true // Esto asegura created_at, updated_at
        // hooks: { // Ejemplo de hook para hashear contraseña
        //   beforeCreate: async (user) => {
        //     if (user.password) {
        //       const salt = await bcrypt.genSalt(10);
        //       user.password = await bcrypt.hash(user.password, salt);
        //     }
        //   },
        //   beforeUpdate: async (user) => {
        //     if (user.changed('password')) { // Solo hashear si la contraseña cambió
        //       const salt = await bcrypt.genSalt(10);
        //       user.password = await bcrypt.hash(user.password, salt);
        //     }
        //   }
        // }
    });

    User.associate = (models) => {
        User.hasMany(models.Booking, {
            foreignKey: 'user_id', // Corregido a snake_case
            as: 'bookings'
        });
    };

    return User;
};