const { v4: uuidv4 } = require('uuid');
const bcrypt = require('bcryptjs'); // Nota: bcrypt no se usa aquí, pero estaba en tu original

const oneHour = 3600000; // Milisegundos en una hora
const oneDay = 86400000; // Milisegundos en un día

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = Date.now();
    const flightsData = [
      // --- Vuelos Existentes ---
      {
        id: uuidv4(),
        flight_number: 'AA102',
        origin: 'Nueva York',
        destination: 'Los Ángeles',
        departure_time: new Date(now + 1 * oneDay), // Mañana
        arrival_time: new Date(now + 1 * oneDay + 5.5 * oneHour), // Mañana + 5.5 horas
        seats_available: 150,
        price: 350.75,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkutoYHfeLmKQiUG1JyRob9VQOVy8sHJhyBiRhpugGW-ZvTxlLBql9_vuWMYtWnrg2lM4&usqp=CAU',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'BB203',
        origin: 'Miami',
        destination: 'Chicago',
        departure_time: new Date(now + 2 * oneDay), // En dos días
        arrival_time: new Date(now + 2 * oneDay + 3 * oneHour), // En dos días + 3 horas
        seats_available: 120,
        price: 280.20,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRRMC_COFhu3WJcCrpg8f7KWDCgETlNsZjFBw&s',
        created_at: new Date(),
        updated_at: new Date()
      },
      // --- Nuevos Vuelos ---
      {
        id: uuidv4(),
        flight_number: 'DL310',
        origin: 'Los Ángeles',
        destination: 'Londres',
        departure_time: new Date(now + 3 * oneDay + 2 * oneHour), // En 3 días
        arrival_time: new Date(now + 3 * oneDay + 12 * oneHour),   // Duración 10 horas
        seats_available: 180,
        price: 680.50,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTOmgrrLeL0ILbirGGl26nETQkGMaxt_OmEvA&s',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'UA450',
        origin: 'Chicago',
        destination: 'Tokio',
        departure_time: new Date(now + 7 * oneDay + 4 * oneHour), // En 1 semana
        arrival_time: new Date(now + 7 * oneDay + 17 * oneHour),  // Duración 13 horas
        seats_available: 220,
        price: 950.00,
        image_url: 'https://a.travel-assets.com/findyours-php/viewfinder/images/res70/69000/69347-Tokyo.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'IB501',
        origin: 'Madrid',
        destination: 'Buenos Aires',
        departure_time: new Date(now + 5 * oneDay), // En 5 días
        arrival_time: new Date(now + 5 * oneDay + 12 * oneHour), // Duración 12 horas
        seats_available: 200,
        price: 720.80,
        image_url: 'https://media.lmneuquen.com/p/26f544c8acbce08f4e6f07344a6d4cd8/adjuntos/195/imagenes/006/474/0006474342/buenos-airesjpg.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'LH622',
        origin: 'Frankfurt',
        destination: 'Nueva York',
        departure_time: new Date(now + 10 * oneDay), // En 10 días
        arrival_time: new Date(now + 10 * oneDay + 8.5 * oneHour), // Duración 8.5 horas
        seats_available: 190,
        price: 580.00,
        image_url: 'https://i0.wp.com/voila.ar/wp-content/uploads/2023/05/estatua-libertad-new-york.jpg?fit=1140%2C760&ssl=1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'BA789',
        origin: 'Londres',
        destination: 'Miami',
        departure_time: new Date(now + 4 * oneDay + 6 * oneHour), // En 4 días
        arrival_time: new Date(now + 4 * oneDay + 15 * oneHour),  // Duración 9 horas
        seats_available: 170,
        price: 615.90,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHQSyCdY7Q4oPbzjC3_rnahHwvgruMCl3rwA&s',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'AF815',
        origin: 'París',
        destination: 'Atlanta',
        departure_time: new Date(now + 14 * oneDay), // En 2 semanas
        arrival_time: new Date(now + 14 * oneDay + 9.5 * oneHour), // Duración 9.5 horas
        seats_available: 185,
        price: 630.00,
        image_url: 'https://www.viajaratlanta.com/img/viajar-atlanta.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'AR930',
        origin: 'Buenos Aires',
        destination: 'Miami',
        departure_time: new Date(now + 6 * oneDay + 3 * oneHour), // En 6 días
        arrival_time: new Date(now + 6 * oneDay + 12 * oneHour), // Duración 9 horas
        seats_available: 160,
        price: 695.50,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHQSyCdY7Q4oPbzjC3_rnahHwvgruMCl3rwA&s',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'LA105',
        origin: 'Santiago',
        destination: 'Los Ángeles',
        departure_time: new Date(now + 8 * oneDay), // En 8 días
        arrival_time: new Date(now + 8 * oneDay + 11 * oneHour), // Duración 11 horas
        seats_available: 175,
        price: 755.25,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQkutoYHfeLmKQiUG1JyRob9VQOVy8sHJhyBiRhpugGW-ZvTxlLBql9_vuWMYtWnrg2lM4&usqp=CAU',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'AA115',
        origin: 'Dallas',
        destination: 'París',
        departure_time: new Date(now + 12 * oneDay), // En 12 días
        arrival_time: new Date(now + 12 * oneDay + 9 * oneHour), // Duración 9 horas
        seats_available: 180,
        price: 670.00,
        image_url: 'https://turismo.org/wp-content/uploads/2015/05/Torre-Eiffel-vista-panoramica-760x500.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'DL355',
        origin: 'Atlanta',
        destination: 'Ámsterdam',
        departure_time: new Date(now + 9 * oneDay + 5 * oneHour), // En 9 días
        arrival_time: new Date(now + 9 * oneDay + 13.5 * oneHour), // Duración 8.5 horas
        seats_available: 170,
        price: 590.60,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRCLGt636LXze-pdTo9N07-sopCbQdQ2oziKg&s',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'UA480',
        origin: 'Nueva York',
        destination: 'Santiago',
        departure_time: new Date(now + 11 * oneDay), // En 11 días
        arrival_time: new Date(now + 11 * oneDay + 10.5 * oneHour), // Duración 10.5 horas
        seats_available: 165,
        price: 730.00,
        image_url: 'https://turismo.encolombia.com/wp-content/uploads/2013/03/santiago-chile.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'IB530',
        origin: 'Bogotá',
        destination: 'Madrid',
        departure_time: new Date(now + 15 * oneDay), // En 15 días
        arrival_time: new Date(now + 15 * oneDay + 9.5 * oneHour), // Duración 9.5 horas
        seats_available: 195,
        price: 700.00,
        image_url: 'https://www.spain.info/export/sites/segtur/.content/imagenes/cabeceras-grandes/madrid/calle-gran-via-madrid-s333961043.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'AR965',
        origin: 'Buenos Aires',
        destination: 'Nueva York',
        departure_time: new Date(now + 13 * oneDay + 8 * oneHour), // En 13 días
        arrival_time: new Date(now + 13 * oneDay + 18 * oneHour), // Duración 10 horas
        seats_available: 180,
        price: 780.99,
        image_url: 'https://i0.wp.com/voila.ar/wp-content/uploads/2023/05/estatua-libertad-new-york.jpg?fit=1140%2C760&ssl=1',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'LH688',
        origin: 'Ciudad de México',
        destination: 'Frankfurt',
        departure_time: new Date(now + 18 * oneDay), // En 18 días
        arrival_time: new Date(now + 18 * oneDay + 11 * oneHour), // Duración 11 horas
        seats_available: 210,
        price: 820.00,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTIlOBpn3JkrlP3jgCVjVbiuhARpCClPiDr7BpbQ4aWU3l-kWoo5m6Ocq_mxKeBIgRCrgI&usqp=CAU',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'AF899',
        origin: 'Santiago',
        destination: 'París',
        departure_time: new Date(now + 20 * oneDay), // En 20 días
        arrival_time: new Date(now + 20 * oneDay + 14 * oneHour), // Duración 14 horas
        seats_available: 200,
        price: 880.50,
        image_url: 'https://turismo.org/wp-content/uploads/2015/05/Torre-Eiffel-vista-panoramica-760x500.jpg',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'EK204',
        origin: 'Dubái',
        destination: 'Nueva York',
        departure_time: new Date(now + 16 * oneDay), // En 16 días
        arrival_time: new Date(now + 16 * oneDay + 14 * oneHour), // Duración 14 horas
        seats_available: 240,
        price: 950.00,
        image_url: 'https://i0.wp.com/voila.ar/wp-content/uploads/2023/05/estatua-libertad-new-york.jpg?fit=1140%2C760&ssl=1',
        created_at: new Date(),
        updated_at: new Date()
      },
      {
        id: uuidv4(),
        flight_number: 'AA151',
        origin: 'Los Ángeles',
        destination: 'Miami',
        departure_time: new Date(now + 2 * oneDay + 10 * oneHour), // En 2 días
        arrival_time: new Date(now + 2 * oneDay + 14.5 * oneHour), // Duración 4.5 horas
        seats_available: 140,
        price: 290.00,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQHQSyCdY7Q4oPbzjC3_rnahHwvgruMCl3rwA&s',
        created_at: new Date(),
        updated_at: new Date()
      },
       {
        id: uuidv4(),
        flight_number: 'COPA123',
        origin: 'Ciudad de Panamá',
        destination: 'Bogotá',
        departure_time: new Date(now + 3 * oneDay + 9 * oneHour), // En 3 días
        arrival_time: new Date(now + 3 * oneDay + 10.5 * oneHour), // Duración 1.5 horas
        seats_available: 90,
        price: 180.00,
        image_url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQKiAC4t_Eymf_lmkqIAE5-_yL2Qe4mtuBWGQ&s',
        created_at: new Date(),
        updated_at: new Date()
      }
    ];

    return queryInterface.bulkInsert('Flights', flightsData, {});
  },


  down: async (queryInterface, Sequelize) => {
    return queryInterface.bulkDelete('Flights', null, {});
  }
 };