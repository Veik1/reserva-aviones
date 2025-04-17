<!-- filepath: c:\Users\marti\OneDrive\Desktop\dev-pers\reserva-aviones\src\App.vue -->
<template>
  <v-app>
    <!-- Barra de Navegación -->
    <NavBar />

    <!-- Contenido principal -->
    <v-main>
      <router-view />
    </v-main>

    <!-- Pie de página -->
    <v-footer app color="grey darken-3" dark>
      <v-container class="text-center">
        <p>&copy; 2025 Reserva de Aviones. Todos los derechos reservados.</p>
      </v-container>
    </v-footer>
  </v-app>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  name: 'App',
  components: {
    NavBar,
  },
};
</script>

<style>
/* Puedes agregar estilos personalizados aquí si es necesario */
</style>