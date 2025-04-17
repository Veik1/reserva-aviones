<!-- filepath: c:\Users\marti\OneDrive\Desktop\dev-pers\reserva-aviones\src\views\vuelosList.vue -->
<template>
  <v-container>
    <h2 class="text-center mb-4">Lista de Vuelos</h2>

    <!-- Buscador -->
    <v-text-field
      v-model="busqueda"
      label="Buscar vuelos"
      class="mb-4"
      @input="buscarVuelos"
    ></v-text-field>

    <!-- Formulario para agregar vuelos -->
    <v-form @submit.prevent="crearVuelo" class="mb-4">
      <v-row>
        <v-col cols="12" md="3">
          <v-text-field v-model="nuevoVuelo.numero_vuelo" label="Número de Vuelo" required></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="nuevoVuelo.origen" label="Origen" required></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="nuevoVuelo.destino" label="Destino" required></v-text-field>
        </v-col>
        <v-col cols="12" md="3">
          <v-text-field v-model="nuevoVuelo.fecha" label="Fecha" type="datetime-local" required></v-text-field>
        </v-col>
      </v-row>
      <v-btn color="success" type="submit">Agregar Vuelo</v-btn>
    </v-form>

    <!-- Lista de vuelos -->
    <v-row>
      <v-col v-for="vuelo in vuelosFiltrados" :key="vuelo.id" cols="12" md="4">
        <v-card outlined>
          <v-card-title>{{ vuelo.numero_vuelo }}</v-card-title>
          <v-card-subtitle>{{ vuelo.origen }} → {{ vuelo.destino }}</v-card-subtitle>
          <v-card-text>{{ new Date(vuelo.fecha).toLocaleString() }}</v-card-text>
          <v-card-actions>
            <v-btn color="primary" @click="$router.push(`/vuelos/${vuelo.id}`)">Ver Detalles</v-btn>
            <v-btn color="error" @click="eliminarVuelo(vuelo.id)">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      vuelos: [],
      vuelosFiltrados: [],
      busqueda: '',
      nuevoVuelo: {
        numero_vuelo: '',
        origen: '',
        destino: '',
        fecha: '',
      },
    };
  },
  methods: {
    async cargarVuelos() {
      try {
        const response = await fetch('/api/vuelos');
        if (!response.ok) {
          throw new Error('Error al obtener los vuelos');
        }
        this.vuelos = await response.json();
        this.vuelosFiltrados = this.vuelos;
      } catch (error) {
        console.error('Error al cargar vuelos:', error);
      }
    },
    buscarVuelos() {
      this.vuelosFiltrados = this.vuelos.filter((vuelo) =>
        vuelo.numero_vuelo.includes(this.busqueda) ||
        vuelo.origen.toLowerCase().includes(this.busqueda.toLowerCase()) ||
        vuelo.destino.toLowerCase().includes(this.busqueda.toLowerCase())
      );
    },
    async crearVuelo() {
      try {
        const response = await fetch('/api/vuelos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(this.nuevoVuelo),
        });
        if (response.ok) {
          this.cargarVuelos();
          this.nuevoVuelo = { numero_vuelo: '', origen: '', destino: '', fecha: '' };
        }
      } catch (error) {
        console.error('Error al crear el vuelo:', error);
      }
    },
    async eliminarVuelo(id) {
      try {
        const response = await fetch(`/api/vuelos/${id}`, { method: 'DELETE' });
        if (response.ok) {
          this.cargarVuelos();
        }
      } catch (error) {
        console.error('Error al eliminar vuelo:', error);
      }
    },
  },
  mounted() {
    this.cargarVuelos();
  },
};
</script>