<template>
  <div class="admin-flights-view">
    <h2>Administrar Vuelos</h2>
    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="success" type="success" :message="success" />

    <button @click="openCreateForm" class="button is-primary">
      Crear Nuevo Vuelo
    </button>

    <!-- Modal o componente para el formulario -->
    <div v-if="showFormModal" class="modal-overlay" @click.self="closeFormModal">
      <div class="form-container modal-content">
        <h3>{{ editingFlight ? 'Editar Vuelo' : 'Crear Vuelo' }}</h3>
        <FlightForm
          :initial-data="flightToEdit"
          @submit="handleFormSubmit"
          @cancel="closeFormModal"
        />
      </div>
    </div>

    <div v-if="loading" class="loading">Cargando vuelos...</div>
    <table v-else-if="flights.length > 0">
      <thead>
        <tr>
          <th>Número</th>
          <th>Origen</th>      <!-- AÑADIR -->
          <th>Destino</th>     <!-- AÑADIR -->
          <th>Salida</th>
          <th>Ofertas de Clase</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="flight in flights" :key="flight.id">
          <td>{{ flight.flight_number }}</td>
          <!-- Añadir los iata_code aquí -->
          <td>
            {{ flight.originAirport?.city?.name || flight.originAirport?.name || 'N/A' }}
            ({{ flight.originAirport?.iata_code || 'N/A' }}) <!-- AÑADIR -->
          </td>
          <td>
            {{ flight.destinationAirport?.city?.name || flight.destinationAirport?.name || 'N/A' }}
            ({{ flight.destinationAirport?.iata_code || 'N/A' }}) <!-- AÑADIR -->
          </td>
          <td>{{ formatDate(flight.departure_time) }}</td>
          <td>
            <ul v-if="flight.offerings && flight.offerings.length > 0" class="offerings-summary">
              <li v-for="offering in flight.offerings.slice(0, 2)" :key="offering.id">
                {{ offering.flightClass?.name }}: u$s{{ parseFloat(offering.price).toFixed(2) }} ({{ offering.seats_available }} asientos)
              </li>
              <li v-if="flight.offerings.length > 2">... y {{ flight.offerings.length - 2 }} más</li>
            </ul>
            <span v-else>Sin ofertas</span>
          </td>
          <td class="actions-cell">
            <button @click="openEditForm(flight)" class="button is-small is-warning">Editar Vuelo</button>
            <router-link
              :to="{ name: 'admin-flight-offerings', params: { flightId: flight.id } }"
              class="button is-small is-info">
              Gestionar Ofertas
            </router-link>
            <button @click="confirmDeleteFlight(flight.id)" class="button is-small is-danger">Eliminar Vuelo</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No se encontraron vuelos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router'; // Importar useRouter
import * as api from '@/services/api';
import FlightForm from '@/components/FlightForm.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import { formatDate } from '@/utils/formatters';

const router = useRouter(); // Instancia del router
const flights = ref([]);
const loading = ref(true);
const error = ref('');
const success = ref('');

const showFormModal = ref(false); // Para controlar la visibilidad del modal/formulario
const editingFlight = ref(null); // Vuelo que se está editando, o null si es creación

// flightToEdit ahora no necesita seats_available ni price, ya que FlightForm no los manejará
const flightToEdit = computed(() => {
  if (editingFlight.value) {
    // Al editar, pasar solo los campos relevantes del vuelo
    const { seats_available, price, offerings, ...flightData } = editingFlight.value;
    return flightData;
  }
  // Para creación, un objeto vacío (FlightForm se encargará de sus defaults)
  return {
    flight_number: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    image_url: ''
  };
});

const loadFlights = async () => {
  loading.value = true; error.value = ''; success.value = '';
  try {
    const response = await api.fetchFlights(); // Esta API ahora devuelve vuelos con sus offerings
    flights.value = response.data;
  } catch (err) {
    console.error("No se pudieron obtener los vuelos:", err);
    error.value = 'No se pudieron cargar los vuelos.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadFlights);

const openCreateForm = () => {
  editingFlight.value = null; // Asegurar que no haya datos de edición
  showFormModal.value = true;
};

const openEditForm = (flight) => {
  editingFlight.value = { ...flight }; // Copia del vuelo para editar
  showFormModal.value = true;
};

const closeFormModal = () => {
  showFormModal.value = false;
  editingFlight.value = null; // Limpiar estado de edición
};

const handleFormSubmit = async (flightDataFromForm) => {
  // flightDataFromForm ya no contendrá price ni seats_available
  error.value = ''; success.value = '';
  const isEditing = !!editingFlight.value;
  const flightIdToUpdate = editingFlight.value?.id;

  if (new Date(flightDataFromForm.departure_time) >= new Date(flightDataFromForm.arrival_time)) {
    error.value = "La hora de llegada debe ser después de la hora de salida.";
    return;
  }

  try {
    if (isEditing && flightIdToUpdate) {
      await api.updateFlight(flightIdToUpdate, flightDataFromForm);
      success.value = '¡Vuelo actualizado con éxito!';
    } else {
      await api.createFlight(flightDataFromForm);
      success.value = '¡Vuelo creado con éxito!';
    }
    closeFormModal();
    await loadFlights(); // Recargar la lista de vuelos
  } catch (err) {
    console.error(`No se pudo ${isEditing ? 'actualizar' : 'crear'} el vuelo:`, err.response?.data || err);
    error.value = err.response?.data?.error || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el vuelo.`;
    // No cerrar el modal en caso de error para que el usuario pueda corregir
  }
};

const confirmDeleteFlight = async (id) => {
  if (window.confirm('¿Seguro que quieres eliminar este vuelo? Se eliminarán también sus ofertas y reservas asociadas. Esta acción no se puede deshacer.')) {
    // ... (lógica de confirmDelete existente) ...
    error.value = ''; success.value = '';
    try {
        await api.deleteFlight(id);
        success.value = '¡Vuelo eliminado con éxito!';
        await loadFlights();
    } catch (err) {
          console.error("No se pudo eliminar el vuelo:", err.response?.data || err);
          error.value = err.response?.data?.message || 'No se pudo eliminar el vuelo.';
    }
  }
};
</script>

<style scoped>
.admin-flights-view { margin-top: 20px; padding: 0 20px; } /* Añadido padding */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}
.modal-content {
  background-color: white;
  padding: 25px 30px;
  border-radius: 8px;
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
  width: 90%;
  max-width: 700px; /* Ancho del modal */
}
.form-container h3 { margin-top: 0; margin-bottom: 20px; }

table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; font-size: 0.9em; }
th { background-color: #f2f2f2; font-weight: 600; }
td.actions-cell { white-space: nowrap; } /* Evitar que botones se partan */
td button, td .button { margin-right: 5px; margin-bottom: 5px; } /* Espacio entre botones */
.button.is-primary { margin-bottom: 20px; }
.button.is-warning { background-color: #f39c12; color: white; }
.button.is-danger { background-color: #e74c3c; color: white; }
.button.is-info { background-color: #3498db; color: white; }
.loading { text-align: center; padding: 20px; font-style: italic; }

.offerings-summary {
  list-style-type: none;
  padding-left: 0;
  margin: 0;
  font-size: 0.85em;
  color: #555;
}
.offerings-summary li {
  padding: 2px 0;
}
</style>