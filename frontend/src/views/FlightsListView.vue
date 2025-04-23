
<template>
  <div class="flights-list-view">
    <h2>Vuelos disponibles</h2>
    <AlertMessage v-if="error" type="error" :message="error" />
    <div v-if="loading" class="loading">Cargando vuelos...</div>
    <div v-else-if="flights.length > 0" class="flight-grid">
      <FlightCard v-for="flight in flights" :key="flight.id" :flight="flight" />
    </div>
    <div v-else>
      <p>No hay vuelos disponibles en este momento.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { fetchFlights } from '@/services/api';
import FlightCard from '@/components/FlightCard.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const flights = ref([]);
const loading = ref(true);
const error = ref('');

onMounted(async () => {
  try {
    const response = await fetchFlights();
    flights.value = response.data;
  } catch (err) {
    console.error("No se pudieron obtener los vuelos:", err);
    error.value = 'No se pudieron cargar los vuelos. Inténtalo de nuevo más tarde.';
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.flight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
}
.loading { text-align: center; padding: 20px; font-style: italic; }
</style>
