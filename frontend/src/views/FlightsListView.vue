<template>
  <div class="flights-list-view">
    <h2>Vuelos Disponibles</h2>

    <!-- Sección de Filtros Avanzados -->
    <div class="filters-container card">
      <h4>Buscar Vuelos</h4>
      <div class="filters">
        <div class="filter-group">
          <label for="origin">Origen:</label>
          <input type="text" id="origin" v-model="filters.origin" placeholder="Ciudad o aeropuerto">
        </div>
        <div class="filter-group">
          <label for="destination">Destino:</label>
          <input type="text" id="destination" v-model="filters.destination" placeholder="Ciudad o aeropuerto">
        </div>
        <div class="filter-group">
          <label for="dateFrom">Fecha Desde:</label>
          <input type="date" id="dateFrom" v-model="filters.dateFrom">
        </div>
        <div class="filter-group">
          <label for="dateTo">Fecha Hasta:</label>
          <input type="date" id="dateTo" v-model="filters.dateTo">
        </div>
        <div class="filter-group">
          <label for="flightClass">Clase:</label>
          <select id="flightClass" v-model="filters.flightClassId">
            <option value="">Cualquier Clase</option>
            <option v-for="fc in availableFlightClasses" :key="fc.id" :value="fc.id">
              {{ fc.name }}
            </option>
          </select>
        </div>
        <div class="filter-group price-range">
          <label>Precio (u$s):</label>
          <div class="price-inputs">
            <input type="number" v-model.number="filters.priceMin" placeholder="Min" min="0">
            <span>-</span>
            <input type="number" v-model.number="filters.priceMax" placeholder="Max" min="0">
          </div>
        </div>
        <div class="filter-actions">
          <button @click="applyFilters" class="button is-info">Buscar</button>
          <button @click="resetFilters" class="button is-light">Limpiar Filtros</button>
        </div>
      </div>
    </div>

    <AlertMessage v-if="error" type="error" :message="error" />
    <div v-if="loading" class="loading">Cargando vuelos...</div>
    <!-- Mostrar resultados filtrados o todos los vuelos -->
    <div v-else-if="displayedFlights.length > 0" class="flight-grid">
      <FlightCard v-for="flight in displayedFlights" :key="flight.id" :flight="flight" />
    </div>
    <div v-else>
      <p>{{ hasAppliedFilters ? 'No se encontraron vuelos que coincidan con tu búsqueda.' : 'No hay vuelos disponibles en este momento.' }}</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import { fetchFlights, fetchFlightClasses } from '@/services/api'; // Asumimos que fetchFlightClasses existe
import FlightCard from '@/components/FlightCard.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const allFlights = ref([]); // Guardará todos los vuelos cargados inicialmente
const displayedFlights = ref([]); // Vuelos que se muestran (filtrados o todos)
const availableFlightClasses = ref([]);

const loading = ref(true);
const error = ref('');
const hasAppliedFilters = ref(false); // Para cambiar el mensaje de "no vuelos"

const filters = reactive({
  origin: '',
  destination: '',
  dateFrom: '',
  dateTo: '',
  flightClassId: '',
  priceMin: null,
  priceMax: null,
});

const loadInitialData = async () => {
  loading.value = true; error.value = '';
  try {
    const [flightsResponse, classesResponse] = await Promise.all([
      fetchFlights(),
      fetchFlightClasses() // Cargar clases para el dropdown de filtro
    ]);
    allFlights.value = flightsResponse.data || [];
    displayedFlights.value = allFlights.value; // Inicialmente mostrar todos
    availableFlightClasses.value = classesResponse.data || [];
  } catch (err) {
    console.error("Error al cargar datos iniciales:", err);
    error.value = 'No se pudieron cargar los datos. Inténtalo de nuevo más tarde.';
  } finally {
    loading.value = false;
  }
};

onMounted(loadInitialData);

const applyFilters = () => {
  hasAppliedFilters.value = true;
  let result = [...allFlights.value]; // Empezar con todos los vuelos

  // Filtrar por origen
  if (filters.origin) {
    result = result.filter(f => f.origin.toLowerCase().includes(filters.origin.toLowerCase()));
  }
  // Filtrar por destino
  if (filters.destination) {
    result = result.filter(f => f.destination.toLowerCase().includes(filters.destination.toLowerCase()));
  }
  // Filtrar por fecha desde
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom + "T00:00:00Z"); // Asumir UTC para evitar problemas de zona
    result = result.filter(f => new Date(f.departure_time) >= fromDate);
  }
  // Filtrar por fecha hasta
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo + "T23:59:59Z");
    result = result.filter(f => new Date(f.departure_time) <= toDate);
  }

  // Filtrar por clase y precio (esto es más complejo porque están en las offerings)
  if (filters.flightClassId || filters.priceMin !== null || filters.priceMax !== null) {
    result = result.filter(flight => {
      if (!flight.offerings || flight.offerings.length === 0) return false; // Si no tiene ofertas, no pasa el filtro

      return flight.offerings.some(offering => {
        let classMatch = true;
        let priceMatch = true;

        if (filters.flightClassId) {
          classMatch = offering.flightClass?.id === filters.flightClassId;
        }
        if (filters.priceMin !== null) {
          priceMatch = parseFloat(offering.price) >= filters.priceMin;
        }
        if (filters.priceMax !== null) {
          priceMatch = priceMatch && parseFloat(offering.price) <= filters.priceMax;
        }
        return classMatch && priceMatch;
      });
    });
  }
  displayedFlights.value = result;
};

const resetFilters = () => {
  filters.origin = '';
  filters.destination = '';
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.flightClassId = '';
  filters.priceMin = null;
  filters.priceMax = null;
  displayedFlights.value = [...allFlights.value]; // Mostrar todos de nuevo
  hasAppliedFilters.value = false;
};

</script>

<style scoped>
.flights-list-view { padding: 20px; }
.flights-list-view h2 { text-align: center; margin-bottom: 25px; }

.filters-container.card {
  background-color: #ffffff;
  padding: 20px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);
  margin-bottom: 30px;
}
.filters-container h4 {
  margin-top: 0;
  margin-bottom: 20px;
  font-size: 1.2em;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); /* Columnas responsivas para filtros */
  gap: 15px 20px; /* Espacio entre grupos de filtro */
}
.filter-group { display: flex; flex-direction: column; }
.filter-group label { margin-bottom: 6px; font-size: 0.85em; color: #555; font-weight: 500; }
.filter-group input, .filter-group select {
  padding: 10px; border: 1px solid #ccc; border-radius: 4px; font-size: 0.95em;
}
.price-inputs { display: flex; align-items: center; gap: 8px; }
.price-inputs input { width: calc(50% - 12px); /* Ajustar ancho para dos inputs y el guión */ }
.price-inputs span { color: #777; }

.filter-actions {
  grid-column: 1 / -1; /* Ocupar todo el ancho */
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}
.filter-actions .button { padding: 10px 20px; font-size: 0.95em;}

.flight-grid {
  display: grid;
  /* Puedes mantener o ajustar minmax. Si las tarjetas son más altas,
     quizás un poco más de ancho mínimo se vea mejor. */
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); /* Ligeramente más ancho */
  gap: 25px; /* Un poco más de espacio */
  margin-top: 20px;
}
.loading { text-align: center; padding: 20px; font-style: italic; }

/* Añadir estilos para la sección de filtros que implementaremos después */
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  flex-wrap: wrap; /* Para responsividad de filtros */
}
.filters input, .filters select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9em;
}
/* ... (resto de los estilos si los tienes) ... */
</style>
