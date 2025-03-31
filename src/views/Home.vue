<template>
    <v-container>
      <h1 class="text-center mb-4">Bienvenido a la Aplicación de Reserva de Aviones</h1>
      <v-row>
        <v-col cols="12" md="4">
          <v-card outlined>
            <v-card-title>Vuelos</v-card-title>
            <v-card-text>Gestiona los vuelos disponibles.</v-card-text>
            <v-card-actions>
              <v-btn color="primary" to="/vuelos">Ir a Vuelos</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card outlined>
            <v-card-title>Personas</v-card-title>
            <v-card-text>Gestiona las personas registradas.</v-card-text>
            <v-card-actions>
              <v-btn color="primary" to="/personas">Ir a Personas</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
        <v-col cols="12" md="4">
          <v-card outlined>
            <v-card-title>Reservas</v-card-title>
            <v-card-text>Gestiona las reservas realizadas.</v-card-text>
            <v-card-actions>
              <v-btn color="primary" to="/reservas">Ir a Reservas</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>
  </template>
  
  <script>
  export default {
    name: 'Home',
  };
  </script>