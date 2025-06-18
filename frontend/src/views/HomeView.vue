<template>
  <div class="home-view">
    <!-- Hero Section con Imagen de Fondo (o GIF como overlay) -->
    <header class="hero-section">
      <div class="hero-overlay"></div>
      <div class="hero-content">
        <img src="@/assets/Avion.gif" alt="Animación de Avión" class="hero-animation-gif" />
        <h1 class="hero-title">Bienvenido a AeroTravel</h1>
        <p class="hero-subtitle">Tu aventura comienza aquí. Explora el mundo con nuestras mejores ofertas de vuelos.</p>
        <router-link to="/flights" class="button hero-cta-button">Descubrir Vuelos</router-link>
      </div>
      <audio ref="audioPlayerRef" loop>
        <source src="@/assets/SonidoAvion.mp3" type="audio/mpeg" />
        Tu navegador no soporta el elemento de audio.
      </audio>
    </header>

    <!-- Sección de Ofertas Destacadas -->
    <section class="featured-offers-section" v-if="featuredOfferings.length > 0 || loadingOffers">
      <h2 class="section-title">
        <span class="blinking-icon">✨</span> ¡Ofertas que Despegan! <span class="blinking-icon">✨</span>
      </h2>
      <div v-if="loadingOffers" class="loading-indicator">
        <div class="spinner"></div>
        <p>Cargando mejores ofertas...</p>
      </div>
      <div v-else class="scroll-wrapper">
        <button @click="scrollOffers(-1)" class="scroll-arrow" aria-label="Scroll Izquierda" :disabled="isScrollAtStart">‹</button>
        <div class="scroll-container" ref="offersContainerRef" @scroll.passive="updateScrollButtonStates">
          <div v-for="offering in featuredOfferings" :key="offering.id" class="offer-card">
            <router-link :to="{ name: 'flight-details', params: { id: offering.flight.id } }" class="offer-link">
              <div class="offer-image-container">
                <img v-if="offering.flight.image_url" :src="offering.flight.image_url" :alt="`Vuelo a ${offering.flight.destination}`" class="offer-image"/>
                <div v-else class="offer-image-placeholder">✈️</div>
              </div>
              <div class="offer-info">
                  <span class="offer-class-badge">{{ offering.flightClass?.name || 'Clase' }}</span>
                  <!-- Actualizar esta línea para mostrar origen y destino (ciudad) -->
                  <h4>{{ offering.flight.originAirport?.city?.name || offering.flight.originAirport?.name || 'N/A' }} → {{ offering.flight.destinationAirport?.city?.name || offering.flight.destinationAirport?.name || 'N/A' }}</h4>
                  <p class="flight-number">{{ offering.flight.flight_number }}</p>
                  <p class="offer-price">u$s {{ parseFloat(offering.price).toFixed(2) }}</p>
                  <span v-if="offering.seats_available > 0" class="seats-info">{{ offering.seats_available }} asientos</span>
                  <span v-else class="seats-info sold-out">Agotado</span>
              </div>
            </router-link>
          </div>
        </div>
        <button @click="scrollOffers(1)" class="scroll-arrow" aria-label="Scroll Derecha" :disabled="isScrollAtEnd">›</button>
      </div>
    </section>
     <section v-else class="featured-offers-section">
        <h2 class="section-title">Ofertas Destacadas</h2>
        <p class="no-offers-message">No hay ofertas especiales en este momento. ¡Explora todos nuestros vuelos!</p>
    </section>

    <!-- Sección "Por Qué Elegirnos" -->
    <section class="why-choose-us-section">
      <h2 class="section-title">¿Por Qué Volar con AeroTravel?</h2>
      <div class="feature-list">
        <div class="feature-item">
          <div class="feature-icon-wrapper"><span class="icon">🌍</span></div>
          <h3>Destinos Globales</h3>
          <p>Descubre una amplia red de rutas a los rincones más fascinantes del planeta.</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon-wrapper"><span class="icon">💸</span></div>
          <h3>Tarifas Competitivas</h3>
          <p>Encuentra los mejores precios y ofertas que se ajustan a tu presupuesto de viaje.</p>
        </div>
        <div class="feature-item">
          <div class="feature-icon-wrapper"><span class="icon">🛡️</span></div>
          <h3>Reserva Confiable</h3>
          <p>Proceso de reserva seguro, fácil y con confirmación instantánea.</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue';
import { fetchFlights } from '@/services/api';

const audioPlayerRef = ref(null);
const offersContainerRef = ref(null);
const featuredOfferings = ref([]);
const loadingOffers = ref(true);
const isScrollAtStart = ref(true);
const isScrollAtEnd = ref(false);

