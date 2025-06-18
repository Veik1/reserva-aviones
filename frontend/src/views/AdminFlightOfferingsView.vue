<template>
  <div class="admin-flight-offerings-view">
    <div v-if="loadingFlightDetails" class="loading">Cargando detalles del vuelo...</div>
    <div v-else-if="flight">
      <h2>Gestionar Ofertas para Vuelo: {{ flight.flight_number }}</h2>
      <p class="flight-route">
        {{
          flight.originAirport?.city?.name ||
          flight.originAirport?.name ||
          'N/A'
        }}
        ({{ flight.originAirport?.iata_code || '' }})
        →
        {{
          flight.destinationAirport?.city?.name ||
          flight.destinationAirport?.name ||
          'N/A'
        }}
        ({{ flight.destinationAirport?.iata_code || '' }})
      </p>

      <AlertMessage v-if="error" type="error" :message="error" />
      <AlertMessage v-if="success" type="success" :message="success" />

      <!-- Formulario para Crear/Editar Oferta -->
      <div class="form-container offering-form-card">
        <h3>{{ editingOffering ? 'Editar Oferta' : 'Crear Nueva Oferta' }}</h3>
        <form @submit.prevent="handleOfferingFormSubmit">
          <div class="form-grid">
            <div class="form-group">
              <label for="flightClass">Clase de Vuelo:</label>
              <select id="flightClass" v-model="offeringFormData.flight_class_id" required :disabled="editingOffering !== null">
                <option disabled value="">Seleccione una clase</option>
                <option v-for="fc in availableFlightClasses" :key="fc.id" :value="fc.id">
                  {{ fc.name }}
                </option>
              </select>
            </div>
            <div class="form-group">
              <label for="seats_available">Asientos Disponibles:</label>
              <input type="number" id="seats_available" v-model.number="offeringFormData.seats_available" min="0" required>
            </div>
            <div class="form-group">
              <label for="price">Precio (u$s):</label>
              <input type="number" id="price" v-model.number="offeringFormData.price" min="0" step="0.01" required>
            </div>
          </div>
          <div class="form-actions">
            <button type="submit" class="button is-success" :disabled="loadingAction">
              {{ editingOffering ? 'Actualizar Oferta' : 'Añadir Oferta' }}
            </button>
            <button type="button" v-if="editingOffering" @click="cancelEditOffering" class="button is-light">
              Cancelar Edición
            </button>
          </div>
        </form>
      </div>

      <!-- Tabla de Ofertas Existentes -->
      <h3>Ofertas Existentes</h3>
      <div v-if="loadingOfferings" class="loading">Cargando ofertas...</div>
      <table v-else-if="flightOfferings.length > 0">
        <thead>
          <tr>
            <th>Clase</th>
            <th>Asientos Disp.</th>
            <th>Precio</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="offering in flightOfferings" :key="offering.id">
            <td>{{ offering.flightClass?.name || 'N/A' }}</td>
            <td>{{ offering.seats_available }}</td>
            <td>u$s {{ parseFloat(offering.price).toFixed(2) }}</td>
            <td class="actions-cell">
              <button @click="startEditOffering(offering)" class="button is-small is-warning">Editar</button>
              <button @click="confirmDeleteOffering(offering.id)" class="button is-small is-danger">Eliminar</button>
            </td>
          </tr>
        </tbody>
      </table>
      <p v-else>Este vuelo aún no tiene ofertas de clase definidas.</p>

    </div>
    <div v-else-if="!loadingFlightDetails && !flight">
      <p>Vuelo no encontrado o no se pudo cargar.</p>
    </div>
    <div class="global-actions">
        <router-link :to="{ name: 'admin-flights' }" class="button is-light">Volver a Lista de Vuelos</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // useRouter no se usa activamente, pero es bueno tenerlo
import * as api from '@/services/api';
import AlertMessage from '@/components/AlertMessage.vue';

const props = defineProps({
  flightId: { // Recibido de la ruta gracias a props: true
    type: String,
    required: true
  }
});

const route = useRoute();
const router = useRouter();

const flight = ref(null); // Detalles del vuelo padre
const flightOfferings = ref([]); // Lista de ofertas para este vuelo
const availableFlightClasses = ref([]); // Lista de todas las clases de vuelo posibles

const loadingFlightDetails = ref(true);
const loadingOfferings = ref(false); // Para recargar ofertas después de una acción
const loadingAction = ref(false); // Para deshabilitar botón de submit del form
const error = ref('');
const success = ref('');

const editingOffering = ref(null); // Objeto de la oferta que se está editando
const offeringFormData = reactive({
  flight_class_id: '',
  seats_available: 0,
  price: 0
});

// Cargar detalles del vuelo y sus ofertas iniciales
const loadFlightAndOfferings = async () => {
  loadingFlightDetails.value = true;
  error.value = '';
  try {
    // El endpoint fetchFlightById ya debería traer las offerings anidadas
    const flightResponse = await api.fetchFlightById(props.flightId);
    flight.value = flightResponse.data;
    if (flight.value && flight.value.offerings) {
      flightOfferings.value = flight.value.offerings;
    } else {
      flightOfferings.value = []; // Asegurar que sea un array
    }
  } catch (err) {
    console.error("Error cargando detalles del vuelo y ofertas:", err);
    error.value = "No se pudieron cargar los detalles del vuelo.";
    flight.value = null;
  } finally {
    loadingFlightDetails.value = false;
  }
};

