<template>
    <form @submit.prevent="submitForm" class="flight-form">
        <div class="form-grid">
            <div class="form-group">
                <label for="flight_number">Número de vuelo:</label>
                <input type="text" id="flight_number" v-model="formData.flight_number" required>
            </div>
            <div class="form-group">
                <label for="origin_airport_id">Aeropuerto de Origen:</label>
                <select id="origin_airport_id" v-model="formData.origin_airport_id" required>
                    <option value="" disabled>Seleccionar Aeropuerto de Origen</option>
                    <option v-for="airport in originAirports" :key="airport.id" :value="airport.id">
                        {{ airport.name }} ({{ airport.iata_code }}) - {{ airport.city?.name || 'Ciudad Desconocida' }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label for="destination_airport_id">Aeropuerto de Destino:</label>
                <select id="destination_airport_id" v-model="formData.destination_airport_id" required>
                    <option value="" disabled>Seleccionar Aeropuerto de Destino</option>
                    <option v-for="airport in destinationAirports" :key="airport.id" :value="airport.id">
                        {{ airport.name }} ({{ airport.iata_code }}) - {{ airport.city?.name || 'Ciudad Desconocida' }}
                    </option>
                </select>
            </div>
            <div class="form-group">
                <label for="departure_time">Hora de partida:</label>
                <input type="datetime-local" id="departure_time" v-model="formData.departure_time" required>
            </div>
            <div class="form-group">
                <label for="arrival_time">Hora de llegada:</label>
                <input type="datetime-local" id="arrival_time" v-model="formData.arrival_time" required>
            </div>
            <div class="form-group full-width">
                <label for="image_url">URL de la Imagen (Opcional):</label>
                <input type="url" id="image_url" v-model="formData.image_url"
                       placeholder="https://ejemplo.com/imagen.jpg">
            </div>
        </div>
        <div class="form-actions">
            <button type="submit" class="button is-primary">{{ isEditing ? 'Actualizar Vuelo' : 'Crear Vuelo' }}</button>
            <button type="button" @click="handleCancel" class="button is-light">Cancelar</button>
        </div>
    </form>
</template>

<script setup>
import { ref, watch, computed, defineProps, defineEmits, onMounted } from 'vue';
import * as api from '@/services/api';

const props = defineProps({
    initialData: {
        type: Object,
        default: () => ({
            flight_number: '',
            origin_airport_id: '',
            destination_airport_id: '',
            departure_time: '',
            arrival_time: '',
            image_url: ''
        })
    }
});

const emit = defineEmits(['submit', 'cancel']);

// Ahora formData se define como ref, y se asignan propiedades individualmente
const formData = ref({
    id: undefined, // Para indicar si es edición (si existe)
    flight_number: '',
    origin_airport_id: '',
    destination_airport_id: '',
    departure_time: '',
    arrival_time: '',
    image_url: ''
});

const originAirports = ref([]);
const destinationAirports = ref([]);

const isEditing = computed(() => !!formData.value.id);

const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } catch(e) {
        console.error("Error formatting date for input:", isoString, e);
        return '';
    }
};

const loadAirports = async () => {
    try {
        const response = await api.fetchAirports();
        if (response && response.data) {
            originAirports.value = response.data;
            destinationAirports.value = response.data; // Usar la misma lista por ahora
        } else {
            console.warn("Error al cargar aeropuertos:", response);
            error.value = "Error al cargar la lista de aeropuertos.";
        }
    } catch (error) {
        console.error("Error al cargar aeropuertos:", error);
        error.value = "No se pudieron cargar los aeropuertos.";
    }
};

onMounted(loadAirports);

// Watch para actualizar formData CUANDO initialData cambie (para edición)
// Es CRUCIAL que formData y sus propiedades existan ANTES del watch
watch(() => props.initialData, (newData) => {
    // Actualiza explícitamente cada propiedad de formData
    formData.value.id = newData.id || undefined;
    formData.value.flight_number = newData.flight_number || '';
    formData.value.origin_airport_id = newData.origin_airport_id || '';
    formData.value.destination_airport_id = newData.destination_airport_id || '';
    formData.value.departure_time = formatDateTimeLocal(newData.departure_time);
    formData.value.arrival_time = formatDateTimeLocal(newData.arrival_time);
    formData.value.image_url = newData.image_url || '';
}, { deep: true, immediate: true });


const submitForm = () => {
     const dataToSend = {
          ...formData.value,
           // Convertir datetime-local strings back to ISO format or let backend handle it
           // The backend expects ISO 8601 format with timezone (like the database stores)
            departure_time: new Date(formData.value.departure_time).toISOString(),
            arrival_time: new Date(formData.value.arrival_time).toISOString(),
         };
        //Quitar validacion y enviarselo al backend, el debe decir si falta
        /*// Validaciones básicas (ejemplo, puedes añadir más)
        if (!dataToSend.flight_number || !dataToSend.origin || !dataToSend.destination ||
         !dataToSend.departure_time || !dataToSend.arrival_time) {
         // Podrías emitir un evento de error o manejarlo internamente
         alert('Por favor, completa todos los campos obligatorios del vuelo.');
         return;
        }
       if (new Date(dataToSend.departure_time) >= new Date(dataToSend.value.arrival_time)) {
          alert('La hora de llegada debe ser posterior a la hora de partida.');
          return;
         }*/
        emit('submit', dataToSend);
    };

const handleCancel = () => {
    emit('cancel');
};
</script>

<style scoped>
.flight-form { margin-top: 15px; }
.form-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 15px;
    margin-bottom: 15px;
}
.form-group { display: flex; flex-direction: column; }
.form-group label { margin-bottom: 5px; font-weight: bold; font-size: 0.9em; color: #333; }
.form-group input, .form-group select {
  padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95em; }
.form-group.full-width { grid-column: 1 / -1; }

/* Estilos para select */
select {
   appearance: none; /* Eliminar estilos por defecto */
   background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E"); /* Icono de flecha */
   background-repeat: no-repeat;
   background-position: right 0.75rem top 50%;
   background-size: 1em;
   padding-right: 2.5rem;
}

.form-actions {
    margin-top: 25px;
    display: flex;
    justify-content: flex-end;
    gap: 10px;
}
.form-actions button {
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  /* margin-right ya no es necesario debido a gap */
}
button[type="submit"] { background-color: #2ecc71; color: white; }
button.is-light { background-color: #ecf0f1; color: #333; border: 1px solid #ddd; }
button.is-light:hover { background-color: #e0e0e0; }

</style>