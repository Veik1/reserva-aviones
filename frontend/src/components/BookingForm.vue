<template>
    <div class="booking-form">
        <div class="form-group">
            <label for="booking_code">Código de reserva (sugerido):</label>
            <!-- Cambiado localBookingData por props.bookingData -->
            <input type="text" id="booking_code" :value="props.bookingData.booking_code" @input="updateParentData ('booking_code', $event.target.value)" required>
        </div>
        <!-- SELECCIÓN DE ASIENTO (con lista de asientos cargados) -->
        <div class="form-group seat-selection-group">
          <label>Selecciona tus asientos:</label>
          <div class="seat-grid-container">
            <div class="seat-grid">
              <button
                  v-for="seat in availableSeats"
                  :key="seat.id"
                  :class="['seat-button', { 'selected': selectedSeats.includes(seat.id), 'occupied': !seat.is_available }]"
                  @click.prevent="toggleSeatSelection(seat)"
                  :disabled="!seat.is_available"
              >
                {{ seat.seat_number }}
              </button>
            </div>
          </div>
          <div v-if="!availableSeats.length && !loadingSeats" class="no-seats-message">
            No hay asientos disponibles para esta clase.
          </div>
          <div v-if="loadingSeats" class="loading-seats">Cargando asientos...</div>
          <div v-if="selectedSeats.length > 0" class="selected-seats-info">
            Asientos seleccionados: {{ getSelectedSeatNumbers().join(', ') }} ({{ selectedSeats.length }} asiento<span v-if="selectedSeats.length !== 1">s</span>)
          </div>
        </div>
         <hr>
        <h4>Detalles del pasajero principal</h4>
         <div class="form-group">
            <label for="passenger_name">Nombre del pasajero:</label>
             <!-- Cambiado localBookingData por props.bookingData -->
            <input type="text" id="passenger_name" :value="props.bookingData.passenger_name" @input="updateParentData ('passenger_name', $event.target.value)" required>
        </div>
         <div class="form-group">
            <label for="passenger_last_name">Apellido del pasajero:</label>
             <!-- Cambiado localBookingData por props.bookingData -->
            <input type="text" id="passenger_last_name" :value="props.bookingData.passenger_last_name" @input="updateParentData ('passenger_last_name', $event.target.value)" required>
        </div>
         <div class="form-group">
            <label for="passenger_email">Correo electrónico del pasajero:</label>
             <!-- Cambiado localBookingData por props.bookingData -->
            <input type="email" id="passenger_email" :value="props.bookingData.passenger_email" @input="updateParentData ('passenger_email', $event.target.value)" required>
        </div>
        <!-- *** NUEVA SECCIÓN PARA PASAJEROS ADICIONALES *** -->
        <div v-if="selectedSeats.length > 1"> <!-- Mostrar solo si se seleccionó más de 1 asiento -->
            <hr>
            <h4>Detalles de pasajeros adicionales ({{ selectedSeats.length - 1 }})</h4>
            <div v-for="(seatId, index) in selectedSeats.slice(1)" :key="seatId" class="additional-passenger-group">
                <h5>Pasajero {{ index + 1 }} (Asiento {{ getSeatNumberById(seatId) }}):</h5>
                <div class="form-group">
                    <label :for="'add_passenger_name_' + seatId">Nombre:</label>
                    <input type="text" :id="'add_passenger_name_' + seatId" v-model="additionalPassengers[seatId].name" required>
                </div>
                 <div class="form-group">
                    <label :for="'add_passenger_last_name_' + seatId">Apellido:</label>
                    <input type="text" :id="'add_passenger_last_name_' + seatId" v-model="additionalPassengers[seatId].lastName" required>
                </div>
                 <div class="form-group">
                    <label :for="'add_passenger_email_' + seatId">Email:</label>
                    <input type="email" :id="'add_passenger_email_' + seatId" v-model="additionalPassengers[seatId].email">
                </div>
            </div>
        </div>
        <!-- *** FIN NUEVA SECCIÓN *** -->
         <hr>
        <h4>Información de Pago</h4>
        <div class="form-group">
        <label for="cardNumber">Número de Tarjeta:</label>
    <input
        type="text"
        id="cardNumber"
        v-model="paymentData.cardNumber"
        @input="formatCardNumberAndValidate"
        placeholder="XXXX - XXXX - XXXX - XXXX"
        maxlength="25"
        autocomplete="cc-number"
    >
    <span v-if="paymentErrors.cardNumber" class="error-message">{{ paymentErrors.cardNumber }}</span>
