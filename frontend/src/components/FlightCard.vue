<template>
  <div class="flight-card">
    <div class="card-image-container" v-if="flight.image_url">
      <img :src="flight.image_url" :alt="`Vuelo ${flight.flight_number} a ${flight.destinationAirport?.city?.name || flight.destinationAirport?.name}`" class="flight-image" @error="handleImageError">
    </div>
    <div class="card-image-placeholder" v-else>
      <span>✈️</span>
    </div>

    <!-- Sección de Texto -->
    <div class="card-content">
      <h3>{{ flight.flight_number }}</h3>
      <p>
          <strong>Desde:</strong>
          {{ flight.originAirport?.city?.name || flight.originAirport?.name || 'N/A' }}
           ({{ flight.originAirport?.iata_code || 'N/A' }}) <!-- AÑADIDO IATA Code -->
      </p>
      <p>
          <strong>Hasta:</strong>
            {{ flight.destinationAirport?.city?.name || flight.destinationAirport?.name || 'N/A' }}
           ({{ flight.destinationAirport?.iata_code || 'N/A' }}) <!-- AÑADIDO IATA Code -->
      </p>
      <p><strong>Partida:</strong> {{ formatDate(flight.departure_time) }}</p>
      <p><strong>Llegada:</strong> {{ formatDate(flight.arrival_time) }}</p>

      <!-- Mostrar información de precios y clases -->
      <div v-if="lowestPrice !== null">
        <p><strong>Desde:</strong><span class="price-value"> u$s {{ lowestPrice.toFixed(2) }}</span></p>
        <p v-if="availableClasses.length > 0">
          <strong>Clases:</strong> {{ availableClasses.join(', ') }}
        </p>
      </div>
      <p v-else>
        <strong>Precio:</strong> <span class="price-value">No disponible</span>
      </p>
      <!-- Ya no mostramos 'Asientos' generales aquí -->
    </div>

    <div class="card-actions">
        <router-link :to="{ name: 'flight-details', params: { id: flight.id } }" class="button is-small is-info">
           Ver detalles y Clases
        </router-link>
        <!-- El botón de "Reservar ahora" se elimina de aquí -->
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useAuthStore } from '@/store/auth';
import { formatDate } from '@/utils/formatters';

const props = defineProps({
  flight: {
    type: Object,
    required: true,
  },
});

const authStore = useAuthStore();

const handleImageError = (event) => {
  console.warn(`Error cargando imagen: ${props.flight.image_url}`);
};

// Computed property para obtener el precio más bajo
const lowestPrice = computed(() => {
  if (props.flight && props.flight.offerings && props.flight.offerings.length > 0) {
    const prices = props.flight.offerings.map(offering => parseFloat(offering.price));
    return Math.min(...prices);
  }
  return null;
});

// Computed property para obtener los nombres de las clases disponibles
const availableClasses = computed(() => {
  if (props.flight && props.flight.offerings && props.flight.offerings.length > 0) {
    return [...new Set(props.flight.offerings.map(offering => offering.flightClass?.name).filter(name => name))];
  }
  return [];
});

</script>

<style scoped>
/* Estilos - Reutilizar los que tenías y que no dependen de información directa de airport/city */
.flight-card {
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
}
.flight-card:hover {
     transform: translateY(-4px);
     box-shadow: 0 6px 12px rgba(0,0,0,0.1);
}

.card-image-container {
  width: 100%;
  height: 160px;
  overflow: hidden;
  background-color: #f0f0f0;
}
.flight-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card-image-placeholder {
    width: 100%;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    font-size: 2.5em;
    color: #ccc;
}

.card-content {
  padding: 12px 18px;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
}
.card-content h3 {
  margin-top: 0;
  margin-bottom: 12px;
  color: #3498db;
  font-size: 1.15em;
  font-weight: 600;
}
.card-content p {
  margin: 4px 0;
  font-size: 0.9em;
  color: #444;
  line-height: 1.5;
}
.card-content p strong {
     color: #111;
     font-weight: 500;
     min-width: 85px;
     display: inline-block;
     margin-right: 5px;
}
.card-content .price-value {
    font-weight: bold;
    color: #27ae60;
    margin-left: 5px;
}

.card-actions {
  padding: 12px 18px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: auto;
}
.button.is-small { padding: 6px 12px; font-size: 0.8em; }
.button.is-info { background-color: #3498db; color: white; border: none; }
/* Eliminado el estilo .button.is-success si ya no se usa aquí */
.button:hover { opacity: 0.85; }

</style>