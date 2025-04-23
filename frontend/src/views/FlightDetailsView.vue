<template>
    <div class="flight-details-view">
      <AlertMessage v-if="error" type="error" :message="error" />
      <div v-if="loading" class="loading">Cargando detalles del vuelo...</div>
      <div v-else-if="flight" class="flight-info">
        <h2>Detalles del Vuelo: {{ flight.flight_number }}</h2>
        <div class="details-grid">
          <p><strong>Origen:</strong> {{ flight.origin }}</p>
          <p><strong>Destino:</strong> {{ flight.destination }}</p>
          <p><strong>Salida:</strong> {{ formatDate(flight.departure_time) }}</p>
          <p><strong>Llegada:</strong> {{ formatDate(flight.arrival_time) }}</p>
          <p><strong>Asientos Disponibles:</strong> {{ flight.seats_available }}</p>
          <p><strong>Precio:</strong> ${{ parseFloat(flight.price).toFixed(2) }}</p>
        </div>
        <div class="actions">
          <router-link v-if="authStore.isAuthenticated" :to="{ name: 'create-booking', params: { flightId: flight.id } }" class="button is-success">
            Reservar este vuelo
          </router-link>
           <router-link v-else to="/login" class="button is-info">
              Iniciar sesión para reservar
          </router-link>
          <router-link to="/flights" class="button is-light">Volver a vuelos</router-link>
        </div>
      </div>
      <div v-else>
        <p>Vuelo no encontrado.</p>
         <router-link to="/flights" class="button is-light">Volver a Vuelos</router-link>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, computed } from 'vue';
  import { useRoute } from 'vue-router';
  import { fetchFlightById } from '@/services/api';
  import { useAuthStore } from '@/store/auth';
  import AlertMessage from '@/components/AlertMessage.vue';
  import { formatDate } from '@/utils/formatters'; // Assuming you created this helper
  
  const props = defineProps({
    id: { // Received from router config (props: true)
      type: String,
      required: true,
    },
  });
  
  const route = useRoute(); // Can also access params via route.params.id if needed
  const authStore = useAuthStore();
  const flight = ref(null);
  const loading = ref(true);
  const error = ref('');
  
  // Access the id directly from props
  const flightId = computed(() => props.id);
  
  onMounted(async () => {
    if (!flightId.value) {
        error.value = "No se proporcionó identificación del vuelo.";
        loading.value = false;
        return;
    }
    try {
      loading.value = true;
      error.value = '';
      const response = await fetchFlightById(flightId.value);
      flight.value = response.data;
    } catch (err) {
      console.error(`No se pudo obtener el vuelo ${flightId.value}:`, err);
      if (err.response && err.response.status === 404) {
          error.value = 'Vuelo no encontrado.';
      } else {
          error.value = 'No se pudieron cargar los detalles del vuelo. Inténtalo de nuevo más tarde.';
      }
      flight.value = null;
    } finally {
      loading.value = false;
    }
  });
  
  </script>
  
  <style scoped>
  .flight-details-view {
    max-width: 800px;
    margin: 30px auto;
    padding: 25px;
    background-color: #fff;
    border: 1px solid #e1e1e1;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.05);
  }
  
  .loading { text-align: center; padding: 40px; font-style: italic; color: #666; }
  
  h2 {
    text-align: center;
    margin-bottom: 25px;
    color: #3498db;
    border-bottom: 2px solid #eee;
    padding-bottom: 10px;
  }
  
  .details-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px 25px; /* row-gap column-gap */
    margin-bottom: 30px;
  }
  
  .details-grid p {
    margin: 0;
    padding: 8px 0;
    font-size: 1.05em;
    border-bottom: 1px dashed #eee;
  }
  
  .details-grid p:last-child {
      border-bottom: none;
  }
  
  .details-grid strong {
      color: #555;
      min-width: 100px;
      display: inline-block;
  }
  
  .actions {
    text-align: center;
    margin-top: 20px;
    padding-top: 20px;
    border-top: 1px solid #eee;
    display: flex;
    justify-content: center;
    gap: 15px;
  }
  
  /* Basic Button Styles (reuse or define) */
  .button {
    padding: 10px 20px;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    text-decoration: none;
    font-size: 1em;
    transition: background-color 0.2s ease;
  }
  .button.is-success { background-color: #2ecc71; color: white; }
  .button.is-success:hover { background-color: #27ae60; }
  .button.is-info { background-color: #3498db; color: white; }
  .button.is-info:hover { background-color: #2980b9; }
  .button.is-light { background-color: #ecf0f1; color: #333; border: 1px solid #ddd;}
  .button.is-light:hover { background-color: #dcdde1; }
  
  </style>