const loadFeaturedOfferings = async () => {
  loadingOffers.value = true;
  try {
    const response = await fetchFlights();
    let allOfferings = [];
    if (response.data && Array.isArray(response.data)) {
      response.data.forEach(flight => {
        if (flight.offerings && flight.offerings.length > 0) {
          flight.offerings.forEach(offering => {
            if (offering.flightClass && flight) {
              allOfferings.push({
                ...offering,
                flight: {
                  id: flight.id,
                  flight_number: flight.flight_number,
                  originAirport: flight.originAirport,      // <--- AÑADIDO
                  destinationAirport: flight.destinationAirport, // <--- AÑADIDO
                  image_url: flight.image_url
                },
              });
            }
          });
        }
      });
    }
    featuredOfferings.value = allOfferings
                              .filter(off => off.seats_available > 0)
                              .sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
                              .slice(0, 10);
    await nextTick();
    updateScrollButtonStates();
    playHeroSound(); // Intentar reproducir sonido después de cargar ofertas
  } catch (error) {
    console.error('Error al cargar ofertas destacadas:', error);
    featuredOfferings.value = [];
  } finally {
    loadingOffers.value = false;
  }
};

const playHeroSound = () => {
  if (audioPlayerRef.value) {
    audioPlayerRef.value.volume = 0.2; // Volumen más bajo por defecto
    // Intentar reproducir. Algunos navegadores pueden bloquearlo hasta una interacción.
    audioPlayerRef.value.play().catch(error => {
      console.warn("Reproducción automática de audio bloqueada por el navegador:", error);
      // Aquí podrías, por ejemplo, mostrar un pequeño botón de "activar sonido"
      // si la reproducción automática falla, para que el usuario lo active manualmente.
    });
  }
};

onMounted(loadFeaturedOfferings);

onBeforeUnmount(() => {
  if (audioPlayerRef.value && !audioPlayerRef.value.paused) {
    audioPlayerRef.value.pause();
    audioPlayerRef.value.currentTime = 0;
  }
});

const scrollOffers = (direction) => {
  if (offersContainerRef.value) {
    const card = offersContainerRef.value.querySelector('.offer-card');
    if (!card) return;
    const scrollAmount = (card.offsetWidth + 20) * direction * 2; // Scroll de aprox. 2 tarjetas
    offersContainerRef.value.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  }
};

const updateScrollButtonStates = () => {
  if (!offersContainerRef.value) return;
  const el = offersContainerRef.value;
  isScrollAtStart.value = el.scrollLeft < 10; // Pequeña tolerancia
  isScrollAtEnd.value = el.scrollLeft + el.clientWidth >= el.scrollWidth - 10; // Pequeña tolerancia
};

</script>

<style scoped>
.home-view {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

/* Hero Section */
.hero-section {
  position: relative;
  text-align: center;
  padding: 60px 20px 60px 20px;
  background-color: #3498db; /* Color base si la imagen no carga o como fallback */
  background-image: url('@/assets/fondo-nubes.jpg'); /* Reemplaza con una imagen de fondo de nubes/cielo si tienes */
  background-size: cover;
  background-position: center;
  color: white;
  overflow: hidden; /* Para el overlay */
}

.hero-overlay { /* Opcional: para oscurecer un poco la imagen de fondo y que el texto resalte */
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(44, 62, 80, 0.3); /* Azul oscuro semitransparente */
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2; /* Sobre el overlay */
  max-width: 800px;
  margin: 0 auto;
}

.hero-animation-gif {
  width: 100%;
  max-width: 550px; /* Ajusta según el GIF */
  margin-bottom: 20px;
  border-radius: 10px;
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.3);
}

.hero-title {
  font-size: 3.2em;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.4);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.3em;
  margin-bottom: 30px;
  opacity: 0.9;
  line-height: 1.6;
}

.hero-cta-button {
  background-color: #2ecc71; /* Verde vibrante */
  color: white;
  padding: 15px 35px;
  font-size: 1.2em;
  border-radius: 8px;
  text-decoration: none;
  font-weight: bold;
  box-shadow: 0 4px 6px rgba(0,0,0,0.2);
  transition: all 0.3s ease;
  border: none;
}
.hero-cta-button:hover {
  background-color: #27ae60;
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 10px rgba(0,0,0,0.25);
}
audio { display: none; }

/* Sección Título (Reutilizable) */
.section-title {
  text-align: center;
  margin-bottom: 40px;
  font-weight: 600;
  font-size: 2.2em;
  color: #333;
  position: relative;
}
.section-title::after { /* Subrayado decorativo */
  content: '';
  display: block;
  width: 70px;
  height: 3px;
  background-color: #3498db;
  margin: 10px auto 0;
  border-radius: 2px;
}