</div>
        <div class="form-group card-details-group">
            <div class="card-expiry-wrapper">
                <label>Fecha de Vencimiento:</label>
            <div class="expiry-inputs">
                <input
                    type="text"
                    id="cardExpiryMonth"
                    v-model="paymentData.cardExpiryMonth"
                    @input="formatExpiryMonthAndValidate"
                    placeholder="MM"
                    maxlength="2"
                    class="expiry-input-month"
                    autocomplete="cc-exp-month"
                >
                <span>/</span>
                <input
                    type="text"
                    id="cardExpiryYear"
                    v-model="paymentData.cardExpiryYear"
                    @input="formatExpiryYearAndValidate"
                    placeholder="AA"
                    maxlength="2"
                    class="expiry-input-year"
                    autocomplete="cc-exp-year"
                >
            </div>
            <span v-if="paymentErrors.cardExpiry" class="error-message">{{ paymentErrors.cardExpiry }}</span>
        </div>
            <div class="card-cvv-wrapper">
                <label for="cardCvv">CVV:</label>
                <input
                type="text"
                v-model="paymentData.cardCvv"
                placeholder="XXX"
                maxlength="3"
                @input="paymentData.cardCvv = paymentData.cardCvv.replace(/\D/g, '')"
                />
                <span v-if="paymentErrors.cardCvv" class="error-message">{{ paymentErrors.cardCvv }}</span>
            </div>
        </div>
        <div class="form-group">
            <p><strong>Precio total:</strong> u$s {{ totalPrice.toFixed(2) }}</p>
        </div>
    </div>
</template>

<script setup>
import { computed, onMounted, ref, watch, reactive } from 'vue';
import * as api from '@/services/api';

const props = defineProps({
    bookingData: { type: Object, required: true },
    flightPrice: { type: Number, required: true }
});

const emit = defineEmits(['update:bookingData', 'update:paymentValidity']);

const availableSeats = ref([]);
const loadingSeats = ref(true);
const selectedSeats = ref([]); // Almacena los IDs de los asientos

const totalPrice = computed(() => props.flightPrice * selectedSeats.value.length);

const paymentData = reactive({
    cardNumber: '',
    cardExpiryMonth: '', // Nuevo
    cardExpiryYear: '',  // Nuevo
    cardCvv: ''
});

const paymentErrors = reactive({
    cardNumber: '',
    cardExpiry: '', // Se mantiene para el error general de fecha
    cardCvv: ''
});

const additionalPassengers = reactive({}); // Objeto donde la clave es el seatId y el valor es {name, lastName, email}

// Helper para obtener número de asiento dado un ID (para la etiqueta)
const getSeatNumberById = (seatId) => {
    const seat = availableSeats.value.find(s => s.id === seatId);
    return seat ? seat.seat_number : 'N/A';
};

