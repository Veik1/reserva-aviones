<template>
  <div class="flight-details-container">
    <AlertMessage v-if="error" type="error" :message="error" />
    <div v-if="loading" class="loading">Cargando detalles del vuelo...</div>

    <div v-else-if="flight" class="flight-details-card">
      <!-- 1. Imagen Grande Arriba -->
      <div class="flight-image-wrapper" v-if="flight.image_url">
        <img :src="flight.image_url" :alt="`Imagen del vuelo ${flight.flight_number}`" class="flight-image-details">
      </div>
      <div class="flight-image-placeholder" v-else>
         <span>✈️</span>
      </div>

      <!-- 2. Encabezado e Información General del Vuelo -->
      <div class="details-header">
        <h2>Vuelo {{ flight.flight_number }}</h2>

        <p class="route-info">
          {{ flight.originAirport?.city?.name || flight.originAirport?.name || 'N/A' }}
          ({{ flight.originAirport?.iata_code || 'N/A' }}) <!-- AÑADIR -->
          →
          {{ flight.destinationAirport?.city?.name || flight.destinationAirport?.name || 'N/A' }}
          ({{ flight.destinationAirport?.iata_code || 'N/A' }}) <!-- AÑADIR -->
        </p>
      </div>
      <div class="details-body general-info-body">
        <h3>Horarios</h3>
        <div class="info-grid schedule-grid">
          <div class="info-item">
            <span class="info-label">Salida</span>
            <span class="info-value">{{ formatDate(flight.departure_time) }}</span>
          </div>
          <div class="info-item">
            <span class="info-label">Llegada</span>
            <span class="info-value">{{ formatDate(flight.arrival_time) }}</span>
          </div>
        </div>
      </div>

      <!-- 3. Sección de Selección de Clases -->
      <div class="details-body class-selection-body">
        <h3 class="section-divider">Selecciona tu Clase</h3>
        <div v-if="flight.offerings && flight.offerings.length > 0" class="offerings-table">
          <table>
            <thead>
              <tr>
                <th>Clase</th>
                <th>Precio</th>
                <th>Asientos Disp.</th>
                <th>Descripción</th>
                <th>Acción</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="offering in flight.offerings" :key="offering.id" class="offering-row">
                <td>{{ offering.flightClass?.name || 'N/A' }}</td>
                <td><span class="price-value">u$s {{ parseFloat(offering.price).toFixed(2) }}</span></td>
                <td>{{ offering.seats_available }}</td>
                <td class="class-description-cell">{{ offering.flightClass?.description || '-' }}</td>
                <td>
                  <button
                    v-if="offering.seats_available > 0 && authStore.isAuthenticated"
                    @click="selectOfferingAndProceed(offering)"
                    class="button action-button is-success compact-button">
                    Seleccionar
                  </button>
                  <button
                    v-else-if="offering.seats_available > 0 && !authStore.isAuthenticated"
                    @click="redirectToLogin(offering)"
                    class="button action-button is-info compact-button">
                    Iniciar Sesión
                  </button>
                  <span v-else-if="offering.seats_available <= 0" class="no-seats-text">
                    Agotado
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p v-else class="no-offerings-text">No hay clases disponibles para este vuelo.</p>
      </div>

      <div class="details-actions global-actions">
        <router-link to="/flights" class="button action-button is-light">Volver a Vuelos</router-link>
      </div>
    </div>

    <div v-else class="not-found">
      <p>Vuelo no encontrado.</p>
      <router-link to="/flights" class="button is-light">Volver a Vuelos</router-link>
    </div>
  </div>
</template>

<script setup>
// --- El SCRIPT SETUP NO CAMBIA ---
// (Debe ser el mismo que teníamos antes, con props, onMounted, handleImageError, selectOfferingAndProceed, redirectToLogin)
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { fetchFlightById } from '@/services/api';
import { useAuthStore } from '@/store/auth';
import AlertMessage from '@/components/AlertMessage.vue';
import { formatDate } from '@/utils/formatters';

const props = defineProps({ id: { type: String, required: true }});
const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const flight = ref(null);
const loading = ref(true);
const error = ref('');
const flightId = computed(() => props.id);

