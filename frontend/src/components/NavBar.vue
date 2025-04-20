<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item brand">✈️ Reserva de Vuelos</router-link>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/flights" class="navbar-item">Vuelos</router-link>
        <router-link v-if="authStore.isAdmin" to="/admin/flights" class="navbar-item">Gestionar Vuelos</router-link>
        <router-link v-if="authStore.isAdmin" to="/admin/bookings" class="navbar-item">Gestionar Reservas</router-link>
        <!-- Add My Bookings link here if implementing -->
        <!-- <router-link v-if="authStore.isAuthenticated && !authStore.isAdmin" to="/my-bookings" class="navbar-item">My Bookings</router-link> -->
      </div>
      <div class="navbar-end">
        <div v-if="authStore.isAuthenticated" class="navbar-item">
          <span>¡Bienvenido, {{ authStore.currentUser?.name }}!</span>
          <button @click="handleLogout" class="button is-light logout-button">Cerrar sesión</button>
        </div>
        <div v-else class="navbar-item">
          <router-link to="/register" class="button is-primary">Registrarse</router-link>
          <router-link to="/login" class="button is-light">Iniciar sesión</router-link>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup>
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

const handleLogout = () => {
  authStore.logout();
  // Redirect handled within logout action
  // router.push('/login');
};
</script>

<style scoped>
/* Basic Navbar Styling */
.navbar {
  background-color: #3498db;
  padding: 0.5rem 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
}
.navbar-brand .brand {
    font-weight: bold;
    font-size: 1.2em;
}
.navbar-menu {
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  align-items: center;
}
.navbar-start, .navbar-end {
  display: flex;
  align-items: center;
}
.navbar-item {
  color: white;
  padding: 0.5rem 0.75rem;
  text-decoration: none;
  margin-left: 10px;
}
.navbar-item:hover, .navbar-item.router-link-active {
  background-color: #2980b9;
  border-radius: 4px;
}
.navbar-end .navbar-item {
    margin-left: 0; /* Reset margin for end items */
}
.navbar-end span {
    margin-right: 15px;
}
.button {
  margin-left: 10px;
  padding: 8px 15px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}
.button.is-primary {
  background-color: #2ecc71;
  color: white;
}
.button.is-light {
  background-color: #ecf0f1;
  color: #333;
}
.logout-button {
    background-color: #e74c3c;
    color: white;
}
.logout-button:hover {
    background-color: #c0392b;
}

/* Add more styles as needed */
</style>
