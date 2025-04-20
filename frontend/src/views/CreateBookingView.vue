<template>
<div class="create-booking-view">
    <h2>Reservar vuelo: {{ flight?.flight_number }}</h2>
    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="successMessage" type="success" :message="successMessage" />

    <div v-if="loadingFlight">Cargando detalles del vuelo...</div>
    <div v-else-if="flight">
      <p><strong>De:</strong> {{ flight.origin }} a <strong>{{ flight.destination }}</strong></p>
      <p><strong>Precio por asiento:</strong> ${{ parseFloat(flight.price).toFixed(2) }}</p>

      <form @submit.prevent="handleBooking" v-if="!successMessage">
        <BookingForm
          :bookingData="bookingData"
          @update:bookingData="handleBookingDataUpdate"
          :flightPrice="parseFloat(flight.price)"
      />
        <button type="submit" :disabled="loadingBooking">
          {{ loadingBooking ? 'Procesando...' : 'Confirmar Reserva' }}
        </button>
      </form>
    </div>
    <div v-else>
      <p>No se pudieron cargar los detalles del vuelo.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
import { fetchFlightById, createBooking } from '@/services/api';
import BookingForm from '@/components/BookingForm.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const flightId = route.params.flightId;
const flight = ref(null);
const loadingFlight = ref(true);
const loadingBooking = ref(false);
const error = ref('');
const successMessage = ref('');

const bookingData = reactive({
  flight_id: flightId,
  user_id: authStore.currentUser?.id, // Set from logged-in user
  seat: '',
  passenger_name: '',
  passenger_last_name: '',
  passenger_email: '',
  booking_code: '', // Consider auto-generating or letting user input
  total_price: 0, // Will be set by form/flight price
  status: 'Confirmado' // Default or set based on payment flow
});

// ---> AÑADE ESTA FUNCIÓN <---
const handleBookingDataUpdate = (newValue) => {
  console.log('[CreateBookingView] Recibido evento update:bookingData con:', JSON.parse(JSON.stringify(newValue)));
  // Actualiza el objeto reactivo propiedad por propiedad O reemplázalo
  // Opción A: Reemplazo completo (si newValue es siempre el objeto completo)
  // Object.assign(bookingData, newValue); // Copia las propiedades de newValue a bookingData

  // Opción B: Actualización propiedad por propiedad (más granular)
  // Esto es más seguro si newValue no siempre tuviera todas las keys
   for (const key in newValue) {
       if (Object.hasOwnProperty.call(newValue, key) && Object.hasOwnProperty.call(bookingData, key)) {
          bookingData[key] = newValue[key];
       }
   }
   // Asegúrate que total_price se mantenga correcto si no viene en newValue (aunque debería)
   if (flight.value) {
     bookingData.total_price = parseFloat(flight.value.price);
   }


  console.log('[CreateBookingView] bookingData DESPUÉS de actualizar:', JSON.parse(JSON.stringify(bookingData)));
};

onMounted(async () => {
  if (!flightId) {
      error.value = "No se proporcionó identificación del vuelo.";
      loadingFlight.value = false;
      return;
  }
  if (!authStore.isAuthenticated || !bookingData.user_id) {
      error.value = "Debes estar conectado para reservar.";
      loadingFlight.value = false;
       // Optionally redirect
       // router.push({ name: 'login', query: { redirect: route.fullPath }});
      return;
  }
  try {
    const response = await fetchFlightById(flightId);
    flight.value = response.data;
    bookingData.total_price = parseFloat(flight.value.price); // Set initial price
    // Simple booking code suggestion
    bookingData.booking_code = `BK-${authStore.currentUser.id.substring(0,4)}-${flightId.substring(0,4)}-${Date.now().toString().slice(-4)}`;
  } catch (err) {
    console.error("No se pudieron obtener los detalles del vuelo:", err);
    error.value = 'No se pudieron cargar los detalles del vuelo.';
    flight.value = null;
  } finally {
    loadingFlight.value = false;
  }
});

const handleBooking = async () => {
  error.value = '';
  successMessage.value = '';
  loadingBooking.value = true;

  console.log('Datos de reserva ANTES de validar:', JSON.parse(JSON.stringify(bookingData)));
  
  // Basic validation
  if (!bookingData.seat || !bookingData.passenger_name || !bookingData.passenger_last_name || !bookingData.passenger_email || !bookingData.booking_code) {
      error.value = "Por favor, rellene todos los campos obligatorios.";
      loadingBooking.value = false;
      return;
  }

  // Si la validación pasa, continúa...
  console.log('Datos de reserva DESPUÉS de validar (listos para enviar):', JSON.parse(JSON.stringify(bookingData)));

  try {
    const response = await createBooking(bookingData);
    successMessage.value = `¡Reserva exitosa! Su código de reserva es ${response.data.booking_code}.`;
    // Optionally clear form or redirect
    // setTimeout(() => router.push('/flights'), 3000); // Redirect after 3s
  } catch (err) {
    console.error("Reserva fallida:", err.response?.data || err.message);
    error.value = err.response?.data?.error || 'Error en la reserva. Por favor, inténtelo de nuevo.';
  } finally {
    loadingBooking.value = false;
  }
};
</script>

<style scoped>
/* Add styles */
.create-booking-view { max-width: 600px; margin: 20px auto; }
button { margin-top: 15px; }
</style>
    