// Modificar toggleSeatSelection para manejar el estado de additionalPassengers
const toggleSeatSelection = (seat) => {
    if (!seat.is_available) return; // No se puede seleccionar si no está disponible

    const index = selectedSeats.value.indexOf(seat.id);
    if (index > -1) {
        // Si el asiento YA ESTABA seleccionado, deseleccionarlo (eliminarlo del array)
        selectedSeats.value.splice(index, 1);
        // Si se deselecciona un asiento, eliminar sus datos de pasajero adicional
        if (additionalPassengers[seat.id]) {
            delete additionalPassengers[seat.id];
        }
    } else {
        // Si el asiento NO ESTABA seleccionado, seleccionarlo (añadir al array)
        selectedSeats.value.push(seat.id); // <--- ¡CAMBIO CLAVE: AÑADIR!
        // Si se selecciona un asiento, inicializar sus datos de pasajero adicional
        if (!additionalPassengers[seat.id]) {
            additionalPassengers[seat.id] = { name: '', lastName: '', email: '' };
        }
    }
    updateParentData(); // Emitir el estado completo después de cambiar la selección
};


// Modificar updateParentData para incluir los detalles de pasajeros adicionales
const updateParentData = (field, value) => {
    const updatedData = { ...props.bookingData };
    if (field) {
        updatedData[field] = value;
    }

    updatedData.seat_ids = selectedSeats.value;
    updatedData.total_price = totalPrice.value;

    // --- INCLUIR DATOS DE PASAJEROS ADICIONALES ---
    // Crear un array de detalles solo para los asientos que NO son el primero seleccionado
    // Si el primer asiento es para el 'pasajero principal'
    const principalSeatId = selectedSeats.value[0];
    const passengersDetailsArray = selectedSeats.value
        .filter(seatId => seatId !== principalSeatId && additionalPassengers[seatId]) // Solo asientos adicionales con datos
        .map(seatId => ({ // Formato esperado por el backend (si lo guardara)
            seat_id: seatId, // Asociar detalles a este asiento
            name: additionalPassengers[seatId].name,
            lastName: additionalPassengers[seatId].lastName,
            email: additionalPassengers[seatId].email
        }));

    updatedData.passengers_details = passengersDetailsArray; // Añadir al objeto emitido
    // --- FIN INCLUIR DATOS ---

    // Datos de pago (aunque no se guardan en DB, se pueden pasar si es necesario para validación)
    updatedData.payment_data = {
        cardNumber: paymentData.cardNumber,
        cardExpiry: `${paymentData.cardExpiryMonth}/${paymentData.cardExpiryYear}`, // Unir para posible uso
        cardCvv: paymentData.cardCvv
    };


    emit('update:bookingData', updatedData);
    console.log('[BookingForm] Objeto emitido:', JSON.parse(JSON.stringify(updatedData)));

    // No llamar a validatePayment aquí, se llama en el watcher
};

// --- LÓGICA DE VALIDACIÓN DE PAGO COMPLETA ---
const validatePayment = () => {
    paymentErrors.cardNumber = '';
    paymentErrors.cardExpiry = ''; // Error general para la fecha
    paymentErrors.cardCvv = '';
    let isValidOverall = true; // <-- Usar esta para el resultado final

     // Validación de Número de Tarjeta
    const cardNumberClean = paymentData.cardNumber.replace(/[\s-]/g, '');
    if (!cardNumberClean || !/^\d{16}$/.test(cardNumberClean)) { // Asumiendo 16 dígitos exactos
        paymentErrors.cardNumber = 'Número de tarjeta debe tener 16 dígitos.';
        isValidOverall = false;
    }

    // Fecha de Vencimiento
    const month = parseInt(paymentData.cardExpiryMonth, 10);
    const yearLastTwoDigits = parseInt(paymentData.cardExpiryYear, 10);

    if (isNaN(month) || month < 1 || month > 12 || isNaN(yearLastTwoDigits) ||
        paymentData.cardExpiryYear.length !== 2) {
        paymentErrors.cardExpiry = 'Fecha inválida (MM/AA).';
        isValidOverall = false;
    } else {
        const currentYearFull = new Date().getFullYear();
        const currentMonth = new Date().getMonth() + 1;
        const fullYear = 2000 + yearLastTwoDigits;

        if (fullYear < currentYearFull || (fullYear === currentYearFull && month < currentMonth)) {
            paymentErrors.cardExpiry = 'Tarjeta vencida.';
            isValidOverall = false;
        }
    }

    // CVV
    if (!paymentData.cardCvv || !/^\d{3}$/.test(paymentData.cardCvv)) { // Asumiendo 3 dígitos exactos
        paymentErrors.cardCvv = 'CVV inválido (3 dígitos).';
        isValidOverall = false;
    }

    // Validar campos de pasajeros adicionales si existen
    if (selectedSeats.value.length > 1) {
        const principalSeatId = selectedSeats.value[0];
        selectedSeats.value.filter(seatId => seatId !== principalSeatId).forEach(seatId => {
             const passenger = additionalPassengers[seatId];
             // Nombre y apellido obligatorios para adicionales
             if (!passenger || !passenger.name || !passenger.lastName) {
                 isValidOverall = false;
             }
        });
    }

    emit('update:paymentValidity', isValidOverall); // Emitir el resultado FINAL
    return isValidOverall; // <--- ¡ESTE RETURN DEBE ESTAR AQUÍ!
}; // <--- ¡Y LA LLAVE DE CIERRE DE validatePayment AQUÍ!


