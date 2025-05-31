<template>
  <div class="admin-bookings-view">
    <h2>Administrar Reservas</h2>
    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="success" type="success" :message="success" />

    <!-- Filtros de búsqueda -->
    <div class="admin-filters">
      <select v-model="searchField">
        <option value="booking_code">Código</option>
        <option value="flight_number">Vuelo</option>
        <option value="flight_class">Clase</option>
        <option value="user">Usuario</option>
        <option value="passenger_email">Email Pasajero</option>
      </select>
      <input v-model="searchTerm" placeholder="Buscar..." />
      <button @click="resetFilters" type="button">Limpiar</button>
    </div>

    <div v-if="loading" class="loading">Cargando reservas...</div>
    <table v-else-if="filteredBookings.length > 0">
      <thead>
        <tr>
          <th>Código</th>
          <th>Vuelo (Num)</th>
          <th>Clase</th>
          <th>Usuario</th>
          <th>Pasajero</th>
          <th>Asiento</th>
          <th>Precio</th>
          <th>Estado</th>
          <th>Reservado el</th>
          <th>Acciones</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="booking in filteredBookings" :key="booking.id">
          <td>{{ booking.booking_code }}</td>
          <td>{{ booking.flightOffering?.flight?.flight_number || 'N/A' }}</td>
          <td>{{ booking.flightOffering?.flightClass?.name || 'N/A' }}</td>
          <td>{{ booking.user?.name || booking.user?.email || 'N/A' }}</td>
          <td>
            {{ booking.passenger_name }} {{ booking.passenger_last_name }}
            <small v-if="booking.passenger_email">({{ booking.passenger_email }})</small>
          </td>
          <td>{{ booking.seat }}</td>
          <td>${{ parseFloat(booking.total_price).toFixed(2) }}</td>
          <td>
            <select v-if="editingStatusFor === booking.id" v-model="newStatus" @change="saveStatusChange(booking)"
              @blur="cancelStatusEdit()" class="status-select">
              <option value="confirmed">Confirmado</option>
              <option value="pending">Pendiente</option>
              <option value="canceled">Cancelado</option>
            </select>
            <span v-else @click="startStatusEdit(booking)"
              :class="`status-display status-${booking.status?.toLowerCase()}`" title="Clic para editar estado">
              {{ formatBookingStatus(booking.status) }}
            </span>
          </td>
          <td>{{ formatDate(booking.created_at || booking.createdAt) }}</td>
          <td>
            <button @click="confirmDelete(booking.id)" class="button is-small is-danger">Eliminar</button>
          </td>
        </tr>
      </tbody>
    </table>
    <p v-else>No se encontraron reservas.</p>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import * as api from '@/services/api';
import AlertMessage from '@/components/AlertMessage.vue';
import { formatDate, formatBookingStatus } from '@/utils/formatters';

const bookings = ref([]);
const loading = ref(true);
const error = ref('');
const success = ref('');

const searchField = ref('booking_code');
const searchTerm = ref('');

const editingStatusFor = ref(null);
const newStatus = ref('');

const loadBookings = async () => {
  loading.value = true; error.value = ''; success.value = '';
  try {
    const response = await api.fetchBookings();
    if (response && response.data && Array.isArray(response.data)) {
      bookings.value = response.data;
    } else {
      bookings.value = []; error.value = 'Formato de respuesta inesperado.';
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudieron cargar las reservas.';
    bookings.value = [];
  } finally {
    loading.value = false;
  }
};

onMounted(loadBookings);

const filteredBookings = computed(() => {
  if (!searchTerm.value) return bookings.value;
  const term = searchTerm.value.toLowerCase();
  return bookings.value.filter(b => {
    switch (searchField.value) {
      case 'booking_code':
        return b.booking_code?.toLowerCase().includes(term);
      case 'flight_number':
        return b.flightOffering?.flight?.flight_number?.toLowerCase().includes(term);
      case 'flight_class':
        return b.flightOffering?.flightClass?.name?.toLowerCase().includes(term);
      case 'user':
        return (
          b.user?.name?.toLowerCase().includes(term) ||
          b.user?.email?.toLowerCase().includes(term)
        );
      case 'passenger_email':
        return b.passenger_email?.toLowerCase().includes(term);
      default:
        return true;
    }
  });
});

function resetFilters() {
  searchTerm.value = '';
}

const startStatusEdit = (booking) => {
  editingStatusFor.value = booking.id;
  newStatus.value = booking.status;
};

const cancelStatusEdit = () => {
  editingStatusFor.value = null;
};

const saveStatusChange = async (booking) => {
  if (!newStatus.value || newStatus.value === booking.status) {
    cancelStatusEdit();
    return;
  }
  loading.value = true;
  try {
    await api.updateBooking(booking.id, { status: newStatus.value });
    success.value = `Estado de la reserva ${booking.booking_code} actualizado.`;
    const index = bookings.value.findIndex(b => b.id === booking.id);
    if (index !== -1) {
      bookings.value[index].status = newStatus.value;
    }
  } catch (err) {
    error.value = err.response?.data?.error || 'No se pudo actualizar el estado.';
  } finally {
    cancelStatusEdit();
    loading.value = false;
  }
};

const confirmDelete = async (id) => {
  if (window.confirm('¿Seguro que quieres eliminar esta reserva?')) {
    try {
      await api.deleteBooking(id);
      success.value = 'Reserva eliminada correctamente!';
      await loadBookings();
    } catch (err) {
      error.value = err.response?.data?.message || 'Error al eliminar la reserva.';
    }
  }
};
</script>

<style scoped>
.admin-bookings-view {
  margin-top: 20px;
  padding: 20px;
}

.admin-filters {
  display: flex;
  gap: 10px;
  margin-bottom: 18px;
}

.admin-filters select,
.admin-filters input {
  padding: 7px 10px;
  border-radius: 4px;
  border: 1px solid #ccc;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  font-size: 0.9em;
}

th,
td {
  border: 1px solid #ddd;
  padding: 10px 8px;
  text-align: left;
  vertical-align: middle;
}

th {
  background-color: #f2f2f2;
  font-weight: bold;
}

td button {
  margin-right: 5px;
  white-space: nowrap;
}

.button.is-warning {
  background-color: #f39c12;
  color: white;
}

.button.is-danger {
  background-color: #e74c3c;
  color: white;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
  color: #666;
}

td small {
  display: block;
  font-size: 0.85em;
  color: #777;
  margin-top: 2px;
}

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

.status-display {
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 4px;
}

.status-display:hover {
  background-color: #f0f0f0;
}

.status-select {
  padding: 4px;
  border-radius: 4px;
  border: 1px solid #ccc;
  min-width: 120px;
}
</style>