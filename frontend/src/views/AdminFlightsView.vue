
<template>
  <div class="admin-flights-view">
    <h2>Administrar vuelos</h2>
    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="success" type="success" :message="success" />

    <button @click="showCreateForm = !showCreateForm" class="button is-primary">
      {{ showCreateForm ? 'Cancelar' : 'Crear nuevo vuelo' }}
    </button>

    <div v-if="showCreateForm || editingFlight" class="form-container">
       <h3>{{ editingFlight ? 'Editar Vuelo' : 'Crear Vuelo' }}</h3>
       <FlightForm :initial-data="flightToEdit" @submit="handleFormSubmit" />
    </div>

    <div v-if="loading" class="loading">Cargando vuelos...</div>
    <table v-else-if="flights.length > 0">
      <thead>
        <tr>
          <th>Número</th>
          <th>Origen</th>
          <th>Destino</th>
          <th>Salida</th>
          <th>Asientos</th>
          <th>Precio</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="flight in flights" :key="flight.id">
          <td>{{ flight.flight_number }}</td>
          <td>{{ flight.origin }}</td>
          <td>{{ flight.destination }}</td>
          <td>{{ formatDate(flight.departure_time) }}</td>
          <td>{{ flight.seats_available }}</td>
          <td>${{ parseFloat(flight.price).toFixed(2) }}</td>
          <td>
            <button @click="editFlight(flight)" class="button is-small is-warning">Editar</button>
            <button @click="confirmDelete(flight.id)" class="button is-small is-danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No se encontraron vuelos.</p>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import * as api from '@/services/api';
import FlightForm from '@/components/FlightForm.vue';
import AlertMessage from '@/components/AlertMessage.vue';
import {formatDate} from '@/utils/formatters'; // Create a utils file for helpers

const flights = ref([]);
const loading = ref(true);
const error = ref('');
const success = ref('');
const showCreateForm = ref(false);
const editingFlight = ref(null); // Holds the flight being edited

const flightToEdit = computed(() => editingFlight.value || {
    // Default empty object for creation form
    flight_number: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    seats_available: 100, // Default
    price: 0
});

const loadFlights = async () => {
    loading.value = true;
    error.value = '';
    success.value = ''; // Clear success messages on reload
    try {
        const response = await api.fetchFlights();
        flights.value = response.data;
    } catch (err) {
        console.error("No se pudieron obtener los vuelos:", err);
        error.value = 'No se pudieron cargar los vuelos.';
    } finally {
        loading.value = false;
    }
};

onMounted(loadFlights);

const editFlight = (flight) => {
    editingFlight.value = { ...flight }; // Create a copy to edit
    showCreateForm.value = true; // Show the form
};

const handleFormSubmit = async (flightData) => {
    error.value = '';
    success.value = '';
    const isEditing = !!editingFlight.value;
    const flightId = editingFlight.value?.id;

    // Basic date validation example (ensure dates are valid)
    if (new Date(flightData.departure_time) >= new Date(flightData.arrival_time)) {
         error.value = "La hora de llegada debe ser después de la hora de salida.";
         return;
     }

    try {
        if (isEditing && flightId) {
            await api.updateFlight(flightId, flightData);
            success.value = '¡Vuelo actualizado con éxito!';
        } else {
            await api.createFlight(flightData);
            success.value = '¡Vuelo creado con éxito!';
        }
        // Reset form state and reload flights
        editingFlight.value = null;
        showCreateForm.value = false;
        await loadFlights();
    } catch (err) {
         console.error(`No se pudo ${isEditing ? 'actualizar' : 'crear'} el vuelo:`, err.response?.data || err);
         error.value = err.response?.data?.error || `No se pudo ${isEditing ? 'actualizar' : 'crear'} el vuelo.`;
    }
};

const confirmDelete = async (id) => {
    if (window.confirm('¿Seguro que quieres eliminar este vuelo? Esta acción no se puede deshacer.')) {
        error.value = '';
        success.value = '';
        try {
            await api.deleteFlight(id);
            success.value = '¡Vuelo eliminado con éxito!';
            await loadFlights(); // Refresh the list
        } catch (err) {
             console.error("No se pudo eliminar el vuelo:", err.response?.data || err);
             error.value = err.response?.data?.message || 'No se pudo eliminar el vuelo.';
        }
    }
};

// Re-use formatter from FlightCard or move to utils
// const formatDate = (dateString) => { /* ... */ };
</script>

<style scoped>
.admin-flights-view { margin-top: 20px; }
.form-container { border: 1px solid #ccc; padding: 20px; margin-top: 20px; margin-bottom: 20px; border-radius: 5px; }
table { width: 100%; border-collapse: collapse; margin-top: 20px; }
th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
th { background-color: #f2f2f2; }
td button { margin-right: 5px; }
.button.is-primary { margin-bottom: 15px; }
.button.is-warning { background-color: #f39c12; color: white; }
.button.is-danger { background-color: #e74c3c; color: white; }
 .loading { text-align: center; padding: 20px; font-style: italic; }
</style>
