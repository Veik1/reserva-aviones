<template>
    <div class="booking-form">
        <div class="form-group">
            <label for="booking_code">Código de reserva (sugerido):</label>
            <!-- Cambiado localBookingData por props.bookingData -->
            <input type="text" id="booking_code" :value="props.bookingData.booking_code" @input="update('booking_code', $event.target.value)" required>
        </div>
        <div class="form-group">
            <label for="seat">Número de asiento (ej. 12A):</label>
             <!-- Cambiado localBookingData por props.bookingData -->
            <input type="text" id="seat" :value="props.bookingData.seat" @input="update('seat', $event.target.value)" required maxlength="4">
        </div>
         <hr>
        <h4>Detalles del pasajero</h4>
         <div class="form-group">
            <label for="passenger_name">Nombre del pasajero:</label>
             <!-- Cambiado localBookingData por props.bookingData -->
            <input type="text" id="passenger_name" :value="props.bookingData.passenger_name" @input="update('passenger_name', $event.target.value)" required>
        </div>
         <div class="form-group">
            <label for="passenger_last_name">Apellido del pasajero:</label>
             <!-- Cambiado localBookingData por props.bookingData -->
            <input type="text" id="passenger_last_name" :value="props.bookingData.passenger_last_name" @input="update('passenger_last_name', $event.target.value)" required>
        </div>
         <div class="form-group">
            <label for="passenger_email">Correo electrónico del pasajero:</label>
             <!-- Cambiado localBookingData por props.bookingData -->
            <input type="email" id="passenger_email" :value="props.bookingData.passenger_email" @input="update('passenger_email', $event.target.value)" required>
        </div>
         <hr>
         <div class="form-group">
             <!-- Esto ya usaba props indirectamente a través de totalPrice, está bien -->
             <p><strong>Precio total:</strong> u$s {{ totalPrice.toFixed(2) }}</p>
         </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'; // Solo necesitamos computed ahora

// Las props siguen siendo las mismas
const props = defineProps({
    bookingData: {
        type: Object,
        required: true
    },
    flightPrice: {
        type: Number,
        required: true
    }
});

// El emit sigue siendo el mismo
const emit = defineEmits(['update:bookingData']);

// El precio total sigue siendo un computed basado en la prop
const totalPrice = computed(() => props.flightPrice);

// NUEVA función update: MÁS DIRECTA
const update = (field, value) => {
    // 1. Crea un nuevo objeto basado en las props actuales
    // 2. Sobrescribe ÚNICAMENTE el campo que cambió
    const updatedData = {
      ...props.bookingData, // Copia todos los valores actuales de la prop
      [field]: value         // Actualiza el campo específico que disparó el evento
    };

    // 3. Asegúrate de que el precio total esté correcto (usa el computed)
    updatedData.total_price = totalPrice.value;

    console.log(`[BookingForm] Emitting update:bookingData for field "${field}" con valor "${value}". Objeto emitido:`, JSON.parse(JSON.stringify(updatedData)));

    // 4. Emite el objeto completo y actualizado
    emit('update:bookingData', updatedData);
};

</script>

<style scoped>
.booking-form .form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; }
input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; box-sizing: border-box; }
hr { margin: 20px 0; border: 0; border-top: 1px solid #eee; }
h4 { margin-bottom: 10px; }
</style>
