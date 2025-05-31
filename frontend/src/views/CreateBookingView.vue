<template>
  <div class="create-booking-view">
    <h2 v-if="selectedOffering">
      Reservar Clase {{ selectedOffering.flightClass?.name }} en Vuelo {{ flight?.flight_number }}
    </h2>
    <h2 v-else-if="flight">Reservar Vuelo {{ flight?.flight_number }} (Seleccione una clase)</h2>
    <h2 v-else>Reservar Vuelo</h2>

    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="successMessage" type="success" :message="successMessage" />

    <div v-if="loadingFlight || loadingOffering">Cargando detalles...</div>

    <div v-else-if="selectedOffering && flight" class="selected-offering-details">
      <p>
        <strong>Vuelo:</strong>
        {{ flight.flight_number }}
        ({{ flight.originAirport?.city?.name }} → {{ flight.destinationAirport?.city?.name }})
      </p>
      <p><strong>Clase Seleccionada:</strong> {{ selectedOffering.flightClass?.name }}</p>
      <p><strong>Precio por asiento:</strong>
        <span class="price-value">u$s {{ parseFloat(selectedOffering.price).toFixed(2) }}</span>
      </p>
      <p v-if="selectedOffering.seats_available > 0">
        <strong>Asientos Disponibles en esta clase:</strong> {{ selectedOffering.seats_available }}
      </p>
      <p v-else class="no-seats-text">No hay asientos disponibles en esta clase.</p>

      <!-- Paso 1: Formulario de pasajero -->
      <form v-if="!showPayment && !successMessage && selectedOffering.seats_available > 0"
        @submit.prevent="goToPayment">
        <BookingForm :bookingData="bookingData" @update:bookingData="handleBookingDataUpdate"
          :flightPrice="parseFloat(selectedOffering.price)" />
        <button type="submit" :disabled="loadingBooking || selectedOffering.seats_available <= 0">
          {{ loadingBooking ? 'Procesando...' : 'Ir a Pago' }}
        </button>
      </form>

      <!-- Paso 2: Formulario de pago -->
      <PaymentForm v-if="showPayment && !successMessage" @payment-success="handlePaymentSuccess" />
    </div>

    <div v-else-if="!flight">
      <p>No se pudieron cargar los detalles del vuelo.</p>
    </div>
    <div v-else-if="!selectedOffering && !loadingOffering">
      <p>No se pudo cargar la oferta seleccionada o no se especificó una.
        <router-link :to="{ name: 'flight-details', params: { id: flightId } }">
          Vuelve a los detalles del vuelo
        </router-link>
        para seleccionar una clase.
      </p>
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
import PaymentForm from '@/components/PaymentForm.vue';

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
const showPayment = ref(false);

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

const handleBookingDataUpdate = (newValue) => {
  Object.assign(bookingData, newValue);
};

onMounted(async () => {
  loadingFlight.value = true;
  error.value = '';

  if (!flightId) {
    error.value = "ID de vuelo no proporcionado.";
    loadingFlight.value = false;
    return;
  }
  if (!offeringIdFromQuery) {
    error.value = "ID de oferta de clase no proporcionado. Por favor, selecciona una clase desde los detalles del vuelo.";
    loadingFlight.value = false;
    return;
  }
  if (!authStore.isAuthenticated || !bookingData.user_id) {
    error.value = "Debes estar conectado para reservar.";
    loadingFlight.value = false;
    return;
  }

  // Autocompletar datos del pasajero
  if (authStore.currentUser) {
    const nameParts = authStore.currentUser.name.split(' ');
    bookingData.passenger_name = nameParts[0] || '';
    bookingData.passenger_last_name = nameParts.slice(1).join(' ') || '';
    bookingData.passenger_email = authStore.currentUser.email || '';
  }

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
      } else {
        error.value = 'La clase seleccionada no está disponible para este vuelo.';
      }
    } else {
      error.value = 'No se encontraron ofertas para este vuelo.';
    }
  } catch {
    error.value = 'No se pudieron cargar los detalles para la reserva.';
    flight.value = null;
    selectedOffering.value = null;
  } finally {
    loadingFlight.value = false;
  }
});

// Paso 1: Ir a pago
function goToPayment() {
  error.value = '';
  if (!bookingData.seat || !bookingData.passenger_name || !bookingData.passenger_last_name || !bookingData.passenger_email || !bookingData.booking_code) {
    error.value = "Por favor, rellene todos los campos obligatorios del pasajero y asiento.";
    return;
  }
  showPayment.value = true;
}

// Paso 2: Recibe datos de pago y reserva
async function handlePaymentSuccess(paymentData) {
  error.value = '';
  successMessage.value = '';
  loadingBooking.value = true;

  const dataToSend = {
    flight_offering_id: bookingData.flight_offering_id,
    user_id: bookingData.user_id,
    seat: bookingData.seat,
    passenger_name: bookingData.passenger_name,
    passenger_last_name: bookingData.passenger_last_name,
    passenger_email: bookingData.passenger_email,
    booking_code: bookingData.booking_code,
    ...paymentData // Aquí se incluyen card_number, expiry, cvv
  };

  try {
    const response = await createBooking(dataToSend);
    successMessage.value = `¡Reserva exitosa! Su código de reserva es ${response.data.booking_code}. Serás redirigido...`;
    if (selectedOffering.value && selectedOffering.value.seats_available > 0) {
      selectedOffering.value.seats_available--;
    }
    setTimeout(() => {
      router.push({ name: 'my-bookings' });
    }, 3000);
  } catch (err) {
    error.value = err.response?.data?.error || 'Error en la reserva. Por favor, inténtelo de nuevo.';
  } finally {
    loadingBooking.value = false;
  }
}
</script>

<style scoped>
.create-booking-view {
  max-width: 700px;
  margin: 30px auto;
  padding: 25px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h2 {
  text-align: center;
  margin-bottom: 25px;
  color: #333;
}

.selected-offering-details {
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f9f9f9;
  border: 1px solid #eee;
  border-radius: 5px;
}

.selected-offering-details p {
  margin: 8px 0;
  font-size: 1em;
}

.selected-offering-details strong {
  color: #555;
}

.price-value {
  font-weight: bold;
  color: #27ae60;
}

.no-seats-text {
  color: #e74c3c;
  font-weight: bold;
}

button {
  margin-top: 20px;
  padding: 12px 20px;
  width: 100%;
  font-size: 1.05em;
}
</style>