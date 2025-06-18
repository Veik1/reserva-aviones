<template>
  <div class="create-booking-view">
    <h2 v-if="selectedOffering">
        Reservar Clase {{ selectedOffering.flightClass?.name }} en Vuelo {{ selectedOffering.flight?.flight_number }}
    </h2>
    <h2 v-else-if="flight">Reservar Vuelo {{ flight?.flight_number }} (Seleccione una clase)</h2>
    <h2 v-else>Reservar Vuelo</h2>

    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="successMessage" type="success" :message="successMessage" />

    <div v-if="loadingFlight || loadingOffering || loadingBooking" class="loading-message">
      <div>Cargando detalles o procesando...</div>
    </div>

    <div v-else-if="selectedOffering && flight">
      <div class="selected-offering-details">
        <!-- Mostrar origen/destino del vuelo usando los nuevos campos -->
        <p><strong>Vuelo:</strong> {{ flight.flight_number }} ({{ 
        flight.originAirport?.city?.name || flight.originAirport?.name || 'N/A' }} → 
        {{ flight.destinationAirport?.city?.name || flight.destinationAirport?.name 
        || 'N/A' }})</p>
        <p><strong>Clase Seleccionada:</strong> {{ selectedOffering.flightClass?.name }}</p>
        <p><strong>Precio por asiento:</strong>
          <span class="price-value">u$s {{ parseFloat(selectedOffering.price).toFixed(2) }}</span>
        </p>
        <!-- Asientos disponibles (se actualizará después de la reserva si reloadOffering funciona) -->
        <p v-if="selectedOffering.seats_available > 0"><strong>Asientos Disponibles en esta clase:</strong> {{ selectedOffering.seats_available }}</p>
        <p v-else class="no-seats-text">No hay asientos disponibles en esta clase.</p>
      </div>

      <!-- Formulario para crear reserva (visible si no hay éxito) -->
      <form @submit.prevent="handleBooking" v-if="!successMessage && selectedOffering.seats_available > 0">
        <BookingForm
          :bookingData="bookingData"
          @update:bookingData="handleBookingDataUpdate"
          @update:paymentValidity="handlePaymentValidityUpdate"
          :flightPrice="parseFloat(selectedOffering.price)"
        />
        <button type="submit" :disabled="loadingBooking || selectedOffering.seats_available <= 0">
          {{ loadingBooking ? 'Procesando...' : 'Confirmar Reserva' }}
        </button>
      </form>

      <!-- Botones de acción después de reserva exitosa -->
      <div v-if="successMessage" class="success-actions">
          <router-link :to="{ name: 'my-bookings' }" class="button is-info">Ver Mis Reservas</router-link>
          <router-link :to="{ name: 'flights-list' }" class="button is-light">Volver a Vuelos</router-link>
      </div>
    </div>

    <!-- Mensajes de error/no encontrado -->
    <div v-else-if="!flight">
      <p>No se pudieron cargar los detalles del vuelo.</p>
    </div>
    <div v-else-if="!selectedOffering && !loadingOffering">
      <p>No se pudo cargar la oferta seleccionada o no se especificó una. <router-link :to="{ name: 'flight-details', params: { id: flightId } }">Vuelve a los detalles del vuelo</router-link> para seleccionar una clase.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, reactive } from 'vue'; // <--- ¡AÑADIR reactive 
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { fetchFlightById, createBooking } from '@/services/api';
import BookingForm from '@/components/BookingForm.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const flightId = route.params.flightId;
const offeringIdFromQuery = route.query.offeringId;

const flight = ref(null);
const selectedOffering = ref(null);

const loadingFlight = ref(true);
const loadingOffering = ref(false);
const loadingBooking = ref(false);
const error = ref('');
const successMessage = ref('');

const isPaymentValid = ref(false); // Nuevo estado para la validez del pago

