<template>
    <div class="my-bookings-view">
      <h2>Mis Reservas</h2>
      <AlertMessage v-if="error" type="error" :message="error" />
      <AlertMessage v-if="success" type="success" :message="success" />

      <div v-if="loading" class="loading">Cargando tus reservas...</div>

      <div v-else-if="bookings.length > 0" class="booking-list-container">
        <div v-for="booking in bookings" :key="booking.id" class="booking-details-card">

          <!-- Imagen de Cabecera (del Vuelo) -->
          <div class="flight-image-wrapper" v-if="booking.flightOffering?.flight?.image_url">
            <img :src="booking.flightOffering.flight.image_url" :alt="'Imagen del vuelo ' + (booking.flightOffering?.flight?.flight_number || '')" class="flight-image-details">
          </div>
          <div class="flight-image-placeholder" v-else>
             <span>✈️</span>
          </div>

          <!-- Encabezado de la Reserva -->
          <div class="details-header">
             <span class="booking-code-header">Reserva: {{ booking.booking_code }}</span>
             <span :class="`status status-${booking.status?.toLowerCase()}`">{{ formatBookingStatus(booking.status) }}</span>
          </div>

          <!-- Cuerpo con Información -->
          <div class="details-body">
            <h3>Información del Vuelo</h3>
            <div class="info-grid">
              <div class="info-item">
                <span class="info-label">Vuelo</span>
                <span class="info-value">{{ booking.flightOffering?.flight?.flight_number || 'N/A' }}</span>
              </div>
               <div class="info-item">
                <span class="info-label">Ruta</span>
                <span class="info-value">{{ booking.flightOffering?.flight?.origin || 'N/A' }} → {{ booking.flightOffering?.flight?.destination || 'N/A' }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Salida</span>
                <span class="info-value">{{ formatDate(booking.flightOffering?.flight?.departure_time) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Llegada</span>
                <span class="info-value">{{ formatDate(booking.flightOffering?.flight?.arrival_time) }}</span>
              </div>
              <!-- Añadir la clase reservada -->
              <div class="info-item">
                <span class="info-label">Clase Reservada</span>
                <span class="info-value">{{ booking.flightOffering?.flightClass?.name || 'N/A' }}</span>
              </div>
            </div>

            <h3 class="section-divider">Detalles de la Reserva</h3>
            <div class="info-grid">
               <div class="info-item">
                <span class="info-label">Asiento</span>
                <span class="info-value">{{ booking.seat }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Pasajero</span>
                <span class="info-value">{{ booking.passenger_name }} {{ booking.passenger_last_name }}</span>
              </div>
               <div class="info-item">
                <span class="info-label">Precio Pagado</span>
                <span class="info-value price">u$s {{ parseFloat(booking.total_price).toFixed(2) }}</span>
              </div>
              <div class="info-item">
                <span class="info-label">Reservado el</span>
                <!-- Usar booking.created_at (o booking.createdAt si el backend lo envía así después de los cambios de underscored) -->
                <span class="info-value">{{ formatDate(booking.created_at || booking.createdAt, { year: 'numeric', month: 'long', day: 'numeric' }) }}</span>
              </div>
            </div>
          </div>

          <div class="details-actions">
             <button
                v-if="booking.status?.toLowerCase() !== 'canceled' && booking.status?.toLowerCase() !== 'cancelado'"
                @click="confirmCancelBooking(booking.id)"
                class="button action-button is-danger">
                Cancelar Reserva
             </button>
             <span v-else class="status-canceled-text">Reserva Cancelada</span>
          </div>

        </div>
      </div>

      <p v-else class="no-bookings">No tienes ninguna reserva activa o pasada.</p>
    </div>
</template>

<!-- El script setup y los estilos no cambian -->
  <script setup>
  // --- El script setup NO cambia ---
  import { ref, onMounted } from 'vue';
  import * as api from '@/services/api';
  import AlertMessage from '@/components/AlertMessage.vue';
  import { formatDate, formatBookingStatus } from '@/utils/formatters';
  
  const bookings = ref([]);
  const loading = ref(true);
  const error = ref('');
  const success = ref('');
  
  const loadMyBookings = async () => {
      loading.value = true;
      error.value = '';
      success.value = '';
      try {
          const response = await api.fetchMyBookings();
          if (response && response.data && Array.isArray(response.data)) {
             bookings.value = response.data;
          } else {
             console.warn("Respuesta no válida de fetchMyBookings:", response);
             bookings.value = [];
             error.value = 'Formato de respuesta inesperado.';
          }
      } catch (err) {
          console.error("Error al recuperar mis reservas:", err);
           if (err.response && err.response.status === 401) {
               error.value = 'Por favor, inicia sesión.';
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
      if (window.confirm('¿Estás seguro de que quieres cancelar esta reserva?')) {
          error.value = '';
          success.value = '';
          try {
              await api.deleteBooking(id);
              success.value = 'Reserva cancelada correctamente.';
              await loadMyBookings();
          } catch (err) {
               console.error("Error al cancelar reserva:", err.response?.data || err);
               if (err.response && err.response.status === 403) {
                   error.value = 'No tienes permiso.';
               } else {
                   error.value = err.response?.data?.message || 'Error al cancelar.';
               }
          }
      }
  };
  </script>
  
  <!-- *** REEMPLAZA COMPLETAMENTE LA SECCIÓN <style scoped> *** -->
  <style scoped>
  /* Contenedor principal de la vista */
  .my-bookings-view {
    max-width: 1000px; /* Ancho máximo general, ajusta si es necesario */
    margin: 30px auto;
    padding: 0 15px; /* Padding lateral */
  }
  h2 { /* Título "Mis Reservas" */
      text-align: center;
      margin-bottom: 30px;
      color: #333;
      font-weight: 600;
  }
  .loading, .no-bookings {
      text-align: center;
      padding: 50px;
      font-style: italic;
      color: #666;
  }
  
  /* Contenedor de la lista de tarjetas */
  .booking-list-container {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); /* Columnas responsivas */
      gap: 25px; /* Espacio entre tarjetas */
  }
  
  /* Estilos para cada tarjeta de reserva individual (similar a FlightDetailsView) */
  .booking-details-card {
    background-color: #fff;
    border: 1px solid #e1e1e1;
    border-radius: 10px;
    box-shadow: 0 5px 15px rgba(0,0,0,0.07);
    overflow: hidden;
    margin-bottom: 5px; /* Pequeño margen inferior adicional */
  }
  
  /* Imagen */
  .flight-image-wrapper {
    width: 100%;
    height: 200px; /* Altura consistente para la imagen */
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
      height: 200px;
      display: flex; align-items: center; justify-content: center;
      background-color: #f0f0f0; font-size: 3em; color: #ccc;
  }
  
  /* Encabezado de la Reserva */
  .details-header {
    padding: 15px 20px; /* Padding ajustado */
    border-bottom: 1px solid #eee;
    background-color: #f9f9f9;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .booking-code-header {
    font-size: 1.1em;
    font-weight: 600;
    color: #444;
  }
  /* Estilos de Status (ya existentes) */
  .status { font-weight: bold; padding: 4px 9px; border-radius: 5px; font-size: 0.8em; }
  .status-confirmed { background-color: #d4edda; color: #155724; border: 1px solid #c3e6cb;}
  .status-pending { background-color: #fff3cd; color: #856404; border: 1px solid #ffeeba;}
  .status-canceled { background-color: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; text-decoration: line-through;}
  
  /* Cuerpo con Información */
  .details-body {
    padding: 20px; /* Padding interno */
  }
  .details-body h3 { /* "Información del Vuelo", "Detalles de la Reserva" */
    font-size: 1.15em;
    color: #555;
    margin-top: 0;
    margin-bottom: 15px;
    padding-bottom: 8px;
    border-bottom: 1px solid #eaeaea;
  }
  .details-body h3.section-divider {
      margin-top: 25px; /* Espacio antes de la segunda sección */
  }
  
  /* Grid para la información */
  .info-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); /* Columnas responsivas */
    gap: 15px 20px;
  }
  .info-item { display: flex; flex-direction: column; }
  .info-label { font-size: 0.8em; color: #888; margin-bottom: 3px; text-transform: uppercase; }
  .info-value { font-size: 1em; color: #2c3e50; font-weight: 500; }
  .info-value.price { font-weight: bold; color: #27ae60; }
  
  /* Acciones */
  .details-actions {
    padding: 15px 20px;
    border-top: 1px solid #eee;
    background-color: #f9f9f9;
    text-align: right; /* Botón a la derecha */
  }
  .action-button { /* Estilo base para botones de acción */
    padding: 8px 18px; border: none; border-radius: 5px; cursor: pointer;
    text-decoration: none; font-size: 0.9em; font-weight: 500;
    transition: background-color 0.2s ease, transform 0.1s ease;
  }
  .action-button:hover { opacity: 0.9; transform: translateY(-1px); }
  .button.is-danger { background-color: #e74c3c; color: white; }
  .status-canceled-text { font-style: italic; color: #721c24; font-size: 0.9em; }
  
  </style>