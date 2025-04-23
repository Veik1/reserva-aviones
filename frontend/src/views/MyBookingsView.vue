<template>
    <div class="my-bookings-view">
      <h2>Mis Reservas</h2>
      <AlertMessage v-if="error" type="error" :message="error" />
      <AlertMessage v-if="success" type="success" :message="success" />
  
      <div v-if="loading" class="loading">Cargando tus reservas...</div>
      <div v-else-if="bookings.length > 0">
        <div class="booking-list">
          <div v-for="booking in bookings" :key="booking.id" class="booking-card">
            <div class="card-header">
                <span class="booking-code">Código: {{ booking.booking_code }}</span>
                <span :class="`status status-${booking.status?.toLowerCase()}`">{{ booking.status }}</span>
            </div>
            <div class="card-body">
                <p><strong>Vuelo:</strong> {{ booking.flight?.flight_number || 'N/A' }}</p>
                <p><strong>Ruta:</strong> {{ booking.flight?.origin || 'N/A' }} → {{ booking.flight?.destination || 'N/A' }}</p>
                <p><strong>Salida:</strong> {{ formatDate(booking.flight?.departure_time) }}</p>
                <p><strong>Llegada:</strong> {{ formatDate(booking.flight?.arrival_time) }}</p>
                <p><strong>Asiento:</strong> {{ booking.seat }}</p>
                <p><strong>Pasajero:</strong> {{ booking.passenger_name }} {{ booking.passenger_last_name }}</p>
                <p><strong>Precio Pagado:</strong> ${{ parseFloat(booking.total_price).toFixed(2) }}</p>
                <p><strong>Reservado el:</strong> {{ formatDate(booking.createdAt, { year: 'numeric', month: 'long', day: 'numeric' }) }}</p>
            </div>
            <div class="card-actions">
               <!-- Mostrar botón solo si la reserva NO está cancelada -->
               <button
                  v-if="booking.status?.toLowerCase() !== 'canceled'"
                  @click="confirmCancelBooking(booking.id)"
                  class="button is-small is-danger">
                  Cancelar Reserva
               </button>
               <span v-else class="status-canceled-text">Reserva Cancelada</span>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="no-bookings">No tienes ninguna reserva activa o pasada.</p>
    </div>
</template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import * as api from '@/services/api';
  import AlertMessage from '@/components/AlertMessage.vue';
  import { formatDate } from '@/utils/formatters';
  
  const bookings = ref([]);
  const loading = ref(true);
  const error = ref('');
  const success = ref('');
  
  const loadMyBookings = async () => {
      loading.value = true;
      error.value = '';
      success.value = ''; // Clear success messages on reload
      try {
          const response = await api.fetchMyBookings(); // Usa la nueva función API
          if (response && response.data && Array.isArray(response.data)) {
             bookings.value = response.data;
          } else {
             console.warn("La respuesta de fetchMyBookings no es un array válido:", response);
             bookings.value = [];
             error.value = 'Formato de respuesta inesperado.';
          }
      } catch (err) {
          console.error("No se pudieron recuperar mis reservas:", err);
           if (err.response && err.response.status === 401) {
               error.value = 'Por favor, inicia sesión para ver tus reservas.';
           } else {
               error.value = 'No se pudieron cargar tus reservas.';
           }
           bookings.value = [];
      } finally {
          loading.value = false;
      }
  };
  
  onMounted(loadMyBookings);
  
  const confirmCancelBooking = async (id) => {
      // Opcional: Añadir una verificación más específica (ej. ¿Seguro que quieres cancelar la reserva XYZ?)
      if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
          error.value = '';
          success.value = '';
          try {
              // Llama a deleteBooking (que ahora debería permitir al dueño borrarla)
              await api.deleteBooking(id);
              success.value = 'Reserva cancelada correctamente.';
              // Recarga la lista para reflejar el cambio (o actualiza el estado localmente)
              await loadMyBookings();
          } catch (err) {
               console.error("No se pudo cancelar la reserva:", err.response?.data || err);
               if (err.response && err.response.status === 403) {
                   error.value = 'No tienes permiso para cancelar esta reserva.';
               } else {
                   error.value = err.response?.data?.message || 'Error al cancelar la reserva.';
               }
          }
      }
  };
  </script>
  
  <style scoped>
  .my-bookings-view {
    max-width: 900px;
    margin: 30px auto;
    padding: 20px;
  }
  h2 {
      text-align: center;
      margin-bottom: 25px;
      color: #333;
  }
  .loading, .no-bookings {
      text-align: center;
      padding: 40px;
      font-style: italic;
      color: #666;
  }
  .booking-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
      gap: 25px; /* Aumenta un poco el espacio entre tarjetas */
  }
  .booking-card {
      border: 1px solid #ddd;
      border-radius: 8px;
      background-color: #fff;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      overflow: hidden; /* Para contener bordes internos */
      display: flex; /* Usa flexbox para la estructura interna de la tarjeta */
      flex-direction: column; /* Apila header, body, actions verticalmente */
  }
  .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      background-color: #f7f7f7;
      padding: 10px 15px;
      border-bottom: 1px solid #eee;
  }
  .booking-code {
      font-weight: bold;
      font-size: 0.95em;
      color: #555;
  }
  .status {
      font-weight: bold;
      padding: 3px 8px;
      border-radius: 4px;
      font-size: 0.85em;
      text-transform: capitalize;
  }
  .status-confirmed { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;}
  .status-pending { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;}
  .status-canceled { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; text-decoration: line-through;}
  
  .card-body {
      padding: 15px;
      font-size: 0.95em;
      flex-grow: 1; /* Permite que esta sección crezca */
  }
  .card-body p {
      margin: 0 0 8px 0;
      color: #444;
  }
   .card-body p:last-child {
      margin-bottom: 0;
  }
  .card-body strong {
      color: #111;
      min-width: 110px;
      display: inline-block;
  }
  .card-actions {
      padding: 10px 15px;
      text-align: right;
      border-top: 1px solid #eee;
      background-color: #fdfdfd;
  }
  .button.is-danger { background-color: #e74c3c; color: white; border: none;}
  .button.is-danger:hover { background-color: #c0392b; }
  .status-canceled-text {
       font-style: italic;
       color: #721c24;
       font-size: 0.9em;
  }
  
</style>