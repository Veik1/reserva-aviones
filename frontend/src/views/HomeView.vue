<template>
  <div class="home-view">
    <header class="hero">
      <img src="../assets/Aerotravel.jpg" alt="Avión volando" class="jpg">
      <!--<h1>Aero Travel</h1>-->
     <!-- <p>Su destino principal para reservar vuelos de manera fácil y rápida.</p>-->
       <!-- Aquí insertas el GIF -->
    <img src="../assets/Avion.gif" alt="Avión volando" class="gif" />
      <router-link to="/flights" class="button is-primary">Explorar Vuelos</router-link>

     <!-- Botón con ícono de parlante -->
    <button @click="playSound" class="sound-button">
      🔊
    </button>
    
    <!-- Elemento de audio oculto -->
    <audio ref="audioPlayer">
      <source src="../assets/SonidoAvion.mp3" type="audio/mpeg" />
    </audio>

    <div class="scroll-wrapper">
  <button @click="scrollLeft">⬅️</button>

  <div class="scroll-container" ref="scrollContainer" @scroll.passive="handleLoopScroll">
    <div class="flight-card"
     v-for="(vuelo, index) in loopedVuelos"
     :key="index + '-' + vuelo.id"
     :class="{ centered: index === centeredIndex }">
      <img :src="vuelo.imagen" class="flight-image" alt="Imagen de vuelo" />
      <div class="flight-info">
        <p><strong>{{ vuelo.origen }}</strong> → <strong>{{ vuelo.destino }}</strong></p>
        <span class="precio-anterior">Precio Anterior:</span>
        <span class="precio-original">${{ vuelo.precio }}</span>
        <span class="precio-descuento">Precio Oferta:</span>
        <span class="precio-oferta">${{ vuelo.oferta }}</span>
      </div>
    </div>
  </div>

  <button @click="scrollRight">➡️</button>
</div>


    </header>

    <section class="features">
      <h2>¿Por qué elegirnos?</h2>
      <div class="feature-list">
        <div class="feature-item">
          <span class="icon">✈️</span>
          <h3>Amplia Selección</h3>
          <p>Encuentra vuelos a numerosos destinos en todo el mundo.</p>
        </div>
        <div class="feature-item">
          <span class="icon">💲</span>
          <h3>Mejores precios</h3>
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

<script>
import axios from 'axios';

export default {
  data() {
  return {
    vuelos: [],
    autoScrollInterval: null,
    centeredIndex: 0,
  };
},

  computed: {
    // Duplicamos al menos una vez delante y una vez detrás
    loopedVuelos() {
      return [...this.vuelos, ...this.vuelos, ...this.vuelos];
    },
  },
  mounted() {
  this.cargarVuelos();

  this.autoScrollInterval = setInterval(() => {
  this.scrollRight();
  this.updateCenteredCard();
}, 3000);

},
onBeforeUnmount() {
  clearInterval(this.autoScrollInterval);
},

  methods: {

    playSound() {
      this.$refs.audioPlayer.play();
    },

    updateCenteredCard() {
  const container = this.$refs.scrollContainer;
  const cards = container.querySelectorAll(".flight-card");
  const containerRect = container.getBoundingClientRect();
  const containerCenter = containerRect.left + container.clientWidth / 2;

  let closestIndex = 0;
  let closestDistance = Infinity;

  cards.forEach((card, index) => {
    const cardRect = card.getBoundingClientRect();
    const cardCenter = cardRect.left + cardRect.width / 2;
    const distance = Math.abs(containerCenter - cardCenter);
    if (distance < closestDistance) {
      closestDistance = distance;
      closestIndex = index;
    }
  });

  this.centeredIndex = closestIndex;
},


    async cargarVuelos() {
      try {
        const idsDeseados = [
          "7e81cc49-08c1-4649-943e-582b12bdc6ea",
          "5bae500b-1ba6-45e1-bfc2-efd5d4dedffc",
          "b8f7a441-7a76-4cea-aae8-4d91817cbc25",
          "d0ba644f-62be-482d-af5a-ae34e7a9060d",
          "c7f03ebd-5d8c-4129-b984-28479d70d933"
        ];

        const response = await axios.get('http://localhost:5000/api/flights');
        const todos = response.data
          .filter(v => idsDeseados.includes(v.id))
          .map(v => {
            const precioOriginal = parseFloat(v.price);
            const precioOferta = (precioOriginal * 0.85).toFixed(2);
            return {
              id: v.id,
              origen: v.origin,
              destino: v.destination,
              precio: precioOriginal,
              oferta: precioOferta,
              imagen: v.image_url
            };
          });

        this.vuelos = todos;

        // Esperamos al siguiente tick para asegurar que scrollWidth esté listo
        this.$nextTick(() => {
          const container = this.$refs.scrollContainer;
          const widthPerSection = container.scrollWidth / 3;
          container.scrollLeft = widthPerSection; // Centra en el tramo original
        });
      } catch (error) {
        console.error('Error al cargar vuelos:', error);
      }
    },
    scrollLeft() {
      this.$refs.scrollContainer.scrollBy({ left: -220, behavior: 'smooth' });
    },
    scrollRight() {
      this.$refs.scrollContainer.scrollBy({ left: 220, behavior: 'smooth' });
    },
    handleLoopScroll() {
  const container = this.$refs.scrollContainer;
  const sectionWidth = container.scrollWidth / 3;

  if (container.scrollLeft <= 0) {
    container.scrollLeft = sectionWidth;
  } else if (container.scrollLeft >= sectionWidth * 2) {
    container.scrollLeft = sectionWidth;
  }

  this.updateCenteredCard();
},

  }
};
</script>




