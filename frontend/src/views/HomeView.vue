<!-- C:\Users\marti\OneDrive\Desktop\reserva-aviones\frontend\src\views\HomeView.vue -->
<template>
  <div class="home-view">
    <header class="hero">
      <h1>Bienvenido a AeroTravel</h1>
      <p class="hero-subtitle">Tu destino principal para reservar vuelos de manera fácil y rápida.</p>
      <img src="@/assets/Avion.gif" alt="Avión volando" class="hero-gif" />
      <div class="hero-actions">
        <router-link to="/flights" class="button is-primary hero-button">Explorar Todos los Vuelos</router-link>
        <button @click="playSound" class="sound-button" aria-label="Reproducir sonido de avión">
          <span class="sound-icon">🔊</span>
          <span class="sound-text">Sonido Avión</span>
        </button>
      </div>
      <audio ref="audioPlayerRef">
        <source src="@/assets/SonidoAvion.mp3" type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </header>

    <!-- Sección de Ofertas Destacadas -->
    <section class="featured-offers" v-if="featuredOfferings.length > 0">
      <h2 class="section-title blinking-text">¡Ofertas Destacadas!</h2>
      <div class="scroll-wrapper">
        <button @click="scrollOffers(-1)" class="scroll-arrow left-arrow" aria-label="Scroll Izquierda" :disabled="isScrollAtStart">⬅️</button>
        <div class="scroll-container" ref="offersContainerRef" @scroll.passive="updateScrollButtonStates">
          <div
            v-for="offering in featuredOfferings"
            :key="offering.id"
            class="offer-card">
            <router-link :to="{ name: 'flight-details', params: { id: offering.flight.id } }" class="offer-link">
              <div class="offer-image-container">
                <img v-if="offering.flight.image_url" :src="offering.flight.image_url" :alt="`Vuelo a ${offering.flight.destination}`" class="offer-image"/>
                <div v-else class="offer-image-placeholder">✈️</div>
              </div>
              <div class="offer-info">
                <h4>{{ offering.flight.origin }} → {{ offering.flight.destination }}</h4>
                <p class="flight-number">
                  {{ offering.flight.flight_number }} - Clase {{ offering.flightClass?.name || 'N/A' }}
                </p>
                <p class="offer-price">u$s {{ parseFloat(offering.price).toFixed(2) }}</p>
                <span v-if="offering.seats_available > 0" class="seats-info">{{ offering.seats_available }} asientos</span>
                <span v-else class="seats-info sold-out">Agotado</span>
              </div>
            </router-link>
          </div>
        </div>
        <button @click="scrollOffers(1)" class="scroll-arrow right-arrow" aria-label="Scroll Derecha" :disabled="isScrollAtEnd">➡️</button>
      </div>
    </section>
    <section v-else-if="!loadingOffers" class="featured-offers">
        <h2 class="section-title">Ofertas Destacadas</h2>
        <p class="no-offers-message">No hay ofertas destacadas en este momento. ¡Vuelve pronto!</p>
    </section>
     <div v-if="loadingOffers" class="loading-offers">Cargando ofertas...</div>


    <section class="features">
      <h2 class="section-title">¿Por Qué Elegirnos?</h2>
      <div class="feature-list">
        <div class="feature-item">
          <span class="icon">✈️</span>
          <h3>Amplia Selección</h3>
          <p>Encuentra vuelos a numerosos destinos en todo el mundo.</p>
        </div>
        <div class="feature-item">
          <span class="icon">💲</span>
          <h3>Mejores Precios</h3>
          <p>Precios competitivos para adaptarse a su presupuesto.</p>
        </div>
        <div class="feature-item">
          <span class="icon">🔒</span>
          <h3>Reservas Seguras</h3>
          <p>Su información de reserva está segura con nosotros.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';
import { fetchFlights } from '@/services/api'; // Asume que fetchFlights devuelve ofertas anidadas