const bookingData = reactive({
  flight_offering_id: offeringIdFromQuery || null,
  user_id: authStore.currentUser?.id,
  seat_ids: [], // <--- ¡Inicializar como ARRAY!
  passenger_name: '',
  passenger_last_name: '',
  passenger_email: '',
  passengers_details: [], // <--- Nuevo array para detalles de pasajeros adicionales
  booking_code: '',
  total_price: 0,
  status: 'confirmed'
});

const prefillPassengerData = () => {
  if (authStore.isAuthenticated && authStore.currentUser) {
    const currentUser = authStore.currentUser;

    const nameParts = currentUser.name ? currentUser.name.split(' ') : [];
    bookingData.passenger_name = nameParts[0] || '';
    bookingData.passenger_last_name = nameParts.slice(1).join(' ') || '';
    bookingData.passenger_email = currentUser.email || '';
  }
};

const handleBookingDataUpdate = (newValue) => {
  // Asegúrate de que seat_ids se asigne correctamente, si newValue.seat_ids es un array
  bookingData.seat_ids = newValue.seat_ids || []; // Asignar el array o vacío
  bookingData.total_price = newValue.total_price;
  bookingData.booking_code = newValue.booking_code;
  bookingData.passenger_name = newValue.passenger_name;
  bookingData.passenger_last_name = newValue.passenger_last_name;
  bookingData.passenger_email = newValue.passenger_email;
};

// --- FUNCIÓN PARA RECARGAR LA OFERTA Y VER EL DESCUENTO ---
const reloadOffering = async () => {
    loadingOffering.value = true; // Activar loading
    try {
        // La forma más sencilla es recargar el vuelo completo y volver a encontrar la oferta
        const response = await fetchFlightById(flightId);
        if (response.data && response.data.offerings) {
            selectedOffering.value = response.data.offerings.find(off => off.id === offeringIdFromQuery);
        }
    } catch (err) {
        console.error("Error al recargar oferta después de reserva:", err);
        // Podrías establecer un mensaje de error si la recarga falla
    } finally {
        loadingOffering.value = false; // Desactivar loading
    }
};

onMounted(async () => {
  loadingFlight.value = true;
  error.value = '';

  if (!flightId) { error.value = "ID de vuelo no proporcionado."; loadingFlight.value = false; return; }
  if (!offeringIdFromQuery) { error.value = "ID de oferta de clase no proporcionado. Por favor, selecciona una clase desde los detalles del vuelo."; loadingFlight.value = false; return; }
  if (!authStore.isAuthenticated || !bookingData.user_id) { error.value = "Debes estar conectado para reservar."; loadingFlight.value = false; return; }

  try {
    const response = await fetchFlightById(flightId);
    flight.value = response.data;

    if (flight.value && flight.value.offerings) {
      const foundOffering = flight.value.offerings.find(off => off.id === offeringIdFromQuery);
      if (foundOffering) {
        selectedOffering.value = foundOffering;
        bookingData.total_price = parseFloat(foundOffering.price);
        bookingData.flight_offering_id = foundOffering.id;
        const flightNumberPart = flight.value.flight_number?.replace(/\s+/g, '') || 'FL';
        const userPart = bookingData.user_id.substring(0, 4);
        const timePart = Date.now().toString().slice(-5);
        bookingData.booking_code = `BK-${userPart}-${flightNumberPart}-${timePart}`.toUpperCase();

        prefillPassengerData();
      } else { error.value = 'La clase seleccionada no está disponible para este vuelo.'; }
    } else { error.value = 'No se encontraron ofertas para este vuelo.'; }
  } catch (err) { console.error("Error al obtener detalles del vuelo/oferta:", err); error.value = 'No se pudieron cargar los detalles para la reserva.'; flight.value = null; selectedOffering.value = null; }
  finally { loadingFlight.value = false; }
});

watch(() => authStore.currentUser, (newUser) => {
  if (newUser && selectedOffering.value) {
    bookingData.user_id = newUser.id;
    prefillPassengerData();
  }
}, { immediate: false });