<style scoped>
.flight-card.centered {
  transform: scale(1.15);
  transition: transform 0.3s ease;
  z-index: 2;
}

.scroll-wrapper {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin-top: 2rem;
}

.scroll-container {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  gap: 1rem;
  width: 69%;
  padding: 1rem;
  border: 1px solid #ccc;
  border-radius: 10px;
  background-color: #fdfdfd;
}

/* Tarjeta de vuelo */
.flight-card {
  min-width: 220px;
  max-width: 220px;
  background-color: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  transform-origin: center center;
}

/* Imagen del vuelo */
.flight-image {
  width: 100%;
  height: 130px;
  object-fit: cover;
  border-bottom: 1px solid #ddd;
}

/* Info del vuelo */
.flight-info {
  padding: 0.75rem;
  font-size: 0.9rem;
  line-height: 1.4;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  color: #333;
}

.precio-original {
  text-decoration: line-through;
  color: #999;
  margin-right: 8px;
  font-size: 0.85rem;
}

.precio-oferta {
  color: #e60023;
  font-weight: bold;
  font-size: 1rem;
}

.flight-info p {
  margin: 0;
}
.sound-button {
  font-size: 0.8rem;
  padding: 0.4rem 1rem;
  border: none;
  background-color: #3273dc;
  color: white;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s ease;
}

.sound-button:hover {
  background-color: #2756a3;
}

.jpg {
  width: 500px;
  margin: 1rem auto;
  display: block;
}

.gif {
  width: 750px;
  margin: 1rem auto;
  display: block;
  border-radius: 10px;
}

.home-view {
  /*max-width: 1200px;*/
  margin: 0 auto;
  padding: 0 15px;
}

.hero {
  text-align: center;
  padding: 60px 20px;
  background-color: #3498db; /* Primary blue */
  color: white;
  border-radius: 8px;
  margin-bottom: 40px;
  margin-top: 20px;
}

.hero h1 {
  font-size: 2.8em;
  margin-bottom: 10px;
  font-weight: 600;
}

.hero p {
  font-size: 1.2em;
  margin-bottom: 30px;
  opacity: 0.9;
}

.button.is-primary {
  background-color: #ffffff;
  color: #3498db;
  padding: 12px 25px;
  font-size: 1.1em;
  border-radius: 5px;
  text-decoration: none;
  border: none;
  font-weight: bold;
  transition: background-color 0.2s ease, color 0.2s ease;
}

.button.is-primary:hover {
  background-color: #f1f1f1;
  color: #2980b9;
}

.features {
  padding: 40px 0;
  text-align: center;
}

.features h2 {
  font-size: 2em;
  margin-bottom: 30px;
  color: #333;
}

.feature-list {
  display: flex;
  justify-content: space-around;
  flex-wrap: wrap;
  gap: 20px;
}

.feature-item {
  background-color: #f9f9f9;
  padding: 25px;
  border-radius: 8px;
  flex-basis: calc(33% - 40px); /* Adjust based on gap */
  min-width: 250px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.08);
  transition: transform 0.2s ease;
}

.feature-item:hover {
    transform: translateY(-5px);
}

.feature-item .icon {
  font-size: 2.5em;
  display: block;
  margin-bottom: 15px;
}

.feature-item h3 {
  font-size: 1.4em;
  margin-bottom: 10px;
  color: #3498db;
}

.feature-item p {
  font-size: 1em;
  color: #666;
}
</style>