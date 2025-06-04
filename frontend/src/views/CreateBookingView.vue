<template>
  <div class="create-booking-view">
    <h2 v-if="selectedOffering">
        Reservar Clase {{ selectedOffering.flightClass?.name }} en Vuelo {{ selectedOffering.flight?.flight_number }}
    </h2>
    <h2 v-else-if="flight">Reservar Vuelo {{ flight?.flight_number }} (Seleccione una clase)</h2>
    <h2 v-else>Reservar Vuelo</h2>

    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="successMessage" type="success" :message="successMessage" />

    <div v-if="loadingFlight || loadingOffering">Cargando detalles...</div>

    <div v-else-if="selectedOffering && flight" class="selected-offering-details">
      <p><strong>Vuelo:</strong> {{ flight.flight_number }} ({{ flight.originAirport?.city?.name || flight.origin }} → {{ flight.destinationAirport?.city?.name || flight.destination }})</p>
      <p><strong>Clase Seleccionada:</strong> {{ selectedOffering.flightClass?.name }}</p>
      <p><strong>Precio por asiento:</strong>
        <span class="price-value">u$s {{ parseFloat(selectedOffering.price).toFixed(2) }}</span>
      </p>
      <p v-if="selectedOffering.seats_available > 0"><strong>Asientos Disponibles en esta clase:</strong> {{ selectedOffering.seats_available }}</p>
      <p v-else class="no-seats-text">No hay asientos disponibles en esta clase.</p>

      <form @submit.prevent="handleBooking" v-if="!successMessage && selectedOffering.seats_available > 0">
        <BookingForm
          :bookingData="bookingData"
          @update:bookingData="handleBookingDataUpdate"
          :flightPrice="parseFloat(selectedOffering.price)"
        />
        <button type="submit" :disabled="loadingBooking || selectedOffering.seats_available <= 0">
          {{ loadingBooking ? 'Procesando...' : 'Confirmar Reserva' }}
        </button>
      </form>
    </div>
    <div v-else-if="!flight">
      <p>No se pudieron cargar los detalles del vuelo.</p>
    </div>
     <div v-else-if="!selectedOffering && !loadingOffering">
      <p>No se pudo cargar la oferta seleccionada o no se especificó una. <router-link :to="{ name: 'flight-details', params: { id: flightId } }">Vuelve a los detalles del vuelo</router-link> para seleccionar una clase.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue';
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
const loadingOffering = ref(false); // No se usa activamente si fetchFlightById trae todo
const loadingBooking = ref(false);
const error = ref('');
const successMessage = ref('');

const bookingData = reactive({
  flight_offering_id: offeringIdFromQuery || null,
  user_id: authStore.currentUser?.id,
  seat: '',
  passenger_name: '',
  passenger_last_name: '',
  passenger_email: '',
  booking_code: '',
  total_price: 0,
  status: 'confirmed'
});

// --- FUNCIÓN PARA AUTOCOMPLETAR DATOS DEL PASAJERO ---
const prefillPassengerData = () => {
  if (authStore.isAuthenticated && authStore.currentUser) {
    const currentUser = authStore.currentUser;
    // Dividir el nombre completo en nombre y apellido (simple split)
    // Esto asume que el primer token es el nombre y el resto es apellido.
    // Podrías necesitar una lógica más robusta si los nombres son complejos.
    const nameParts = currentUser.name ? currentUser.name.split(' ') : [];
    bookingData.passenger_name = nameParts[0] || '';
    bookingData.passenger_last_name = nameParts.slice(1).join(' ') || '';
    bookingData.passenger_email = currentUser.email || '';
  }
};

const handleBookingDataUpdate = (newValue) => {
  Object.assign(bookingData, newValue);
};

onMounted(async () => {
  loadingFlight.value = true;
  error.value = '';

  if (!flightId) { /* ... (manejo de error flightId) ... */ return; }
  if (!offeringIdFromQuery) { /* ... (manejo de error offeringIdFromQuery) ... */ return; }
  if (!authStore.isAuthenticated || !bookingData.user_id) { /* ... (manejo de error autenticación) ... */ return; }

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

        // --- LLAMAR A AUTOCOMPLETAR DESPUÉS DE CARGAR DATOS ---
        prefillPassengerData();

      } else { /* ... (manejo de error oferta no encontrada) ... */ }
    } else { /* ... (manejo de error no ofertas) ... */ }
  } catch (err) { /* ... (manejo de error general) ... */ }
  finally { loadingFlight.value = false; }
});

// Watch para autocompletar si el usuario cambia después de que el componente se montó
// (ej. si el login se resuelve después de que esta vista se cargó inicialmente)
watch(() => authStore.currentUser, (newUser) => {
  if (newUser && selectedOffering.value) { // Solo si ya tenemos una oferta cargada
    bookingData.user_id = newUser.id; // Actualizar user_id en bookingData
    prefillPassengerData();
  }
}, { immediate: false }); // No ejecutar inmediatamente, solo en cambios


const handleBooking = async () => {
  // ... (lógica de handleBooking existente sin cambios) ...
  error.value = ''; successMessage.value = ''; loadingBooking.value = true;
  if (!bookingData.flight_offering_id) { error.value = "Error: Identificador de oferta faltante."; loadingBooking.value = false; return; }
  if (!bookingData.seat || !bookingData.passenger_name || !bookingData.passenger_last_name || !bookingData.passenger_email || !bookingData.booking_code) {
      error.value = "Por favor, rellene todos los campos obligatorios del pasajero y asiento."; loadingBooking.value = false; return;
  }
  const dataToSend = {
    flight_offering_id: bookingData.flight_offering_id, user_id: bookingData.user_id,
    seat: bookingData.seat, passenger_name: bookingData.passenger_name,
    passenger_last_name: bookingData.passenger_last_name, passenger_email: bookingData.passenger_email,
    booking_code: bookingData.booking_code,
  };
  console.log('Enviando reserva con datos:', JSON.parse(JSON.stringify(dataToSend)));
  try {
    const response = await createBooking(dataToSend);
    successMessage.value = `¡Reserva exitosa! Su código de reserva es ${response.data.booking_code}.`;
    // Opcional: Redirigir
    // setTimeout(() => {
    //   router.push({ name: 'my-bookings' });
    // }, 3000);
  } catch (err) {
    console.error("Reserva fallida:", err.response?.data || err.message);
    error.value = err.response?.data?.error || 'Error en la reserva.';
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
/* ... (otros estilos que puedas tener) ... */
</style>