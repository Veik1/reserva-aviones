<template>
  <div class="flights-list-view">
    <h2>Vuelos Disponibles</h2>
    <div class="filters-container card">
      <h4>Buscar Vuelos</h4>
      <div class="filters">
        <!-- Origen -->
        <div class="filter-group">
          <label for="originCity">Ciudad de Origen:</label>
          <select id="originCity" v-model="filters.originCityId">
            <option value="">Seleccione ciudad</option>
            <option v-for="city in cities" :key="city.id" :value="city.id">
              {{ city.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="originAirport">Aeropuerto de Origen:</label>
          <select
            id="originAirport"
            v-model="filters.originAirportId"
            :disabled="!airportsOrigen.length"
          >
            <option value="">Seleccione aeropuerto</option>
            <option v-for="airport in airportsOrigen" :key="airport.id" :value="airport.id">
              {{ airport.name }} ({{ airport.iata_code }})
            </option>
          </select>
        </div>
        <!-- Destino -->
        <div class="filter-group">
          <label for="destinationCity">Ciudad de Destino:</label>
          <select id="destinationCity" v-model="filters.destinationCityId">
            <option value="">Seleccione ciudad</option>
            <option v-for="city in cities" :key="city.id" :value="city.id">
              {{ city.name }}
            </option>
          </select>
        </div>
        <div class="filter-group">
          <label for="destinationAirport">Aeropuerto de Destino:</label>
          <select
            id="destinationAirport"
            v-model="filters.destinationAirportId"
            :disabled="!airportsDestino.length"
          >
            <option value="">Seleccione aeropuerto</option>
            <option v-for="airport in airportsDestino" :key="airport.id" :value="airport.id">
              {{ airport.name }} ({{ airport.iata_code }})
            </option>
          </select>
        </div>
        <!-- Otros filtros -->
        <div class="filter-group">
          <label for="dateFrom">Fecha Desde:</label>
          <input type="date" id="dateFrom" v-model="filters.dateFrom" />
        </div>
        <div class="filter-group">
          <label for="dateTo">Fecha Hasta:</label>
          <input type="date" id="dateTo" v-model="filters.dateTo" />
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
            <input type="number" v-model.number="filters.priceMin" placeholder="Min" min="0" />
            <span>-</span>
            <input type="number" v-model.number="filters.priceMax" placeholder="Max" min="0" />
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
    <div v-else-if="displayedFlights.length > 0" class="flight-grid">
      <FlightCard v-for="flight in displayedFlights" :key="flight.id" :flight="flight" />
    </div>
    <div v-else>
      <p>
        {{
          hasAppliedFilters
            ? 'No se encontraron vuelos que coincidan con tu búsqueda.'
            : 'No hay vuelos disponibles en este momento.'
        }}
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive, watch } from 'vue'
import { getCities } from '@/services/cityService'
import { getAirportsByCity } from '@/services/airportService'
import { getFlights } from '@/services/flightService'
import { fetchFlightClasses } from '@/services/api'
import FlightCard from '@/components/FlightCard.vue'
import AlertMessage from '@/components/AlertMessage.vue'

const cities = ref([])
const airportsOrigen = ref([])
const airportsDestino = ref([])
const availableFlightClasses = ref([])
const loading = ref(true)
const error = ref('')
const hasAppliedFilters = ref(false)

const filters = reactive({
  originCityId: '',
  originAirportId: '',
  destinationCityId: '',
  destinationAirportId: '',
  dateFrom: '',
  dateTo: '',
  flightClassId: '',
  priceMin: null,
  priceMax: null,
})

const allFlights = ref([])
const displayedFlights = ref([])

const loadAllFlights = async () => {
  loading.value = true
  error.value = ''
  try {
    const response = await getFlights()
    console.log('Respuesta de vuelos:', response.data)
    displayedFlights.value = Array.isArray(response.data) ? response.data : []
    allFlights.value = Array.isArray(response.data) ? response.data : []
  } catch (err) {
    error.value = 'No se pudieron cargar los vuelos.'
    displayedFlights.value = []
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const [citiesRes, classesRes] = await Promise.all([getCities(), fetchFlightClasses()])
    cities.value = citiesRes.data
    availableFlightClasses.value = classesRes.data || []
    await loadAllFlights()
  } catch (err) {
    error.value = 'No se pudieron cargar los datos. Inténtalo de nuevo más tarde.'
    displayedFlights.value = []
  } finally {
    loading.value = false
  }
})

