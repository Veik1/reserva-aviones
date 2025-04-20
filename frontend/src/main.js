
import './assets/main.css' // Basic CSS reset/styling

import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router'

const app = createApp(App)

app.use(createPinia()) // Use Pinia
app.use(router)      // Use Vue Router

// Make sure Pinia is ready before mounting, especially for router guards
// No explicit wait needed here usually, Pinia setup is synchronous

app.mount('#app')

// Optional: Initial auth check after Pinia is active, though store does it internally
// import { useAuthStore } from './store/auth';
// const authStore = useAuthStore(); // Get store instance
// authStore.checkAuth();
