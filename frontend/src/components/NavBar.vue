<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item brand-link">
        <img src="@/assets/Aerotravel.jpg" alt="AeroTravel Logo" class="brand-logo">
        <span class="brand-text">✈️ AeroTravel</span>
      </router-link>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/flights" class="navbar-item">Vuelos</router-link>
        <router-link
          v-if="authStore.isAuthenticated && !authStore.isAdmin"
          to="/my-bookings"
          class="navbar-item">Mis Reservas</router-link>
        <router-link v-if="authStore.isAdmin" to="/admin/flights" class="navbar-item">Gestionar Vuelos</router-link>
        <router-link v-if="authStore.isAdmin" to="/admin/bookings" class="navbar-item">Gestionar Reservas</router-link>
        <!-- Si implementas gestión de usuarios, irá aquí -->
        <!-- <router-link v-if="authStore.isAdmin" to="/admin/users" class="navbar-item">Gestionar Usuarios</router-link> -->
      </div>
      <!-- Eliminada la search-box de aquí -->
      <div class="navbar-end">
        <div v-if="authStore.isAuthenticated" class="navbar-item user-greeting">
          <span>¡Bienvenido, {{ authStore.currentUser?.name }}!</span>
          <button @click="handleLogout" class="button is-light logout-button">Cerrar sesión</button>
        </div>
        <div v-else class="navbar-item auth-buttons">
          <router-link to="/register" class="button is-primary">Registrarse</router-link>
          <router-link to="/login" class="button is-light">Iniciar sesión</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router'; // Aunque no se usa directamente, es común tenerlo

const authStore = useAuthStore();
const router = useRouter(); // Declarado pero no usado, puedes quitarlo si no lo necesitas

const handleLogout = () => {
  authStore.logout();
};
</script>
<!-- Eliminado el <script> de Options API que tenías para 'buscar' -->

<script>
export default {
  data() {
    return {
      query: ''
    };
  },
  methods: {
    buscar() {
      // Aquí podrías redirigir, filtrar, o llamar una API
      console.log("Buscando:", this.query);
    }
  }
}
</script>

<style scoped>
.navbar {
  background-color: #3498db; /* Azul principal */
  padding: 0.75rem 1.5rem; /* Más padding vertical y horizontal */
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1); /* Sombra sutil */
  position: sticky; /* Hacerla pegajosa arriba */
  top: 0;
  z-index: 100; /* Para que esté sobre otros elementos */
}

.navbar-brand .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
}

.brand-logo {
  height: 40px; /* Ajusta el tamaño de tu logo */
  margin-right: 10px;
  border-radius: 4px; /* Opcional: redondear bordes del logo */
}

.brand-text {
  font-weight: bold;
  font-size: 1.4em; /* Tamaño del texto de la marca */
}

.navbar-menu {
  display: flex;
  justify-content: space-between; /* Esto separará navbar-start y navbar-end */
  flex-grow: 1;
  align-items: center;
}

.navbar-start, .navbar-end {
  display: flex;
  align-items: center;
}

.navbar-start {
    margin-left: 20px; /* Espacio después del logo/marca */
}

.navbar-item {
  color: white;
  padding: 0.6rem 1rem; /* Padding ajustado para los items */
  text-decoration: none;
  margin: 0 5px; /* Espacio entre items */
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-weight: 500; /* Ligeramente más grueso */
}
.navbar-item:hover,
.navbar-item.router-link-exact-active { /* Estilo para el enlace activo */
  background-color: #2980b9; /* Un azul más oscuro al pasar el ratón o activo */
}

.navbar-end .user-greeting span {
  margin-right: 15px;
  font-size: 0.95em;
}
.navbar-end .auth-buttons .button {
    margin-left: 8px; /* Espacio entre botones de login/registro */
}

/* Estilos de botones (pueden estar aquí o en un archivo global) */
.button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px; /* Bordes un poco más redondeados */
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.2s ease, transform 0.1s ease;
}
.button:hover {
    transform: translateY(-1px); /* Efecto sutil al pasar el ratón */
}

.button.is-primary {
  background-color: #2ecc71; /* Verde */
  color: white;
}
.button.is-primary:hover { background-color: #27ae60; }

.button.is-light {
  background-color: #f0f8ff; /* Un blanco azulado muy claro */
  color: #3498db; /* Texto azul */
  border: 1px solid #add8e6; /* Borde azul claro */
}
.button.is-light:hover { background-color: #e6f2ff; }

.logout-button {
    background-color: #e74c3c; /* Rojo */
    color: white;
}
.logout-button:hover { background-color: #c0392b; }

/* Eliminados los estilos de .search-box */
</style>