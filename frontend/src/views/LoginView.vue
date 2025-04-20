
<template>
	<div class="login-view">
	  <h2>Acceso</h2>
	  <AlertMessage v-if="errorMessage" type="error" :message="errorMessage" />
	  <form @submit.prevent="handleLogin">
	    <div class="form-group">
	      <label for="email">Email:</label>
	      <input type="email" id="email" v-model="email" required>
	    </div>
	    <div class="form-group">
	      <label for="password">Contraseña:</label>
	      <input type="password" id="password" v-model="password" required>
	    </div>
	    <button type="submit" :disabled="loading">{{ loading ? 'Iniciando sesión...' : 'Iniciar sesión' }}</button>
	  </form>
	   <p>¿No tienes una cuenta?<router-link to="/register">Regístrate aquí</router-link></p>
	  </div>
</template>
	
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import AlertMessage from '@/components/AlertMessage.vue';

const email = ref('');
const password = ref('');
const errorMessage = ref('');
const loading = ref(false);
const authStore = useAuthStore();

const handleLogin = async () => {
  loading.value = true;
  errorMessage.value = '';
 try {
	    await authStore.login({ email: email.value, password: password.value });
	    // Redirect is handled within the login action
	  } catch (error) {
	    errorMessage.value = error.error || 'Correo electrónico o contraseña no válidos.'; // Use error message from backend if available
	  } finally {
	    loading.value = false;
	  }
};
</script>

<style scoped>
/* Add form styles */
.login-view { max-width: 400px; margin: 40px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px;}
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; }
input { width: 100%; padding: 8px; border: 1px solid #ccc; border-radius: 3px; box-sizing: border-box; }
button { padding: 10px 15px; background-color: #3498db; color: white; border: none; border-radius: 3px; cursor: pointer; }
button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
p { margin-top: 15px; text-align: center;}
</style>
