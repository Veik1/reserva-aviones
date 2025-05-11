<template>
<div class="create-booking-view">
    <!-- Título dinámico: Muestra info de la oferta o del vuelo si la oferta no está cargada -->
    <h2 v-if="selectedOffering">
        Reservar Clase {{ selectedOffering.flightClass?.name }} en Vuelo {{ selectedOffering.flight?.flight_number }}
    </h2>
    <h2 v-else-if="flight">Reservar Vuelo {{ flight?.flight_number }} (Seleccione una clase)</h2>
    <h2 v-else>Reservar Vuelo</h2>

    <AlertMessage v-if="error" type="error" :message="error" />
    <AlertMessage v-if="successMessage" type="success" :message="successMessage" />

    <!-- Mostrar un mensaje de carga más general o específico para la oferta -->
    <div v-if="loadingFlight || loadingOffering">Cargando detalles...</div>

    <!-- Mostrar información de la oferta seleccionada -->
    <div v-else-if="selectedOffering && flight" class="selected-offering-details">
      <p><strong>Vuelo:</strong> {{ flight.flight_number }} ({{ flight.origin }} → {{ flight.destination }})</p>
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
        /> <!-- Usar precio de la oferta -->
        <button type="submit" :disabled="loadingBooking || selectedOffering.seats_available <= 0">
          {{ loadingBooking ? 'Procesando...' : 'Confirmar Reserva' }}
        </button>
      </form>
    </div>

    <!-- Mensaje si no se pudo cargar el vuelo o la oferta -->
    <div v-else-if="!flight">
      <p>No se pudieron cargar los detalles del vuelo.</p>
    </div>
     <div v-else-if="!selectedOffering && !loadingOffering">
      <p>No se pudo cargar la oferta seleccionada o no se especificó una. <router-link :to="{ name: 'flight-details', params: { id: flightId } }">Vuelve a los detalles del vuelo</router-link> para seleccionar una clase.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'; // Añadir watch
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/store/auth';
// Necesitaremos una función para obtener una oferta específica si no la pasamos completa
// O asumimos que ya tenemos los datos necesarios si 'flight' incluye 'offerings'.
// Por ahora, fetchFlightById debería traer las offerings anidadas.
import { fetchFlightById, createBooking } from '@/services/api';
import BookingForm from '@/components/BookingForm.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const flightId = route.params.flightId; // ID del Vuelo general
const offeringIdFromQuery = route.query.offeringId; // ID de la Oferta específica

const flight = ref(null); // Detalles del vuelo general
const selectedOffering = ref(null); // Detalles de la oferta de clase seleccionada

const loadingFlight = ref(true);
const loadingOffering = ref(false); // Para cargar la oferta si es necesario
const loadingBooking = ref(false);
const error = ref('');
const successMessage = ref('');

// bookingData ahora usará flight_offering_id
const bookingData = reactive({
  flight_offering_id: offeringIdFromQuery || null, // Tomar de la query
  user_id: authStore.currentUser?.id,
  seat: '',
  passenger_name: '',
  passenger_last_name: '',
  passenger_email: '',
  booking_code: '',
  total_price: 0,
  status: 'confirmed' // El backend debería usar 'confirmed' (sin tilde)
});

const handleBookingDataUpdate = (newValue) => {
  // console.log('[CreateBookingView] update:bookingData:', newValue);
  Object.assign(bookingData, newValue);
  // El precio ya se actualiza en BookingForm basado en flightPrice
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
    loadingFlight.value = false; // Podríamos no necesitar cargar el vuelo si no hay oferta
    return;
  }
  if (!authStore.isAuthenticated || !bookingData.user_id) {
    error.value = "Debes estar conectado para reservar.";
    loadingFlight.value = false;
    return;
  }

  try {
    const response = await fetchFlightById(flightId); // Esto ya debería traer las offerings
    flight.value = response.data;

    if (flight.value && flight.value.offerings) {
      // Encontrar la oferta seleccionada dentro de las ofertas del vuelo
      const foundOffering = flight.value.offerings.find(off => off.id === offeringIdFromQuery);
      if (foundOffering) {
        selectedOffering.value = foundOffering;
        bookingData.total_price = parseFloat(foundOffering.price);
        bookingData.flight_offering_id = foundOffering.id; // Confirmar ID de la oferta
        // Sugerir código de reserva
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
  } catch (err) {
    console.error("Error al obtener detalles del vuelo/oferta:", err);
    error.value = 'No se pudieron cargar los detalles para la reserva.';
    flight.value = null;
    selectedOffering.value = null;
  } finally {
    loadingFlight.value = false;
  }
});


const handleBooking = async () => {
  error.value = '';
  successMessage.value = '';
  loadingBooking.value = true;

  // Reafirmar que tenemos el offeringId en bookingData
  if (!bookingData.flight_offering_id) {
      error.value = "Error: Falta el identificador de la oferta de clase.";
      loadingBooking.value = false;
      return;
  }
  // La validación de campos del formulario es la misma
  if (!bookingData.seat || !bookingData.passenger_name || !bookingData.passenger_last_name || !bookingData.passenger_email || !bookingData.booking_code) {
      error.value = "Por favor, rellene todos los campos obligatorios del pasajero y asiento.";
      loadingBooking.value = false;
      return;
  }

  // Crear el objeto a enviar, asegurándonos de que flight_id no se envíe si no es necesario por el backend
  const dataToSend = {
    flight_offering_id: bookingData.flight_offering_id,
    user_id: bookingData.user_id,
    seat: bookingData.seat,
    passenger_name: bookingData.passenger_name,
    passenger_last_name: bookingData.passenger_last_name,
    passenger_email: bookingData.passenger_email,
    booking_code: bookingData.booking_code,
    // total_price y status son gestionados por el backend a partir del offering y lógica interna
  };
  // El backend tomará el precio del offering y el status por defecto será 'confirmed'

  console.log('Enviando reserva con datos:', JSON.parse(JSON.stringify(dataToSend)));

  try {
    const response = await createBooking(dataToSend); // Enviar dataToSend
    successMessage.value = `¡Reserva exitosa! Su código de reserva es ${response.data.booking_code}.`;
    // Opcional: deshabilitar formulario, etc.
  } catch (err) {
    console.error("Reserva fallida:", err.response?.data || err.message);
    error.value = err.response?.data?.error || 'Error en la reserva. Por favor, inténtelo de nuevo.';
  } finally {
    loadingBooking.value = false;
  }
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