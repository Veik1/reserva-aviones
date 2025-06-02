<template>
  <form @submit.prevent="submitForm" class="flight-form">
    <div class="form-grid">
      <div class="form-group">
        <label for="flight_number">Número de vuelo:</label>
        <input type="text" id="flight_number" v-model="formData.flight_number" required>
      </div>
      <div class="form-group">
        <label for="origin">Origen:</label>
        <input type="text" id="origin" v-model="formData.origin" required>
      </div>
      <div class="form-group">
        <label for="destination">Destino:</label>
        <input type="text" id="destination" v-model="formData.destination" required>
      </div>
      <div class="form-group">
        <label for="departure_time">Hora de partida:</label>
        <input type="datetime-local" id="departure_time" v-model="formData.departure_time" required>
      </div>
      <div class="form-group">
        <label for="arrival_time">Hora de llegada:</label>
        <input type="datetime-local" id="arrival_time" v-model="formData.arrival_time" required>
      </div>
      <!-- Campos de asientos_available y price ELIMINADOS -->
      <div class="form-group full-width"> <!-- full-width para que ocupe más si es la única en su "fila" -->
        <label for="image_url">URL de la Imagen (Opcional):</label>
        <input type="url" id="image_url" v-model="formData.image_url"
        placeholder="https://ejemplo.com/imagen.jpg">
      </div>
    </div>
    <div class="form-actions"> <!-- Contenedor para botones -->
        <button type="submit" class="button is-primary">{{ isEditing ? 'Actualizar Vuelo' : 'Crear Vuelo' }}</button>
        <button type="button" @click="handleCancel" class="button is-light">Cancelar</button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from 'vue'; // Eliminado defineProps, defineEmits

const props = defineProps({
    initialData: {
        type: Object,
        default: () => ({
            flight_number: '',
            origin: '',
            destination: '',
            departure_time: '',
            arrival_time: '',
            image_url: '',
            // seats_available y price eliminados del default
        })
    }
});

const emit = defineEmits(['submit', 'cancel']);

// formData ahora solo contiene los campos relevantes para el Vuelo
const formData = ref({
    flight_number: '',
    origin: '',
    destination: '',
    departure_time: '',
    arrival_time: '',
    image_url: '',
    // id se manejará si viene en initialData para edición
});

const isEditing = computed(() => !!props.initialData?.id);

const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16);
    } catch(e) {
        console.error("Error al formatear fecha para input:", isoString, e);
        return '';
    }
};

// Watch para actualizar formData cuando initialData cambie (para edición)
watch(() => props.initialData, (newData) => {
    // Asegúrate de solo copiar las propiedades que existen en el formData definido
    formData.value.id = newData.id || undefined; // Guardar el ID si es edición
    formData.value.flight_number = newData.flight_number || '';
    formData.value.origin = newData.origin || '';
    formData.value.destination = newData.destination || '';
    formData.value.departure_time = formatDateTimeLocal(newData.departure_time);
    formData.value.arrival_time = formatDateTimeLocal(newData.arrival_time);
    formData.value.image_url = newData.image_url || '';
}, { deep: true, immediate: true });


const submitForm = () => {
    // Crear una copia para enviar, incluyendo el id si es edición
    const dataToSend = { ...formData.value };
    if (!isEditing.value) {
        delete dataToSend.id; // No enviar 'id: undefined' en la creación
    }

    // Validaciones básicas (ejemplo, puedes añadir más)
    if (!dataToSend.flight_number || !dataToSend.origin || !dataToSend.destination ||
        !dataToSend.departure_time || !dataToSend.arrival_time) {
        // Podrías emitir un evento de error o manejarlo internamente
        alert('Por favor, completa todos los campos obligatorios del vuelo.');
        return;
    }

    if (new Date(dataToSend.departure_time) >= new Date(dataToSend.arrival_time)) {
        alert('La hora de llegada debe ser posterior a la hora de partida.');
        return;
    }

    emit('submit', dataToSend);
};

const handleCancel = () => { // Renombrado para claridad
    emit('cancel');
};
</script>

<style scoped>
.flight-form { margin-top: 15px; }
.form-grid {
    display: grid;
    /* Ajusta las columnas si es necesario, ahora hay menos campos */
    grid-template-columns: repeat(auto-fit, minmax(230px, 1fr));
    gap: 18px; /* Un poco más de espacio */
    margin-bottom: 20px;
}
.form-group { display: flex; flex-direction: column; }
.form-group.full-width {
  grid-column: 1 / -1; /* Hace que ocupe todas las columnas */
}
label { margin-bottom: 6px; font-weight: 500; font-size:0.9em; color: #333; }
input {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95em;
}
input[type="datetime-local"] {
  color: #333; /* Asegurar visibilidad del texto */
}

.form-actions { /* Nuevo contenedor para botones */
    margin-top: 25px;
    display: flex;
    justify-content: flex-end; /* Alinea botones a la derecha */
    gap: 10px; /* Espacio entre botones */
}
.form-actions button {
  padding: 10px 20px;
  cursor: pointer;
  border: none;
  border-radius: 5px;
  font-weight: 500;
  /* margin-right ya no es necesario debido a gap */
}
button.is-primary { background-color: #2ecc71; color: white; }
button.is-primary:hover { background-color: #27ae60; }
button.is-light { background-color: #f0f0f0; color: #333; border: 1px solid #ddd; }
button.is-light:hover { background-color: #e0e0e0; }
</style>