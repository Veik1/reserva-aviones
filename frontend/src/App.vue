<template>
  <div id="app-layout">
    <NavBar />
    <main class="container">
      <RouterView />
    </main>
    <footer class="footer">
      <p>© {{ new Date().getFullYear() }} Reserva de Vuelos App</p>
      <p>© Martin Lamas - Facundo Mentoro - Sandra Romero - Gonzalo Arizza - Eduardo Arizza</p>
    </footer>
  </div>
</template>

<script setup>
import { RouterView } from 'vue-router'
import NavBar from './components/NavBar.vue'
</script>

<style>
#app-layout {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.container {
  flex: 1;
  padding: 0 20px;
  width: 100%;
  margin-top: 20px;
  margin-bottom: 20px;
}

.footer {
  background-color: #f1f1f1;
  padding: 10px;
  text-align: center;
  margin-top: auto;
}
</style>