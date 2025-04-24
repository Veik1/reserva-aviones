<template>
  <div class="flight-details-container">
    <AlertMessage v-if="error" type="error" :message="error" />
    <div v-if="loading" class="loading">Cargando detalles del vuelo...</div>

    <div v-else-if="flight" class="flight-details-card">
      <!-- Sección Opcional de Imagen -->
      <div class="flight-image-wrapper" v-if="flight.image_url">
        <img :src="flight.image_url" :alt="`Imagen del vuelo ${flight.flight_number}`" class="flight-image-details" @error="handleImageError">
      </div>
      <div class="flight-image-placeholder" v-else>
         <span>✈️</span> <!-- Placeholder si no hay imagen -->
      </div>

      <!-- Sección de Encabezado -->
      <div class="details-header">
        <h2>Vuelo {{ flight.flight_number }}</h2>
        <!-- Podrías añadir un badge de estado si fuera relevante aquí -->
      </div>

      <!-- Sección Principal de Información -->
      <div class="details-body">
        <h3>Información del Vuelo</h3>
        <div class="info-grid">
          <div class="info-item">
            <span class="info-label">Origen</span>
            <span class="info-value">{{ flight.origin }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Destino</span>
            <span class="info-value">{{ flight.destination }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Salida</span>
            <span class="info-value">{{ formatDate(flight.departure_time) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Llegada</span>
            <span class="info-value">{{ formatDate(flight.arrival_time) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Precio por asiento</span>
            <span class="info-value price">${{ parseFloat(flight.price).toFixed(2) }}</span>
          </div>
           <div class="info-item">
            <span class="info-label">Asientos disponibles</span>
            <span class="info-value">{{ flight.seats_available }}</span>
          </div>
        </div>
      </div>

      <!-- Sección de Acciones -->
      <div class="details-actions">
        <router-link v-if="authStore.isAuthenticated" :to="{ name: 'create-booking', params: { flightId: flight.id } }" class="button action-button is-success">
            Reservar este Vuelo
        </router-link>
         <router-link v-else :to="{ name: 'login', query: { redirect: route.fullPath } }" class="button action-button is-info">
            Iniciar sesión para Reservar
        </router-link>
        <router-link to="/flights" class="button action-button is-light">Volver a Vuelos</router-link>
      </div>
    </div>

    <!-- Mensaje si el vuelo no se encuentra -->
    <div v-else class="not-found">
      <p>Vuelo no encontrado.</p>
      <router-link to="/flights" class="button is-light">Volver a Vuelos</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRouter si lo necesitas para redirect
import { fetchFlightById } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import AlertMessage from '@/components/AlertMessage.vue';
import { formatDate } from '@/utils/formatters'; // Asegúrate de que la ruta sea correcta

const props = defineProps({
  id: { // Recibido del router
    type: String,
    required: true,
  },
});

const route = useRoute();
const router = useRouter(); // Declara router
const authStore = useAuthStore();
const flight = ref(null);
const loading = ref(true);
const error = ref('');

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
    console.error(`Failed to fetch flight ${flightId.value}:`, err);
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

// Opcional: Manejador para imágenes rotas
const handleImageError = (event) => {
  console.warn(`Error cargando imagen: ${props.flight.image_url}`);
  // Opcional: Ocultar la imagen rota o mostrar un icono
   event.target.style.display = 'none'; // Oculta la imagen
   // Podrías tener un div placeholder que se muestre en este caso
};

</script>

<style scoped>
.flight-details-container {
  max-width: 850px; /* Ancho máximo de la tarjeta */
  margin: 40px auto; /* Margen superior/inferior y centrado horizontal */
  padding: 20px; /* Espacio alrededor si es necesario */
}

.loading, .not-found {
    text-align: center;
    padding: 50px;
    font-style: italic;
    color: #666;
}
.not-found p {
    margin-bottom: 20px;
}

.flight-details-card {
  background-color: #fff;
  border: 1px solid #e1e1e1;
  border-radius: 10px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.08);
  overflow: hidden; /* Para contener bordes y sombras */
}

.flight-image-wrapper {
  width: 100%;
  height: 250px; /* Ajusta la altura de la imagen */
  overflow: hidden;
}
.flight-image-details {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.flight-image-placeholder {
    width: 100%;
    height: 250px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f0f0f0;
    font-size: 4em;
    color: #ccc;
}


.details-header {
  padding: 20px 25px;
  border-bottom: 1px solid #eee;
  background-color: #f9f9f9; /* Fondo ligero para el encabezado */
}
.details-header h2 {
  margin: 0;
  font-size: 1.8em;
  color: #333;
  font-weight: 600;
}

.details-body {
  padding: 25px;
}
.details-body h3 {
  font-size: 1.3em;
  color: #444;
  margin-top: 0;
  margin-bottom: 20px;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Columnas responsivas */
  gap: 18px 25px; /* Espacio vertical y horizontal */
}

.info-item {
  display: flex;
  flex-direction: column; /* Etiqueta arriba, valor abajo */
}

.info-label {
  font-size: 0.85em;
  color: #777;
  margin-bottom: 4px;
  text-transform: uppercase; /* Opcional */
  font-weight: 500;
}

.info-value {
  font-size: 1.05em;
  color: #2c3e50;
  font-weight: 500;
}
.info-value.price {
    font-weight: bold;
    color: #27ae60; /* Color verde para el precio */
}


.details-actions {
  padding: 20px 25px;
  border-top: 1px solid #eee;
  background-color: #f9f9f9;
  display: flex;
  justify-content: flex-end; /* Botones a la derecha */
  gap: 15px;
}

.action-button {
  padding: 10px 22px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-decoration: none;
  font-size: 1em;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.action-button:hover {
    opacity: 0.9;
    transform: translateY(-1px);
}

.button.is-success { background-color: #2ecc71; color: white; }
.button.is-info { background-color: #3498db; color: white; }
.button.is-light { background-color: #ecf0f1; color: #333; border: 1px solid #ddd;}

/* Estilos para el botón 'Volver' */
.button.is-light:hover { background-color: #dcdde1; }

</style>