watch(
  () => filters.originCityId,
  async (cityId) => {
    filters.originAirportId = ''
    if (cityId) {
      const res = await getAirportsByCity(cityId)
      airportsOrigen.value = res.data
    } else {
      airportsOrigen.value = []
    }
  },
)
watch(
  () => filters.destinationCityId,
  async (cityId) => {
    filters.destinationAirportId = ''
    if (cityId) {
      const res = await getAirportsByCity(cityId)
      airportsDestino.value = res.data
    } else {
      airportsDestino.value = []
    }
  },
)

const applyFilters = async () => {
  hasAppliedFilters.value = true
  loading.value = true
  error.value = ''
  try {
    const params = {}
    if (filters.originAirportId) params.origin_airport_id = filters.originAirportId
    if (filters.destinationAirportId) params.destination_airport_id = filters.destinationAirportId
    if (filters.dateFrom) params.date_from = filters.dateFrom
    if (filters.dateTo) params.date_to = filters.dateTo

    const res = await getFlights(params)
    let result = res.data || []

    // Filtrar por clase y precio en frontend (ofertas)
    if (filters.flightClassId || filters.priceMin !== null || filters.priceMax !== null) {
      result = result.filter((flight) => {
        if (!flight.offerings || flight.offerings.length === 0) return false
        return flight.offerings.some((offering) => {
          let classMatch = true
          let priceMatch = true
          if (filters.flightClassId) {
            classMatch = offering.flightClass?.id === filters.flightClassId
          }
          if (filters.priceMin !== null) {
            priceMatch = parseFloat(offering.price) >= filters.priceMin
          }
          if (filters.priceMax !== null) {
            priceMatch = priceMatch && parseFloat(offering.price) <= filters.priceMax
          }
          return classMatch && priceMatch
        })
      })
    }
    allFlights.value = result
    displayedFlights.value = result
  } catch (err) {
    error.value = 'No se pudieron cargar los vuelos. Inténtalo de nuevo más tarde.'
    displayedFlights.value = []
  } finally {
    loading.value = false
  }
}

const resetFilters = async () => {
  filters.originCityId = ''
  filters.originAirportId = ''
  filters.destinationCityId = ''
  filters.destinationAirportId = ''
  filters.dateFrom = ''
  filters.dateTo = ''
  filters.flightClassId = ''
  filters.priceMin = null
  filters.priceMax = null
  hasAppliedFilters.value = false
  await loadAllFlights()
}
</script>

<style scoped>
.flights-list-view {
  padding: 20px;
}

.flights-list-view h2 {
  text-align: center;
  margin-bottom: 25px;
}

.filters-container.card {
  background-color: #ffffff;
  padding: 20px 25px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
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
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px 20px;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 6px;
  font-size: 0.85em;
  color: #555;
  font-weight: 500;
}

.filter-group input,
.filter-group select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.95em;
}

.price-inputs {
  display: flex;
  align-items: center;
  gap: 8px;
}

.price-inputs input {
  width: calc(50% - 12px);
}

.price-inputs span {
  color: #777;
}

.filter-actions {
  grid-column: 1 / -1;
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 15px;
}

.filter-actions .button {
  padding: 10px 20px;
  font-size: 0.95em;
}

.flight-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 25px;
  margin-top: 20px;
}

.loading {
  text-align: center;
  padding: 20px;
  font-style: italic;
}

/* Añadir estilos para la sección de filtros que implementaremos después */
.filters {
  display: flex;
  gap: 15px;
  margin-bottom: 25px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 8px;
  flex-wrap: wrap;
}

.filters input,
.filters select {
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 0.9em;
}
</style>