// --- FUNCIONES DE FORMATO PARA UX ---
const formatCardNumberAndValidate = () => {
    let value = paymentData.cardNumber.replace(/\D/g, '');
    let formattedValue = '';
    value = value.substring(0, 16); // Limitar a 16 dígitos
    for (let i = 0; i < value.length; i += 4) {
        formattedValue += value.substring(i, Math.min(i + 4, value.length));
        if (i + 4 < value.length) {
            formattedValue += ' - ';
        }
    }
     paymentData.cardNumber = formattedValue; // El v-model se actualiza con el formato
    validatePayment(); // Validar después de formatear
};

const formatExpiryMonthAndValidate = () => {
    paymentData.cardExpiryMonth = paymentData.cardExpiryMonth.replace(/\D/g, '').substring(0, 2);
    if (paymentData.cardExpiryMonth.length === 2 && paymentData.cardExpiryYear.length !== 2) {
        document.getElementById('cardExpiryYear')?.focus();
    }
    validatePayment();
};

const formatExpiryYearAndValidate = () => {
    paymentData.cardExpiryYear = paymentData.cardExpiryYear.replace(/\D/g, '').substring(0, 2);
    validatePayment();
};
// --- FIN FUNCIONES DE FORMATO ---

const getSelectedSeatNumbers = () => {
    return selectedSeats.value.map(id => availableSeats.value.find(s => s.id === id)?.seat_number).filter(Boolean);
};

const loadSeats = async () => {
    loadingSeats.value = true;
    try {
        const response = await api.fetchSeatsByOffering(props.bookingData.flight_offering_id);
        if (response && response.data) {
            availableSeats.value = response.data.sort((a,b) => {
                const numA = parseInt(a.seat_number.match(/\d+/)?.[0] || 0);
                const charA = a.seat_number.match(/[A-Z]/i)?.[0] || '';
                const numB = parseInt(b.seat_number.match(/\d+/)?.[0] || 0);
                const charB = b.seat_number.match(/[A-Z]/i)?.[0] || '';
                if (numA !== numB) return numA - numB;
                return charA.localeCompare(charB);
            });
            if (Array.isArray(props.bookingData.seat_ids)) {
                selectedSeats.value = props.bookingData.seat_ids;
            }
        }
    } catch (error) {
        console.error("Error al cargar asientos:", error);
    } finally {
        loadingSeats.value = false;
    }
};

onMounted(() => {
    loadSeats();
    validatePayment(); // Validar al montar para establecer el estado inicial
});

