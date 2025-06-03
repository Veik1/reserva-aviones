<template>
  <nav class="navbar">
    <div class="navbar-brand">
      <router-link to="/" class="navbar-item brand-link">
        <img src="@/assets/Aerotravel.jpg" alt="AeroTravel Logo" class="brand-logo" />
        <span class="brand-text">✈️ AeroTravel</span>
      </router-link>
    </div>
    <div class="navbar-menu">
      <div class="navbar-start">
        <router-link to="/" class="navbar-item">Inicio</router-link>
        <router-link to="/flights" class="navbar-item">Vuelos</router-link>
        <router-link
          v-if="authStore.isAuthenticated && !authStore.isAdmin"
          to="/my-bookings"
          class="navbar-item"
          >Mis Reservas</router-link
        >
        <router-link v-if="authStore.isAdmin" to="/admin/flights" class="navbar-item"
          >Gestionar Vuelos</router-link
        >
        <router-link v-if="authStore.isAdmin" to="/admin/bookings" class="navbar-item"
          >Gestionar Reservas</router-link
        >
      </div>
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
import { useAuthStore } from '@/store/auth'
const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<style scoped>
/* ...tus estilos previos, ya están bien... */
</style>

<style scoped>
.navbar {
  background-color: #3498db;
  padding: 0.75rem 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.navbar-brand .brand-link {
  display: flex;
  align-items: center;
  text-decoration: none;
  color: white;
}

.brand-logo {
  height: 40px;
  margin-right: 10px;
  border-radius: 4px;
}

.brand-text {
  font-weight: bold;
  font-size: 1.4em;
}

.navbar-menu {
  display: flex;
  justify-content: space-between;
  flex-grow: 1;
  align-items: center;
}

.navbar-start,
.navbar-end {
  display: flex;
  align-items: center;
}

.navbar-start {
  margin-left: 20px;
}

.navbar-item {
  color: white;
  padding: 0.6rem 1rem;
  text-decoration: none;
  margin: 0 5px;
  border-radius: 4px;
  transition: background-color 0.2s ease;
  font-weight: 500;
}
.navbar-item:hover,
.navbar-item.router-link-exact-active {
  background-color: #2980b9;
}

.navbar-end .user-greeting span {
  margin-right: 15px;
  font-size: 0.95em;
}
.navbar-end .auth-buttons .button {
  margin-left: 8px;
}

.button {
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-weight: 500;
  transition:
    background-color 0.2s ease,
    transform 0.1s ease;
}
.button:hover {
  transform: translateY(-1px);
}

.button.is-primary {
  background-color: #2ecc71;
  color: white;
}
.button.is-primary:hover {
  background-color: #27ae60;
}

.button.is-light {
  background-color: #f0f8ff;
  color: #3498db;
  border: 1px solid #add8e6;
}
.button.is-light:hover {
  background-color: #e6f2ff;
}

.logout-button {
  background-color: #e74c3c;
  color: white;
}
.logout-button:hover {
  background-color: #c0392b;
}
</style>
