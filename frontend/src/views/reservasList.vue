<!-- filepath: c:\Users\marti\OneDrive\Desktop\dev-pers\reserva-aviones\src\views\reservasList.vue -->
<template>
  <v-container>
    <h2 class="text-center mb-4">Lista de Reservas</h2>
    <v-row>
      <v-col v-for="reserva in reservas" :key="reserva.id" cols="12" md="6">
        <v-card outlined>
          <v-card-title>Reserva #{{ reserva.id }}</v-card-title>
          <v-card-text>
            <p><strong>Persona:</strong> {{ reserva.persona.nombre }} {{ reserva.persona.apellido }}</p>
            <p><strong>Email:</strong> {{ reserva.persona.email }}</p>
            <p><strong>Vuelo:</strong> {{ reserva.vuelo.numero_vuelo }} ({{ reserva.vuelo.origen }} → {{ reserva.vuelo.destino }})</p>
            <p><strong>Fecha de Reserva:</strong> {{ new Date(reserva.fecha_reserva).toLocaleString() }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="eliminarReserva(reserva.id)">Eliminar</v-btn>
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
      reservas: [],
    };
  },
  methods: {
    async cargarReservas() {
      try {
        const response = await fetch('/api/reservas');
        if (!response.ok) {
          throw new Error('Error al obtener las reservas');
        }
        this.reservas = await response.json();
      } catch (error) {
        console.error('Error al cargar reservas:', error);
      }
    },
    async eliminarReserva(id) {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta reserva?')) {
        try {
          const response = await fetch(`/api/reservas/${id}`, { method: 'DELETE' });
          if (response.ok) {
            this.cargarReservas();
          }
        } catch (error) {
          console.error('Error al eliminar reserva:', error);
        }
      }
    },
  },
  mounted() {
    this.cargarReservas();
  },
};
</script>