const handlePaymentValidityUpdate = (isValid) => {
    isPaymentValid.value = isValid;
};

const handleBooking = async () => {
  error.value = ''; 
  successMessage.value = ''; 
  loadingBooking.value = true;

  console.log('Datos de reserva ANTES de validar:', JSON.parse(JSON.stringify(bookingData))); // <-- Este log será clave

  // --- CAMBIO CLAVE AQUÍ: VALIDACIÓN AHORA USA bookingData.seat_ids (el array) ---
  if (!bookingData.flight_offering_id || !bookingData.seat_ids || bookingData.seat_ids.length === 0) {
      error.value = "Por favor, rellene todos los campos obligatorios del pasajero y seleccione al menos un asiento.";
      loadingBooking.value = false;
      return;
  }
  // --- FIN CAMBIO ---

  if (!isPaymentValid.value) {
        error.value = "Por favor, corrija los errores en los datos de pago.";
        loadingBooking.value = false;
        return;
    }
  // --- FIN CAMBIO ---

  const dataToSend = {
    flight_offering_id: bookingData.flight_offering_id,
    user_id: bookingData.user_id,
    seat_ids: bookingData.seat_ids,
    passenger_name: bookingData.passenger_name,
    passenger_last_name: bookingData.passenger_last_name,
    passenger_email: bookingData.passenger_email,
    booking_code: bookingData.booking_code,
  };
  
  console.log('Enviando reserva con datos:', JSON.parse(JSON.stringify(dataToSend)));
  try {
    const response = await createBooking(dataToSend);
    const newBooking = response.data; // Guardar la respuesta

    let seatNumbers = 'N/A';
    if (newBooking.seats && newBooking.seats.length > 0) {
        seatNumbers = newBooking.seats.map(s => s.seat_number).join(', ');
    }
    successMessage.value = `¡Reserva exitosa! Código: ${newBooking.booking_code}. ` +
                           `Asiento(s): ${seatNumbers}. ` +
                           `Precio Total: u$s ${parseFloat(newBooking.total_price).toFixed(2)}.`;
    // --- ACCIONES POST-ÉXITO (AHORA CON LA FUNCIÓN reloadOffering) ---
    await reloadOffering(); // Recargar la oferta para ver el descuento de asiento
    /*setTimeout(() => {
        router.push({ name: 'my-bookings' }); // Redirigir a mis reservas
    }, 3000); // Redirigir después de 3 segundos
    // --- FIN ACCIONES POST-ÉXITO ---*/
  } catch (err) {
    console.error("Reserva fallida:", err.response?.data || err.message);
    error.value = err.response?.data?.error || 'Error en la reserva. Por favor, inténtelo de nuevo.';
  } finally { loadingBooking.value = false; }
};
</script>

<style scoped>
.create-booking-view { max-width: 700px; margin: 30px auto; padding: 25px; background-color: #fff; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
h2 { text-align: center; margin-bottom: 25px; color: #333; }
.selected-offering-details { margin-bottom: 25px; padding: 15px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 5px; }
.selected-offering-details p { margin: 8px 0; font-size: 1em; }
.selected-offering-details strong { color: #555; }
.price-value { font-weight: bold; color: #27ae60; }
.no-seats-text { color: #e74c3c; font-weight: bold; }
button { margin-top: 20px; padding: 12px 20px; width: 100%; font-size: 1.05em; }
/* Estilos para los botones de acción después del éxito */
.success-actions {
    margin-top: 25px;
    display: flex;
    justify-content: center; /* Centrar los botones */
    gap: 15px; /* Espacio entre botones */
}
.success-actions .button {
    width: auto; /* Ancho automático para no estirarse */
    padding: 10px 20px; /* Tamaño adecuado */
    font-size: 1em;
}
.button.is-info { background-color: #3498db; color: white; }
.button.is-light { background-color: #ecf0f1; color: #333; }
</style>