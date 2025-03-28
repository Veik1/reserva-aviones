module.exports = {
    development: {
      username: 'postgres',
      password: 'postgres',
      database: 'reserva_aviones_dev',
      host: '127.0.0.1',
      dialect: 'postgres',
      logging: console.log
    },
    test: {
      username: 'postgres',
      password: 'postgres',
      database: 'reserva_aviones_test',
      host: '127.0.0.1',
      dialect: 'postgres',
      logging: false
    },
    production: {
      username: 'postgres',
      password: 'postgres',
      database: 'reserva_aviones_prod',
      host: '127.0.0.1',
      dialect: 'postgres',
      logging: false
    }
  };