const audioPlayerRef = ref(null);
const offersContainerRef = ref(null);
const featuredOfferings = ref([]);
const loadingOffers = ref(true);

const isScrollAtStart = ref(true);
const isScrollAtEnd = ref(false);


const playSound = () => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.volume = 0.3; // Ajustar volumen si es necesario
    audioPlayerRef.value.play().catch(error => console.error("Error al reproducir sonido:", error));
  }
};

const loadFeaturedOfferings = async () => {
  loadingOffers.value = true;
  try {
    const response = await fetchFlights();
    let allOfferings = [];
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(flight => {
        if (flight.offerings && flight.offerings.length > 0) {
          flight.offerings.forEach(offering => {
            if (offering.flightClass) { // Asegurarse que flightClass existe
              allOfferings.push({
                ...offering,
                flight: {
                  id: flight.id,
                  flight_number: flight.flight_number,
                  origin: flight.origin,
                  destination: flight.destination,
                  image_url: flight.image_url
                },
                // flightClass ya viene anidado en offering
              });
            }
          });
        }
      });
    }

    // Lógica simple para "ofertas": las más baratas con asientos disponibles
    featuredOfferings.value = allOfferings
                              .filter(off => off.seats_available > 0) // Solo con asientos
                              .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                              .slice(0, 10); // Tomar las primeras 10

    await nextTick(); // Esperar a que el DOM se actualice
    updateScrollButtonStates(); // Actualizar estado de botones de scroll

  } catch (error) {
    console.error('Error al cargar ofertas destacadas:', error);
    featuredOfferings.value = []; // Limpiar en caso de error
  } finally {
    loadingOffers.value = false;
  }
};

onMounted(loadFeaturedOfferings);

const scrollOffers = (direction) => {
  if (offersContainerRef.value) {
    const cardWidth = offersContainerRef.value.querySelector('.offer-card')?.offsetWidth || 280;
    const gap = 20; // El gap definido en CSS
    const scrollAmount = (cardWidth + gap) * Math.floor(offersContainerRef.value.clientWidth / (cardWidth + gap) * 0.75) * direction;
    offersContainerRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    // Los estados de los botones se actualizarán por el evento @scroll
  }
};

const updateScrollButtonStates = () => {
  if (!offersContainerRef.value) return;
  const el = offersContainerRef.value;
  isScrollAtStart.value = el.scrollLeft <= 0;
  // Tolerancia pequeña para el final del scroll
  isScrollAtEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 5;
};

</script>

<style scoped>
.home-view {
  margin: 0 auto;
}

.hero {
  text-align: center;
  padding: 30px 20px 40px 20px;
  background: linear-gradient(to bottom, #3498db, #2980b9); /* Degradado sutil */
  color: white;
}
.hero h1 {
  font-size: 2.8em;
  margin-bottom: 10px;
  font-weight: 700;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
}
.hero-subtitle {
  font-size: 1.2em;
  margin-bottom: 25px;
  opacity: 0.95;
  max-width: 650px;
  margin-left:auto;
  margin-right:auto;
  line-height: 1.6;
}
.hero-gif {
  width: 100%;
  max-width: 650px;
  margin: 25px auto;
  display: block;
  border-radius: 12px;
  border: 3px solid rgba(255,255,255,0.5);
  box-shadow: 0 5px 20px rgba(0,0,0,0.25);
}
.hero-actions {
    margin-top: 20px;
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px; /* Espacio entre botones */
}
.button.is-primary.hero-button {
  background-color: #ffffff;
  color: #2c88d0;
  padding: 14px 30px; /* Botón más grande */
  font-size: 1.15em;
  border-radius: 6px;
  font-weight: bold;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
}
.button.is-primary.hero-button:hover {
  background-color: #f0f0f0;
  transform: translateY(-1px);
}
.sound-button {
  font-size: 1em; padding: 0.7rem 1.2rem; border: none;
  background-color: rgba(255,255,255,0.15);
  color: white; border-radius: 6px; cursor: pointer;
  display: inline-flex; align-items: center; gap: 8px;
  transition: background-color 0.3s ease;
  border: 1px solid rgba(255,255,255,0.3);
}
.sound-button:hover { background-color: rgba(255,255,255,0.25); }
.sound-icon { font-size: 1.2em; }
.sound-text { font-weight: 500; }

.featured-offers {
  padding: 50px 20px;
  background-color: #f8f9fa; /* Fondo muy claro */
}
.section-title {
  text-align: center;
  margin-bottom: 35px;
  font-weight: 600;
  font-size: 2em;
  color: #333;
}
.loading-offers, .no-offers-message {
    text-align: center;
    padding: 30px;
    font-style: italic;
    color: #777;
    font-size: 1.1em;
}

.blinking-text {
  animation: blink 1.3s infinite alternate; /* Alternar la animación */
  color: #e74c3c;
}
@keyframes blink {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.6; transform: scale(1.03); }
}

