<template>
  <div class="admin-bookings-view"> <!-- Cambiado el nombre de la clase -->
    <h2>Administrar Reservas</h2> <!-- Título cambiado -->
    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="success" type="success" :message="success" />

    <!-- Eliminado el botón y el formulario de creación/edición -->

    <div v-if="loading" class="loading">Cargando reservas...</div> <!-- Texto cambiado -->
    <table v-else-if="bookings.length > 0"> <!-- Variable cambiada a bookings -->
      <thead>
        <tr>
          <th>Código Reserva</th>
          <th>Vuelo (Num)</th>
          <th>Usuario</th>
          <th>Pasajero</th>
          <th>Asiento</th>
          <th>Estado</th>
          <th>Precio Total</th>
          <th>Fecha Creación</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <!-- Loop cambiado a bookings -->
        <tr v-for="booking in bookings" :key="booking.id">
          <td>{{ booking.booking_code }}</td>
          <!-- Accede a datos asociados con optional chaining (?.) por si no vienen -->
          <td>{{ booking.flight?.flight_number || 'N/A' }}</td>
          <td>{{ booking.user?.name || booking.user?.email || 'N/A' }}</td>
          <td>
             {{ booking.passenger_name }} {{ booking.passenger_last_name }}
             <small v-if="booking.passenger_email">({{ booking.passenger_email }})</small>
          </td>
          <td>{{ booking.seat }}</td>
          <td>
              <span :class="`status-${booking.status?.toLowerCase()}`">{{ booking.status }}</span>
          </td>
          <td>${{ parseFloat(booking.total_price).toFixed(2) }}</td>
          <td>{{ formatDate(booking.created_at) }}</td> <!-- Usar la fecha de creación de la reserva -->
          <td>
            <!-- Eliminado botón de Editar por ahora -->
            <!-- <button @click="editBooking(booking)" class="button is-small is-warning">Editar Estado</button> -->
            <button @click="confirmDelete(booking.id)" class="button is-small is-danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No se encontraron reservas.</p> <!-- Mensaje cambiado -->
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'; // Eliminado computed si no se usa para editar
import * as api from '@/services/api'; // Mantenemos todas las importaciones de api
// Eliminada la importación de FlightForm ya que no se usa
import AlertMessage from '@/components/AlertMessage.vue';
import { formatDate } from '@/utils/formatters'; // Asegúrate que este archivo exista y funcione

// Cambiamos los nombres de las refs para claridad
const bookings = ref([]);
const loading = ref(true);
const error = ref('');
const success = ref('');
// Eliminadas las refs relacionadas con el formulario de edición/creación
// const showCreateForm = ref(false);
// const editingBooking = ref(null);

// Eliminado el computed property para editar
// const bookingToEdit = computed(...)

// Nueva función para cargar reservas
const loadBookings = async () => {
    loading.value = true;
    error.value = '';
    success.value = '';
    try {
        // Llamada a la API para obtener reservas
        const response = await api.fetchBookings();
        // Verificar si la respuesta tiene datos y es un array
        if (response && response.data && Array.isArray(response.data)) {
             bookings.value = response.data;
        } else {
            console.warn("La respuesta de fetchBookings no es un array válido:", response);
            bookings.value = []; // Asignar array vacío si la respuesta no es válida
            error.value = 'Formato de respuesta inesperado del servidor.';
        }

    } catch (err) {
        console.error("Failed to fetch bookings:", err);
        // Mostrar mensaje de error más específico si es posible
        if (err.response && err.response.status === 401) {
            error.value = 'No autorizado. Inicia sesión como administrador.';
        } else if (err.response && err.response.status === 403) {
             error.value = 'Permiso denegado. Necesitas ser administrador.';
        }
         else {
            error.value = 'No se pudieron cargar las reservas.';
        }
         bookings.value = []; // Limpiar reservas en caso de error
    } finally {
        loading.value = false;
    }
};

// Cargar reservas cuando el componente se monta
onMounted(loadBookings);

// Eliminada la función editBooking
// const editBooking = (booking) => { ... };

// Eliminada la función handleFormSubmit
// const handleFormSubmit = async (bookingData) => { ... };

// Adaptada la función confirmDelete para usar la API de reservas
const confirmDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar esta reserva? Esta acción no se puede deshacer.')) {
        error.value = '';
        success.value = '';
        try {
            // Llamada a la API para eliminar la reserva
            await api.deleteBooking(id);
            success.value = 'Reserva eliminada correctamente!';
            await loadBookings(); // Refrescar la lista de reservas
        } catch (err) {
             console.error("Failed to delete booking:", err.response?.data || err);
             error.value = err.response?.data?.message || 'Error al eliminar la reserva.';
        }
    }
};

</script>

<style scoped>
/* Estilos copiados y adaptados de AdminFlightsView */
.admin-bookings-view { margin-top: 20px; padding: 20px; }
/* .form-container { border: 1px solid #ccc; padding: 20px; margin-top: 20px; margin-bottom: 20px; border-radius: 5px; } */
table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 0.9em;}
th, td { border: 1px solid #ddd; padding: 10px 8px; text-align: left; vertical-align: middle;}
th { background-color: #f2f2f2; font-weight: bold;}
td button { margin-right: 5px; white-space: nowrap; } /* Evita que los botones se partan */
/* .button.is-primary { margin-bottom: 15px; } */
.button.is-warning { background-color: #f39c12; color: white; }
.button.is-danger { background-color: #e74c3c; color: white; }
.loading { text-align: center; padding: 20px; font-style: italic; color: #666; }
td small { display: block; font-size: 0.85em; color: #777; margin-top: 2px;}

/* Estilos para el estado */
.status-confirmed {
    color: green;
    font-weight: bold;
}
.status-pending {
    color: orange;
    font-weight: bold;
}
.status-canceled {
    color: red;
    font-weight: bold;
    text-decoration: line-through;
}

</style>