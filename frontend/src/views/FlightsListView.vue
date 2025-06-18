<template>
  <div class="flights-list-view">

    <AlertMessage v-if="error" type="error" :message="error" />
    <div v-if="loading" class="loading">Cargando vuelos...</div>

    <!-- Sección de Filtros Avanzados -->
    <div class="filters-container card">
      <h4>Buscar Vuelos</h4>
      <div class="filters">
        <!-- Filtro por Origen (Autocompletado con Ciudad y Aeropuerto) -->
        <div class="filter-group autocomplete-group">
          <label for="originInput">Origen:</label>
          <input
            type="text"
            id="originInput"
            v-model="filters.originSearchTerm"
            placeholder="Ciudad o aeropuerto"
            @input="searchAirports('origin')"
            @focus="showSuggestions.origin = true"
            @blur="hideSuggestionsDelayed('origin')"
            autocomplete="off"
          />
          <ul v-if="showSuggestions.origin && filteredOriginAirportSuggestions.length" class="autocomplete-suggestions">
            <li
              v-for="airport in filteredOriginAirportSuggestions"
              :key="airport.id"
              @mousedown.prevent="selectAirport('origin', airport)"
            >
              <strong>{{ airport.city?.name || 'Ciudad Desconocida' }}</strong> ({{ airport.iata_code }}) - {{ airport.name }}
            </li>
          </ul>
        </div>

        <!-- Filtro por Destino (Autocompletado con Ciudad y Aeropuerto) -->
        <div class="filter-group autocomplete-group">
          <label for="destinationInput">Destino:</label>
          <input
            type="text"
            id="destinationInput"
            v-model="filters.destinationSearchTerm"
            placeholder="Ciudad o aeropuerto"
            @input="searchAirports('destination')"
            @focus="showSuggestions.destination = true"
            @blur="hideSuggestionsDelayed('destination')"
            autocomplete="off"
          />
          <ul v-if="showSuggestions.destination && filteredDestinationAirportSuggestions.length" class="autocomplete-suggestions">
            <li
              v-for="airport in filteredDestinationAirportSuggestions"
              :key="airport.id"
              @mousedown.prevent="selectAirport('destination', airport)"
            >
              <strong>{{ airport.city?.name || 'Ciudad Desconocida' }}</strong> ({{ airport.iata_code }}) - {{ airport.name }}
            </li>
          </ul>
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

    <div v-if="displayedFlights.length > 0" class="flight-grid">
      <FlightCard v-for="flight in displayedFlights" :key="flight.id" :flight="flight" />
    </div>
    <div v-else-if="!loading">
        <p class="no-flights-message">
            {{ hasAppliedFilters ? 'No se encontraron vuelos con estos criterios. Intenta ajustar tu búsqueda.' : 'No hay vuelos disponibles en este momento.' }}
        </p>
    </div>
    <div v-else-if="loading" class="loading-message">
      <div>Cargando vuelos...</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, computed } from 'vue';
import * as api from '@/services/api'; 
import { fetchFlights, fetchFlightClasses, fetchAirports } from '@/services/api';
import FlightCard from '@/components/FlightCard.vue';
import AlertMessage from '@/components/AlertMessage.vue';

const allFlights = ref([]);
const displayedFlights = ref([]);
const availableFlightClasses = ref([]);
const allAirports = ref([]); // Almacena todos los aeropuertos para el autocompletado

const loading = ref(true);
const error = ref('');
const hasAppliedFilters = ref(false);

const filters = reactive({
  originSearchTerm: '', // Texto que el usuario escribe para origen
  destinationSearchTerm: '', // Texto que el usuario escribe para destino
  originAirportId: '', // ID del aeropuerto seleccionado para origen
  destinationAirportId: '', // ID del aeropuerto seleccionado para destino
  dateFrom: '',
  dateTo: '',
  flightClassId: '',
  priceMin: null,
  priceMax: null
});

const showSuggestions = reactive({
    origin: false,
    destination: false
});

// Computed properties para filtrar las sugerencias de aeropuertos
const filteredOriginAirportSuggestions = computed(() => {
  if (filters.originSearchTerm.length < 3) return []; // 👈 Limita a 3 caracteres
  return allAirports.value.filter(airport =>
    airport.name.toLowerCase().includes(filters.originSearchTerm.toLowerCase()) ||
    airport.iata_code.toLowerCase().includes(filters.originSearchTerm.toLowerCase()) ||
    airport.city?.name.toLowerCase().includes(filters.originSearchTerm.toLowerCase())
  ).slice(0, 10);
});

const filteredDestinationAirportSuggestions = computed(() => {
  if (filters.destinationSearchTerm.length < 3) return []; // 👈 Limita a 3 caracteres
  return allAirports.value.filter(airport =>
    airport.name.toLowerCase().includes(filters.destinationSearchTerm.toLowerCase()) ||
    airport.iata_code.toLowerCase().includes(filters.destinationSearchTerm.toLowerCase()) ||
    airport.city?.name.toLowerCase().includes(filters.destinationSearchTerm.toLowerCase())
  ).slice(0, 10);
});