onMounted(async () => {
   if (!flightId.value) { error.value = "ID de vuelo no proporcionado."; loading.value = false; return; }
  try {
    loading.value = true; error.value = '';
    const response = await fetchFlightById(flightId.value);
    flight.value = response.data;
  } catch (err) {
    console.error(`Fallo al obtener vuelo ${flightId.value}:`, err);
    error.value = (err.response && err.response.status === 404) ? 'Vuelo no encontrado.' : 'No se pudo cargar detalles del vuelo.';
    flight.value = null;
  } finally { loading.value = false; }
});
const handleImageError = (event) => { console.warn(`Error cargando imagen: ${flight.value?.image_url}`); if(event.target) event.target.style.display = 'none';};
const selectOfferingAndProceed = (offering) => { router.push({ name: 'create-booking', params: { flightId: flight.value.id }, query: { offeringId: offering.id } }); };
const redirectToLogin = (offering) => { router.push({ name: 'login', query: { redirect: route.fullPath, offeringId: offering.id } }); };
</script>

<style scoped>
.flight-details-container {
  max-width: 900px; /* Un poco más ancho para la tabla */
  margin: 30px auto;
  padding: 0 15px; /* Padding lateral para la vista general */
}
.loading, .not-found { text-align: center; padding: 50px; font-style: italic; color: #666; }
.not-found p { margin-bottom: 20px; }

.flight-details-card {
  background-color: #fff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.08);
  overflow: hidden;
}

/* Imagen Grande */
.flight-image-wrapper { width: 100%; height: 280px; /* Más alta */ overflow: hidden; }
.flight-image-details { width: 100%; height: 100%; object-fit: cover; display: block; }
.flight-image-placeholder { width: 100%; height: 280px; display: flex; align-items: center; justify-content: center; background-color: #f0f0f0; font-size: 5em; color: #ccc; }

/* Encabezado e Info General */
.details-header { padding: 20px 25px; border-bottom: 1px solid #f0f0f0; }
.details-header h2 { margin: 0 0 5px 0; font-size: 2em; color: #333; font-weight: 600; }
.route-info { margin: 0; font-size: 1.1em; color: #555; }

.details-body { padding: 20px 25px; } /* Padding base para secciones del cuerpo */
.general-info-body { border-bottom: 1px solid #f0f0f0; } /* Separador */

.details-body h3 { /* "Horarios", "Selecciona tu Clase" */
  font-size: 1.25em; color: #4a4a4a; margin-top: 0; margin-bottom: 18px;
  padding-bottom: 8px; /* No más borde inferior aquí, se maneja por sección */
  font-weight: 600;
}
.details-body h3.section-divider { margin-top: 25px; }

.info-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 15px 20px; }
.schedule-grid { margin-bottom: 15px; }
.info-item { display: flex; flex-direction: column; }
.info-label { font-size: 0.8em; color: #777; margin-bottom: 3px; text-transform: uppercase; }
.info-value { font-size: 1em; color: #363636; font-weight: 500; }

/* Tabla de Ofertas de Clase */
.offerings-table {
  width: 100%;
  border-collapse: collapse; /* Bordes limpios */
  margin-top: 10px;
}
.offerings-table th, .offerings-table td {
  text-align: left;
  padding: 12px 10px; /* Buen padding */
  border-bottom: 1px solid #eee;
  vertical-align: middle; /* Alinear verticalmente en el medio */
}
.offerings-table th {
  background-color: #f9f9f9;
  font-weight: 600;
  font-size: 0.9em;
  color: #555;
  text-transform: uppercase;
}
.offerings-table td { font-size: 0.95em; }
.price-value { font-weight: bold; color: #27ae60; }
.class-description-cell { font-size: 0.85em; color: #666; font-style: italic; max-width: 250px; /* Evitar que sea muy ancha */ }
.no-seats-text { color: #e74c3c; font-weight: bold; font-size: 0.9em; }
.no-offerings-text { padding: 20px; text-align: center; color: #888; font-style: italic; }

.compact-button {
    padding: 6px 12px !important;
    font-size: 0.85em !important;
    white-space: nowrap; /* Evitar que el texto del botón se parta */
}

/* Acciones Globales */
.details-actions.global-actions {
  padding: 20px 25px; border-top: 1px solid #f0f0f0; background-color: #fafafa;
  display: flex; justify-content: flex-end; gap: 15px; margin-top: 20px;
}
.action-button { /* Estilo base para botones */
  padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; text-decoration: none;
  font-size: 0.95em; font-weight: 500; transition: background-color 0.2s ease, transform 0.1s ease;
}
.action-button:hover { opacity: 0.9; transform: translateY(-1px); }
.button.is-success { background-color: #2ecc71; color: white; }
.button.is-info { background-color: #3498db; color: white; }
.button.is-light { background-color: #e9e9e9; color: #333; border: 1px solid #ccc;}
.button.is-light:hover { background-color: #dcdcdc; }

</style>