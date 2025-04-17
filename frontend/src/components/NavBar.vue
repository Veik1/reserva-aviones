<!-- filepath: c:\Users\marti\OneDrive\Desktop\dev-pers\reserva-aviones\src\components\NavBar.vue -->
<template>
    <v-app-bar app color="primary" dark>
      <v-toolbar-title>Reserva de Aviones</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn text to="/" exact>Inicio</v-btn>
      <v-btn text to="/vuelos">Vuelos</v-btn>
      <v-btn text to="/personas">Personas</v-btn>
      <v-btn text to="/reservas">Reservas</v-btn>
      <v-btn text to="/generar-reserva">Generar Reserva</v-btn>
    </v-app-bar>
  </template>
  
  <script>
  export default {
    name: 'NavBar',
  };
  </script>