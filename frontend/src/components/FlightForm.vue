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
       <div class="form-group">
        <label for="seats_available">Asientos disponibles:</label>
        <input type="number" id="seats_available" v-model.number="formData.seats_available" required min="0">
      </div>
      <div class="form-group">
        <label for="price">Precio ($):</label>
        <input type="number" id="price" v-model.number="formData.price" required min="0" step="0.01">
      </div>
      <div class="form-group full-width">
        <label for="image_url">URL de la Imagen (Opcional):</label>
        <input type="url" id="image_url" v-model="formData.image_url" 
        placeholder="https://ejemplo.com/imagen.jpg">
      </div>
    </div>
    <button type="submit">{{ isEditing ? 'Actualizar vuelo' : 'Crear vuelo' }}</button>
    <button type="button" @click="cancel" v-if="isEditing" class="button is-light">Cancelar Edición</button>
  </form>
</template>

<script setup>
import { ref, watch, defineProps, defineEmits, computed } from 'vue';

const props = defineProps({
    initialData: {
        type: Object,
        default: () => ({
            flight_number: '',
            origin: '',
            destination: '',
            departure_time: '',
            arrival_time: '',
            seats_available: 100,
            price: 0,
            image_url:'',
        })
    }
});

const emit = defineEmits(['submit', 'cancel']);

const formData = ref({ ...props.initialData });
const isEditing = computed(() => !!props.initialData?.id); // Check if initial data has an ID

// Helper to format date for datetime-local input
const formatDateTimeLocal = (isoString) => {
    if (!isoString) return '';
    try {
        const date = new Date(isoString);
        // Adjust for timezone offset before formatting
         date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
        return date.toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
    } catch(e) {
        console.error("Error formatting date for input:", isoString, e);
        return ''; // fallback
    }
};

// Watch for changes in initialData prop to update the form (for editing)
watch(() => props.initialData, (newData) => {
    formData.value = {
        ...newData,
        // Format dates for the input type=datetime-local
        departure_time: formatDateTimeLocal(newData.departure_time),
        arrival_time: formatDateTimeLocal(newData.arrival_time),
        image_url: newData.image_url || '',
    };
}, { deep: true, immediate: true }); // immediate ensures it runs on initial load


const submitForm = () => {
    // Convert datetime-local strings back to ISO format or let backend handle it
    // The backend expects ISO 8601 format with timezone (like the database stores)
     const dataToSend = {
        ...formData.value,
        // Convert back to ISO string. The browser usually sends it in local time.
        // Ensure backend/database handles timezone conversion correctly.
        // Sending as-is might be fine if backend parses it correctly.
        // Alternatively, explicitly convert to UTC:
        // departure_time: new Date(formData.value.departure_time).toISOString(),
        // arrival_time: new Date(formData.value.arrival_time).toISOString(),
    };
    emit('submit', dataToSend);
};

const cancel = () => {
    emit('cancel'); // Emit cancel event for parent to handle
     // Reset form to default state (optional, parent might handle this)
     // formData.value = { ...props.initialData }; // Reset to initial might not be desired if parent handles state
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
/*.form.group.full-width{grid-column: 1 / -1;}*/
.form-group { display: flex; flex-direction: column; }
label { margin-bottom: 5px; font-weight: bold; }
input { padding: 8px; border: 1px solid #ccc; border-radius: 3px; }
button { padding: 10px 15px; cursor: pointer; border: none; border-radius: 3px; margin-right: 10px;}
button[type="submit"] { background-color: #2ecc71; color: white; }
button.is-light { background-color: #ecf0f1; color: #333; }

</style>
