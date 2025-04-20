<template>
  <div class="home-view">
    <header class="hero">
      <h1>Reserva de Vuelos!</h1>
      <p>Su destino principal para reservar vuelos de manera fácil y rápida.</p>
      <router-link to="/flights" class="button is-primary">Explorar Vuelos</router-link>
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

<script setup>
// No specific script logic needed for this simple home page
// Removed import TheWelcome from '../components/TheWelcome.vue'
</script>

<style scoped>
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