// Retrasar el ocultamiento de las sugerencias para permitir el evento @mousedown
let blurTimeout = {};
const hideSuggestionsDelayed = (field) => {
    blurTimeout[field] = setTimeout(() => {
        showSuggestions[field] = false;
    }, 150);
};

// Función para seleccionar un aeropuerto de las sugerencias
const selectAirport = (field, airport) => {
    clearTimeout(blurTimeout[field]);
    const displayValue = `${airport.city?.name || 'Ciudad Desconocida'} (${airport.iata_code}) - ${airport.name}`;
    if (field === 'origin') {
        filters.originSearchTerm = displayValue;
        filters.originAirportId = airport.id;
    } else {
        filters.destinationSearchTerm = displayValue;
        filters.destinationAirportId = airport.id;
    }
    showSuggestions[field] = false;
};

const searchAirports = (field) => {
    // La lógica de filtrado de sugerencias está en los computed properties
    // No es necesario llamar a la API de aeropuertos de nuevo si ya los cargamos todos
};

const loadInitialData = async () => {
  loading.value = true; error.value = '';
  try {
    const [flightsResponse, classesResponse, airportsResponse] = await Promise.all([
      fetchFlights(),
      fetchFlightClasses(),
      fetchAirports()
    ]);

    allFlights.value = flightsResponse.data || [];
    displayedFlights.value = allFlights.value;
    availableFlightClasses.value = classesResponse.data || [];
    allAirports.value = airportsResponse.data || []; // Almacena todos los aeropuertos para autocompletado
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
  let result = [...allFlights.value];
  console.log('Aplicando filtros:', JSON.parse(JSON.stringify(filters))); // <-- AÑADIR ESTE LOG
  console.log('Todos los vuelos:', JSON.parse(JSON.stringify(allFlights.value))); // <-- AÑADIR ESTE LOG (para ver si los IDs coinciden)
  // Filtrar por ID de aeropuerto seleccionado (si hay uno)
  if (filters.originAirportId) {
    result = result.filter(f => f.originAirport?.id === filters.originAirportId);
  }
  if (filters.destinationAirportId) {
    result = result.filter(f => f.destinationAirport?.id === filters.destinationAirportId);
  }

  // Filtrar por fecha
  if (filters.dateFrom) {
    const fromDate = new Date(filters.dateFrom + "T00:00:00Z");
    result = result.filter(f => new Date(f.departure_time) >= fromDate);
  }
  if (filters.dateTo) {
    const toDate = new Date(filters.dateTo + "T23:59:59Z");
    result = result.filter(f => new Date(f.departure_time) <= toDate);
  }

  // Filtrar por clase y precio
  if (filters.flightClassId || filters.priceMin !== null || filters.priceMax !== null) {
    result = result.filter(flight => {
      if (!flight.offerings || flight.offerings.length === 0) return false;

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
  filters.originSearchTerm = '';
  filters.destinationSearchTerm = '';
  filters.originAirportId = '';
  filters.destinationAirportId = '';
  filters.dateFrom = '';
  filters.dateTo = '';
  filters.flightClassId = '';
  filters.priceMin = null;
  filters.priceMax = null;
  displayedFlights.value = [...allFlights.value];
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
  font-size: 1.3em;
  color: #333;
  border-bottom: 1px solid #eee;
  padding-bottom: 10px;
}
.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); /* Columnas responsivas para filtros */
  gap: 15px 20px; /* Espacio entre grupos de filtro */
}
.filter-group { display: flex; flex-direction: column; }
.filter-group label { margin-bottom: 6px; font-size: 0.95em; color: #555; font-weight: 500; }
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); /* Ligeramente más ancho */
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
  width: 100%;
  max-width: 200px; /* Ancho máximo para inputs y selects */
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1em;
}
/* ... (resto de los estilos si los tienes) ... */

/* Nuevos estilos para el autocompletado */
.autocomplete-group {
    position: relative;
}
.autocomplete-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    width: 100%;
    z-index: 100;
    background-color: white;
    border: 1px solid #ddd;
    border-top: none;
    max-height: 200px;
    overflow-y: auto;
    list-style: none;
    padding: 0;
    margin: 0;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    border-radius: 0 0 4px 4px;
}
.autocomplete-suggestions li {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
    font-size: 0.95em;
    color: #333;
}
.autocomplete-suggestions li:last-child {
    border-bottom: none;
}
.autocomplete-suggestions li:hover {
    background-color: #f0f0f0;
}
.autocomplete-suggestions li strong {
    color: #3498db;
}

/* Estilos para el select (si se mantiene, aunque para autocompletado se usa input) */
select {
    width: 100%;
    padding: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
    font-size: 0.95em;
    appearance: none;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23666'%3E%3Cpath d='M7 10l5 5 5-5z'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 0.75rem top 50%;
    background-size: 1em;
    padding-right: 2.5rem;
}
</style>