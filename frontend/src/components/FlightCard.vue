<template>
  <div class="flight-card">
    <h3>{{ flight.flight_number }}</h3>
    <p><strong>Desde:</strong> {{ flight.origin }}</p>
    <p><strong>Hasta:</strong> {{ flight.destination }}</p>
    <p><strong>Partida:</strong> {{ formatDate(flight.departure_time) }}</p>
    <p><strong>Llegada:</strong> {{ formatDate(flight.arrival_time) }}</p>
    <p><strong>Precio:</strong> ${{ parseFloat(flight.price).toFixed(2) }}</p>
    <p><strong>Asientos disponibles:</strong> {{ flight.seats_available }}</p>
    <div class="card-actions">
        <router-link :to="{ name: 'flight-details', params: { id: flight.id } }" class="button is-small is-info">
           Ver detalles
        </router-link>
        <router-link v-if="authStore.isAuthenticated" :to="{ name: 'create-booking', params: { flightId: flight.id } }" class="button is-small is-success">
            Reservar ahora
        </router-link>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';
import { useAuthStore } from '@/store/auth';

const props = defineProps({
  flight: {
    type: Object,
    required: true,
  },
});

const authStore = useAuthStore();

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', hour12: false };
    try {
         return new Intl.DateTimeFormat('es-ES', options).format(new Date(dateString));
    } catch (e) {
        console.error("Error al formatear la fecha:", dateString, e);
        return dateString; // Fallback
    }
};
</script>

<style scoped>
.flight-card {
  border: 1px solid #ddd;
  padding: 15px;
  border-radius: 5px;
  background-color: #fff;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}
.flight-card h3 { margin-top: 0; margin-bottom: 10px; color: #3498db; }
.flight-card p { margin: 5px 0; font-size: 0.95em; color:#333}
.card-actions {
    margin-top: 15px;
    display: flex;
    gap: 10px;
}
.button.is-small {
    padding: 5px 10px;
    font-size: 0.8em;
}
.button.is-info { background-color: #3498db; color: white; }
.button.is-success { background-color: #2ecc71; color: white; }
/* Add button styles from Navbar or define here */
</style>
  