// Watch para validar automáticamente cuando los datos de pago o asientos cambian
watch([
    paymentData, // Si cambia cualquier propiedad dentro de paymentData
    selectedSeats // Si el array de asientos seleccionados cambia
], () => {
    validatePayment(); // Volver a validar todo
    // Si selectedSeats.value.length cambia, también necesitamos actualizar additionalPassengers
    // Esta lógica ya está en toggleSeatSelection, pero si se necesita en otros escenarios, considéralo.
}, { deep: true }); // Observar cambios profundos en paymentData y el array selectedSeats

</script>

<style scoped>

.booking-form .form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; }
input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; box-sizing: border-box; }
hr { margin: 20px 0; border: 0; border-top: 1px solid #eee; }
h4 { margin-bottom: 10px; }

.seat-selection-group {
    margin-top: 20px;
    margin-bottom: 25px;
}
.seat-grid-container { /* Contenedor para el grid de asientos */

    background-color: #1273a0;
    padding: 15px;
    border-radius: 8px;
    max-height: 300px; /* Un poco más de altura */
    overflow-y: auto;
    box-shadow: inset 0 1px 3px rgba(218, 4, 4, 0.1);
}
.seat-grid {
    display: grid;
    /* Ejemplo para 3 asientos - pasillo - 3 asientos */
    grid-template-columns:
        minmax(10px, 1fr) 1px minmax(10px, 1fr)
        minmax(10px, 1fr) 1px minmax(10px, 1fr);
    
    gap: 4px 6px; /* gap vertical y horizontal más pequeño */
    align-items: center; /* Centrar los botones en la celda del grid */
    justify-items: center; /* Centrar los botones en la celda del grid */
}
.seat-button {
    background-color: #e0f2f7; border: 1px solid #a7d9ed; border-radius: 5px;
    font-size: 0.85em; font-weight: bold; cursor: pointer; transition: all 0.2s ease;
    text-align: center; color: #333;
    min-width: 45px; /* Ajustar para que quepan bien */
    height: 35px; /* Ajustar */
    padding: 8px 10px; /* Ajustar padding */
    display: flex; 
    align-items: center; justify-content: center;
}
.seat-button:hover:not(:disabled) {
    background-color: #c9e6f2;
    transform: translateY(-2px);
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
}
.seat-button.selected {
    background-color: #4cb112; /* Verde para seleccionado */
    color: rgb(14, 13, 13);
    border-color: #27ae60;
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
}
.seat-button.occupied {
    background-color: #ff5733; /* Rojo más intenso para ocupado */
    color: rgb(236, 16, 16); /* Texto blanco para mejor contraste */
    border-color: #cc402c;
    cursor: not-allowed;
    text-decoration: none; /* Quitar line-through si no lo quieres */
    opacity: 0.8;
}

.seat-button:disabled {
    background-color: #e0e0e0;
    color: #918989;
    border-color: #bbb;
    cursor: not-allowed;
}

.no-seats-message, .loading-seats {
    text-align: center;
    padding: 15px;
    font-style: italic;
    color: #777;
}
.selected-seats-info {
    margin-top: 15px; padding: 10px; background-color: #e6ffe6; border: 1px solid #a3e9a4;
    border-radius: 5px; font-size: 0.9em; color: #1a7a1a; font-weight: 500;
    text-align: center;
}

/* Estilos para el input de fecha de vencimiento */
.card-expiry-input {
    flex: 1; /* Para que ocupe espacio junto al CVV */
    max-width: 100px; /* Ancho para MM/YY */
}
.card-cvv-input {
    flex: 1;
    max-width: 80px; /* Ancho para CVV */
}

.expiry-inputs {
    display: flex;
    align-items: center;
}
.expiry-inputs input {
    text-align: center;
}
.expiry-input-month {
    width: 60px; /* Ajustar ancho */
}
.expiry-input-year {
    width: 60px; /* Ajustar ancho */
}
.expiry-inputs span { /* Para la barra / */
    margin: 0 5px;
    font-size: 1.2em;
    color: #777;
}
</style>
