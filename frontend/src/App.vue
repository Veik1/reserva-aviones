<template>
  <div id="app-layout">
    <Navbar />
    <main class="container">
      <RouterView />
    </main>
    <footer class="footer">
      <!-- Footer content -->
      <p>© {{ new Date().getFullYear() }} Reserva de Vuelos App</p>
    </footer>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router';
import Navbar from '@/components/Navbar.vue';
</script>

<style>
/* Basic Styling (add to src/assets/main.css or here) */
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  flex: 1;
  /*max-width: 90%;
  margin: 20px auto;*/
  padding: 0 20px;
  width: 100%;
  margin-top: 20;
  margin-bottom: 20px;
}

.footer {
  background-color: #f1f1f1;
  padding: 10px;
  text-align: center;
  margin-top: auto; /* Push footer to bottom */
}

/* Add more global styles or use a CSS framework */
</style>