// Cargar todas las clases de vuelo disponibles para el dropdown
const loadAvailableFlightClasses = async () => {
  try {
    // --- USA LA LLAMADA REAL A LA API ---
    const response = await api.fetchFlightClasses();
    if (response && response.data) {
      availableFlightClasses.value = response.data;
    } else {
      availableFlightClasses.value = [];
    }
    // --- ELIMINA O COMENTA LOS DATOS MOCK ---
    // availableFlightClasses.value = [
    //   { id: 'mock-eco-id', name: 'Economica (Mock)' },
    //   { id: 'mock-prem-id', name: 'Premium (Mock)' },
    //   { id: 'mock-bus-id', name: 'Business (Mock)' },
    // ];
    // console.warn("Usando datos mock para FlightClasses. Implementa el endpoint GET /api/flightclasses y la función api.fetchFlightClasses()");

  } catch (err) {
    console.error("Error cargando clases de vuelo disponibles:", err);
    error.value = "No se pudieron cargar las clases de vuelo para el formulario.";
    availableFlightClasses.value = []; // Limpiar en caso de error
  }
};

onMounted(async () => {
  await loadFlightAndOfferings();
  await loadAvailableFlightClasses();
});

const resetOfferingForm = () => {
  offeringFormData.flight_class_id = '';
  offeringFormData.seats_available = 0;
  offeringFormData.price = 0;
  editingOffering.value = null;
};

const handleOfferingFormSubmit = async () => {
  loadingAction.value = true;
  error.value = ''; success.value = '';

  const dataToSubmit = {
    flight_id: props.flightId, // Siempre asociar a este vuelo
    flight_class_id: offeringFormData.flight_class_id,
    seats_available: offeringFormData.seats_available,
    price: offeringFormData.price
  };

  try {
    if (editingOffering.value) { // Actualizando
      await api.updateFlightOffering(editingOffering.value.id, dataToSubmit);
      success.value = 'Oferta actualizada correctamente.';
    } else { // Creando
      await api.createFlightOffering(dataToSubmit);
      success.value = 'Nueva oferta añadida correctamente.';
    }
    resetOfferingForm();
    await loadFlightAndOfferings(); // Recargar ofertas
  } catch (err) {
    console.error("Error al guardar oferta:", err.response?.data || err);
    error.value = err.response?.data?.error || 'No se pudo guardar la oferta.';
  } finally {
    loadingAction.value = false;
  }
};

const startEditOffering = (offering) => {
  editingOffering.value = offering;
  offeringFormData.flight_class_id = offering.flight_class_id || offering.flightClass?.id; // Tomar el ID de la clase
  offeringFormData.seats_available = offering.seats_available;
  offeringFormData.price = parseFloat(offering.price);
};

const cancelEditOffering = () => {
  resetOfferingForm();
};

const confirmDeleteOffering = async (offeringId) => {
  if (window.confirm('¿Seguro que quieres eliminar esta oferta de clase? Se podrían afectar reservas existentes si no tienen un manejo adecuado.')) {
    loadingAction.value = true; // Reusar loadingAction o crear uno específico
    error.value = ''; success.value = '';
    try {
      await api.deleteFlightOffering(offeringId);
      success.value = 'Oferta eliminada correctamente.';
      await loadFlightAndOfferings(); // Recargar
    } catch (err) {
      console.error("Error al eliminar oferta:", err.response?.data || err);
      error.value = err.response?.data?.error || err.response?.data?.message || 'No se pudo eliminar la oferta.';
    } finally {
      loadingAction.value = false;
    }
  }
};

</script>

<style scoped>
.admin-flight-offerings-view {
  max-width: 900px;
  margin: 20px auto;
  padding: 20px;
}
h2, h3 { text-align: center; margin-bottom: 15px; }
h3 { font-size: 1.3em; margin-top: 30px; color: #444; }
.flight-route { text-align: center; margin-bottom: 25px; font-size: 1.1em; color: #555; }
.loading { text-align: center; padding: 20px; font-style: italic; }

.offering-form-card {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid #eee;
  margin-bottom: 30px;
}
.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
}
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-weight: 500; font-size: 0.9em; }
.form-group input, .form-group select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}
.form-actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

table { width: 100%; border-collapse: collapse; margin-top: 10px; font-size: 0.9em; }
th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; }
th { background-color: #f2f2f2; font-weight: 600; }
td.actions-cell { white-space: nowrap; }
td button { margin-right: 5px; }

.global-actions { margin-top: 30px; text-align: center; }
.button.is-success { background-color: #2ecc71; color: white; }
.button.is-warning { background-color: #f39c12; color: white; }
.button.is-danger { background-color: #e74c3c; color: white; }
.button.is-light { background-color: #ecf0f1; color: #333; }
</style>