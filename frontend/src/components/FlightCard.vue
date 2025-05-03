<template>
  <div class="flight-card">
    <div class="card-image-container" v-if="flight.image_url">
      <img :src="flight.image_url" :alt="`Vuelo ${flight.flight_number} a ${flight.destination}`" class="flight-image" @error="handleImageError">
    </div>
     <!-- Placeholder si no hay imagen -->
    <div class="card-image-placeholder" v-else>
       <span>✈️</span>
    </div>

    <!-- Sección de Texto -->
    <div class="card-content">
      <h3>{{ flight.flight_number }}</h3>
      <p><strong>Desde:</strong> {{ flight.origin }}</p>
      <p><strong>Hasta:</strong> {{ flight.destination }}</p>
      <p><strong>Partida:</strong> {{ formatDate(flight.departure_time) }}</p>
      <p><strong>Llegada:</strong> {{ formatDate(flight.arrival_time) }}</p>
      <p><strong>Precio:</strong><span class="price-value"> u$s {{ parseFloat(flight.price).toFixed(2) }}</span></p>
      <p><strong>Asientos:</strong> {{ flight.seats_available }}</p>
    </div>

    <!-- Sección de Acciones --> 
    <div class="card-actions">
        <router-link :to="{ name: 'flight-details', params: { id: flight.id } }" class="button is-small is-info">
           Ver detalles
        </router-link>
        <router-link v-if="authStore.isAuthenticated" :to="{ name: 'create-booking', params: { flightId: flight.id } }" class="button is-small is-success">
            Reservar ahora
        </router-link>
    </div>
  </div>
</template>

<script setup>
//import { defineProps } from 'vue';
import { useAuthStore } from '@/store/auth';
import {formatDate} from '@/utils/formatters';

const props = defineProps({
  flight: {
    type: Object,
    required: true,
  },
});

const authStore = useAuthStore();

// Opcional: Manejador para imágenes rotas
const handleImageError = (event) => {
  console.warn(`Error cargando imagen: ${props.flight.image_url}`);
}

</script>

<style scoped>
.flight-card {
  border: 1px solid #e0e0e0; /* Borde ligeramente más suave */
  border-radius: 8px;
  background-color: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08); /* Sombra sutil */
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out; /* Transiciones suaves */
}
.flight-card:hover {
     transform: translateY(-4px); /* Elevarse un poco */
     box-shadow: 0 6px 12px rgba(0,0,0,0.1); /* Sombra más pronunciada */
}

.card-image-container {
  width: 100%;
  height: 160px; /* Altura ligeramente menor para la tarjeta de lista */
  overflow: hidden;
  background-color: #f0f0f0; /* Fondo por si la imagen tarda */
}
.flight-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}
.card-image-placeholder {
    width: 100%;
    height: 160px;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #f5f5f5;
    font-size: 2.5em; /* Icono un poco más pequeño */
    color: #ccc;
}

/* Contenido de texto mejorado */
.card-content {
  padding: 12px 18px; /* Padding ajustado */
  flex-grow: 1;
  display: flex; /* Usar flex para controlar mejor el espacio */
  flex-direction: column;
}
.card-content h3 {
  margin-top: 0;
  margin-bottom: 12px; /* Más espacio debajo del título */
  color: #3498db;
  font-size: 1.15em; /* Ligeramente más grande */
  font-weight: 600;
}
.card-content p {
  margin: 4px 0; /* Margen vertical reducido entre párrafos */
  font-size: 0.9em;
  color: #444; /* Texto ligeramente más oscuro */
  line-height: 1.5; /* Mejorar legibilidad */
}
/* Estilo para las etiquetas (strong) */
.card-content p strong {
     color: #111; /* Más oscuro */
     font-weight: 500; /* Peso normal o semi-bold */
     min-width: 85px; /* Ancho mínimo para alineación */
     display: inline-block; /* Permite aplicar ancho */
     margin-right: 5px; /* Pequeño espacio después de la etiqueta */
}
.card-content .price-value {
    font-weight: bold;
    color: #27ae60; /* Verde para el precio */
    margin-left: 5px; /* Espacio antes del precio */
}

/* Acciones */
.card-actions {
  padding: 12px 18px;
  border-top: 1px solid #f0f0f0; /* Separador más suave */
  background-color: #fafafa;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: auto; /* Empuja las acciones al fondo si el contenido es corto */
}
.button.is-small { padding: 6px 12px; font-size: 0.8em; }
.button.is-info { background-color: #3498db; color: white; border: none; }
.button.is-success { background-color: #2ecc71; color: white; border: none; }
.button:hover { opacity: 0.85; }

</style>