.scroll-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 1.5rem;
  position: relative; /* Para posicionar flechas si es necesario */
}
.scroll-arrow {
  background-color: #fff;
  border: 1px solid #ddd;
  font-size: 1.5em;
  cursor: pointer;
  color: #3498db;
  padding: 8px 12px;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
  transition: background-color 0.2s, color 0.2s;
  z-index: 10;
}
.scroll-arrow:hover { background-color: #3498db; color: white; }
.scroll-arrow:disabled {
    color: #ccc;
    background-color: #f0f0f0;
    cursor: not-allowed;
}

.scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  -webkit-overflow-scrolling: touch;
  gap: 20px;
  width: 100%;
  max-width: calc(280px * 3 + 20px * 2); /* Aprox 3 tarjetas visibles */
  padding: 15px 10px;
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.scroll-container::-webkit-scrollbar { display: none; }

.offer-card {
  min-width: 270px; /* Ancho fijo */
  max-width: 270px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  flex-shrink: 0;
  transition: transform 0.25s ease, box-shadow 0.25s ease;
  border: 1px solid #eee;
}
.offer-card:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 8px 20px rgba(0,0,0,0.15);
}
.offer-link { text-decoration: none; color: inherit; display: block; height:100%; }

.offer-image-container { height: 160px; background-color: #f0f0f0; overflow: hidden; }
.offer-image { width: 100%; height: 100%; object-fit: cover; }
.offer-image-placeholder { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; font-size:3em; color:#d0d0d0;}

.offer-info { padding: 15px; }
.offer-info h4 { margin: 0 0 6px 0; font-size: 1.05em; font-weight: 600; color: #2c3e50; line-height: 1.3; }
.offer-info .flight-number { font-size: 0.8em; color: #667; margin-bottom: 10px; display: block; }
.offer-info .offer-price {
  display: block; font-size: 1.4em; font-weight: bold;
  color: #e74c3c; margin-bottom: 8px;
}
.seats-info { font-size: 0.85em; color: #4caf50; font-weight:500; }
.seats-info.sold-out { color: #f44336; }

.features {
  padding: 60px 20px; /* Más padding */
  text-align: center;
  background-color: #ffffff; /* Fondo blanco para esta sección */
}
.features .section-title { color: #3498db; } /* Título en azul */

.feature-list {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 25px;
  max-width: 1100px;
  margin: 0 auto; /* Centrar la lista de features */
}
.feature-item {
  background-color: #fff;
  padding: 30px 25px;
  border-radius: 10px;
  flex-basis: calc(33.333% - 30px);
  min-width: 260px;
  box-shadow: 0 3px 10px rgba(0,0,0,0.06);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  border: 1px solid #f0f0f0;
}
.feature-item:hover {
    transform: translateY(-5px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
}
.feature-item .icon { font-size: 2.8em; display: block; margin-bottom: 18px; color: #3498db; }
.feature-item h3 { font-size: 1.3em; margin-bottom: 12px; color: #333; }
.feature-item p { font-size: 0.95em; color: #666; line-height: 1.6; }
</style>