/* Sección Ofertas Destacadas */
.featured-offers-section {
  padding: 50px 20px;
  background-color: #f4f6f8; /* Fondo gris muy claro */
}
.blinking-icon {
  animation: blink-icon 1.5s infinite ease-in-out;
  display: inline-block;
}
@keyframes blink-icon {
  0%, 100% { transform: scale(1); opacity: 0.7; }
  50% { transform: scale(1.2); opacity: 1; }
}
.loading-indicator { text-align: center; padding: 40px; }
.spinner {
  border: 4px solid #f3f3f3; border-top: 4px solid #3498db;
  border-radius: 50%; width: 40px; height: 40px;
  animation: spin 1s linear infinite; margin: 0 auto 10px;
}
@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
.loading-indicator p { font-style: italic; color: #666; }

.no-offers-message { text-align: center; color: #777; font-size: 1.1em; padding: 20px; }

.scroll-wrapper { display: flex; align-items: center; justify-content: center; gap: 10px; }
.scroll-arrow {
  background-color: #fff; border: 1px solid #ccc; font-size: 1.8em; cursor: pointer;
  color: #3498db; width: 45px; height: 45px; border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); transition: all 0.2s ease;
}
.scroll-arrow:hover:not(:disabled) { background-color: #3498db; color: white; transform: scale(1.1); }
.scroll-arrow:disabled { color: #bbb; background-color: #e9ecef; cursor: not-allowed; }

.scroll-container {
  display: flex; overflow-x: auto; scroll-behavior: smooth; gap: 20px;
  width: 100%; max-width: calc(270px * 3 + 20px * 2 + 40px); /* 3 tarjetas + gaps + padding */
  padding: 20px; scrollbar-width: none; -ms-overflow-style: none;
}
.scroll-container::-webkit-scrollbar { display: none; }

.offer-card {
  min-width: 260px; max-width: 260px;
  background-color: white; border-radius: 12px; overflow: hidden;
  box-shadow: 0 6px 12px rgba(0,0,0,0.08); flex-shrink: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease; border: 1px solid #e7e7e7;
}
.offer-card:hover { transform: translateY(-8px); box-shadow: 0 10px 20px rgba(0,0,0,0.12); }
.offer-link { text-decoration: none; color: inherit; display: flex; flex-direction: column; height:100%; }

.offer-image-container { height: 150px; background-color: #e9ecef; overflow: hidden; }
.offer-image { width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease; }
.offer-card:hover .offer-image { transform: scale(1.05); }
.offer-image-placeholder { width: 100%; height: 100%; display:flex; align-items:center; justify-content:center; font-size:2.8em; color:#ced4da;}

.offer-info { padding: 15px; flex-grow:1; display:flex; flex-direction:column; }
.offer-class-badge {
  align-self: flex-start; background-color: #e9f5ff; color: #3498db;
  padding: 4px 8px; border-radius: 15px; font-size: 0.75em; font-weight: 600;
  margin-bottom: 8px; text-transform: uppercase;
}
.offer-info h4 { margin: 0 0 5px 0; font-size: 1.1em; font-weight: 600; color: #34495e; line-height: 1.3; }
.offer-info .flight-number { font-size: 0.8em; color: #7f8c8d; margin-bottom: 10px; display: block; }
.price-container { margin-bottom: auto; /* Empuja el precio y asientos hacia arriba */ }
.offer-info .offer-price {
  display: block; font-size: 1.5em; font-weight: 700;
  color: #e67e22; /* Naranja para el precio */ margin-bottom: 8px;
}
.seats-info { font-size: 0.85em; color: #27ae60; font-weight:500; margin-top: 8px;}
.seats-info.sold-out { color: #c0392b; }

/* Sección "Por Qué Elegirnos" */
.why-choose-us-section { padding: 60px 20px; background-color: #ffffff; }
.feature-list { display: flex; justify-content: space-around; flex-wrap: wrap; gap: 30px; max-width: 1100px; margin: 0 auto; }
.feature-item {
  background-color: #fff; padding: 30px 25px; border-radius: 10px;
  flex-basis: calc(33.333% - 30px); min-width: 280px; /* Ancho mínimo para 3 columnas */
  box-shadow: 0 4px 15px rgba(0,0,0,0.07); transition: transform 0.25s ease, box-shadow 0.25s ease;
  text-align: center;
}
.feature-item:hover { transform: translateY(-6px); box-shadow: 0 8px 20px rgba(0,0,0,0.1); }
.feature-icon-wrapper {
  background-color: #e3f2fd; /* Azul muy claro */ color: #3498db;
  width: 70px; height: 70px; border-radius: 50%;
  display: inline-flex; align-items: center; justify-content: center;
  margin-bottom: 20px;
}
.feature-item .icon { font-size: 2.5em; }
.feature-item h3 { font-size: 1.25em; margin-bottom: 12px; color: #2c3e50; font-weight: 600; }
.feature-item p { font-size: 0.95em; color: #555; line-height: 1.6; }

</style>