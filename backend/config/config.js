require("dotenv").config();

module.exports = {
  development: {
    username: process.env.DB_USER || "postgres",
    password: process.env.DB_PASSWORD || "password",
    database: process.env.DB_NAME || "reserva_aviones",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 5432,
    dialect: "postgres",
    logging: console.log,
    dialectOptions: {
      ssl:
        process.env.DB_SSL === "true"
          ? { require: true, rejectUnauthorized: false }
          : false,
    },
    pool: { max: 5, min: 0, acquire: 30000, idle: 10000 },
    define: {
      underscored: true,
      timestamps: true,
      paranoid: true,
    },
  },
  test: {
    username: process.env.DB_TEST_USER || "postgres",
    password: process.env.DB_TEST_PASSWORD || "password",
    database: process.env.DB_TEST_NAME || "reserva_aviones_test",
    host: process.env.DB_TEST_HOST || "localhost",
    dialect: "postgres",
  },
  production: {
    use_env_variable: "DATABASE_URL",
    dialect: "postgres",
    logging: false,
    dialectOptions: { ssl: { require: true, rejectUnauthorized: false } },
  },
};
