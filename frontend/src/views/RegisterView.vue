<template>
    <div class="register-view">
      <h2>Registro</h2>
      <AlertMessage v-if="errorMessage" type="error" :message="errorMessage" />
      <AlertMessage v-if="successMessage" type="success" :message="successMessage" />
  
      <form @submit.prevent="handleRegister" v-if="!successMessage">
        <div class="form-group">
          <label for="name">Nombre:</label>
          <input type="text" id="name" v-model="name" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="email" required>
        </div>
        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña:</label>
          <input type="password" id="confirmPassword" v-model="confirmPassword" required>
        </div>
        <button type="submit" :disabled="loading">{{ loading ? 'Registrando...' : 'Registrar' }}</button>
      </form>
      <p v-if="!successMessage">¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
      <p v-if="successMessage"><router-link to="/login">Proceder a Iniciar sesión</router-link></p>
    </div>
</template>
  
<script setup>
import { ref } from 'vue';
import { useAuthStore } from '@/store/auth';
import AlertMessage from '@/components/AlertMessage.vue';
import { useRouter } from 'vue-router';

const name = ref('');
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter();
  
const handleRegister = async () => {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (password.value !== confirmPassword.value) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    loading.value = false;
    return;
  }

  try {
    await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value
    });
    // Option 1: Login automatically handled within authStore.register
    successMessage.value = '¡Registro exitoso! Redireccionando...';
    // Redirect is handled by the store's login action after successful register+login

    // Option 2: Redirect to login page
    // successMessage.value = '¡Registro exitoso! Por favor inicia sesión.';
    // setTimeout(() => {
    //   router.push('/login');
    // }, 2000);


  } catch (error) {
    errorMessage.value = error.error || 'Registration failed. Please try again.';
    console.error("Detalles del error de registro:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Add form styles (similar to LoginView) */
.register-view { max-width: 400px; margin: 40px auto; padding: 20px; border: 1px solid #ccc; border-radius: 5px; background-color: #f9f9f9; }
h2 { text-align: center; color: #333; margin-bottom: 20px;}
.form-group { margin-bottom: 15px; }
label { display: block; margin-bottom: 5px; font-weight: bold; color: #555;}
input { width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 4px; box-sizing: border-box; }
button { width: 100%; padding: 10px 15px; background-color: #5cb85c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1em; }
button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
button:hover:not(:disabled) { background-color: #4cae4c; }
p { margin-top: 20px; text-align: center; font-size: 0.9em;}
a { color: #3498db; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>