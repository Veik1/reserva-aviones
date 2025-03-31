<template>
    <v-container>
      <h2 class="text-center mb-4">Generar Reserva</h2>
  
      <!-- Buscador de vuelos -->
      <v-text-field
        v-model="busqueda"
        label="Buscar vuelos"
        class="mb-4"
        @input="buscarVuelos"
      ></v-text-field>
  
      <!-- Lista de vuelos disponibles -->
      <v-row>
        <v-col v-for="vuelo in vuelosFiltrados" :key="vuelo.id" cols="12" md="4">
          <v-card outlined>
            <v-card-title>{{ vuelo.numero_vuelo }}</v-card-title>
            <v-card-subtitle>{{ vuelo.origen }} → {{ vuelo.destino }}</v-card-subtitle>
            <v-card-text>{{ new Date(vuelo.fecha).toLocaleString() }}</v-card-text>
            <v-card-actions>
              <v-btn color="primary" @click="seleccionarVuelo(vuelo)">Seleccionar</v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
  
      <!-- Formulario para completar los datos de la persona -->
      <v-dialog v-model="dialog" max-width="500px">
        <v-card>
          <v-card-title>Completar Datos de la Reserva</v-card-title>
          <v-card-text>
            <v-form ref="form">
              <v-text-field
                v-model="persona.nombre"
                label="Nombre"
                required
              ></v-text-field>
              <v-text-field
                v-model="persona.apellido"
                label="Apellido"
                required
              ></v-text-field>
              <v-text-field
                v-model="persona.email"
                label="Email"
                type="email"
                required
              ></v-text-field>
            </v-form>
          </v-card-text>
          <v-card-actions>
            <v-btn color="success" @click="guardarReserva">Reservar</v-btn>
            <v-btn color="secondary" @click="dialog = false">Cancelar</v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-container>
  </template>
  
  <script>
  export default {
    data() {
      return {
        vuelos: [],
        vuelosFiltrados: [],
        busqueda: '',
        vueloSeleccionado: null,
        persona: {
          nombre: '',
          apellido: '',
          email: '',
        },
        dialog: false,
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
      seleccionarVuelo(vuelo) {
        this.vueloSeleccionado = vuelo;
        this.dialog = true;
      },
      async guardarReserva() {
        try {
          // Crear la persona en el backend
          const personaResponse = await fetch('/api/personas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(this.persona),
          });
          if (!personaResponse.ok) {
            throw new Error('Error al guardar la persona');
          }
          const persona = await personaResponse.json();
  
          // Crear la reserva en el backend
          const reserva = {
            personaId: persona.id,
            vueloId: this.vueloSeleccionado.id,
            fecha_reserva: new Date().toISOString(),
          };
          const reservaResponse = await fetch('/api/reservas', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reserva),
          });
          if (!reservaResponse.ok) {
            throw new Error('Error al guardar la reserva');
          }
  
          // Mostrar mensaje de éxito y limpiar el formulario
          alert('Reserva creada con éxito');
          this.dialog = false;
          this.persona = { nombre: '', apellido: '', email: '' };
          this.vueloSeleccionado = null;
        } catch (error) {
          console.error('Error al guardar la reserva:', error);
          alert('Ocurrió un error al crear la reserva');
        }
      },
    },
    mounted() {
      this.cargarVuelos();
    },
  };
  </script>