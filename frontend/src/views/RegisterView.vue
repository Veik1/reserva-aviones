<template>
    <div class="register-view">
      <h2>Registro</h2>
      <AlertMessage v-if="errorMessage" type="error" :message="errorMessage" />
      <AlertMessage v-if="successMessage" type="success" :message="successMessage" />

      <form @submit.prevent="handleRegister" v-if="!successMessage">
        <div class="form-group">
          <label for="name">Nombre Completo:</label>
          <input type="text" id="name" v-model="formData.name" required>
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input type="email" id="email" v-model="formData.email" required>
        </div>

        <!-- Nuevos Campos -->
        <div class="form-group">
          <label for="dni">DNI (Documento Nacional de Identidad):</label>
          <input type="text" id="dni" v-model="formData.dni" placeholder="Ej: 12345678X">
        </div>
        <div class="form-group">
          <label for="fecha_nacimiento">Fecha de Nacimiento:</label>
          <input type="date" id="fecha_nacimiento" v-model="formData.fecha_nacimiento">
        </div>
        <div class="form-group">
          <label for="telefono">Teléfono (Opcional):</label>
          <input type="tel" id="telefono" v-model="formData.telefono" placeholder="Ej: +54 9 11 12345678">
        </div>
        <div class="form-group">
          <label for="direccion">Dirección (Opcional):</label>
          <input type="text" id="direccion" v-model="formData.direccion" placeholder="Ej: Calle Falsa 123, Ciudad">
        </div>
        <!-- Fin Nuevos Campos -->

        <div class="form-group">
          <label for="password">Contraseña:</label>
          <input type="password" id="password" v-model="formData.password" required>
        </div>
        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña:</label>
          <input type="password" id="confirmPassword" v-model="formData.confirmPassword" required>
        </div>
        <button type="submit" :disabled="loading">{{ loading ? 'Registrando...' : 'Registrar' }}</button>
      </form>
      <p v-if="!successMessage">¿Ya tienes una cuenta? <router-link to="/login">Inicia sesión aquí</router-link></p>
      <p v-if="successMessage"><router-link to="/login">Proceder a Iniciar sesión</router-link></p>
    </div>
</template>

<script setup>
import { ref, reactive } from 'vue'; // Importar reactive
import { useAuthStore } from '@/store/auth';
import AlertMessage from '@/components/AlertMessage.vue';
import { useRouter } from 'vue-router';

// Usar un objeto reactivo para agrupar los datos del formulario
const formData = reactive({
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  dni: '',
  fecha_nacimiento: '', // Se enviará como string YYYY-MM-DD
  telefono: '',
  direccion: ''
});

const errorMessage = ref('');
const successMessage = ref('');
const loading = ref(false);
const authStore = useAuthStore();
const router = useRouter(); // No se usa directamente aquí si el store maneja el redirect

const handleRegister = async () => {
  loading.value = true;
  errorMessage.value = '';
  successMessage.value = '';

  if (formData.password !== formData.confirmPassword) {
    errorMessage.value = 'Las contraseñas no coinciden.';
    loading.value = false;
    return;
  }

  // Validar edad (opcional, pero buena práctica aquí también)
  if (formData.fecha_nacimiento) {
    const hoy = new Date();
    const fechaNac = new Date(formData.fecha_nacimiento);
    let edad = hoy.getFullYear() - fechaNac.getFullYear();
    const mes = hoy.getMonth() - fechaNac.getMonth();
    if (mes < 0 || (mes === 0 && hoy.getDate() < fechaNac.getDate())) {
      edad--;
    }
    if (edad < 18) {
      errorMessage.value = 'Debes ser mayor de 18 años para registrarte.';
      loading.value = false;
      return;
    }
  } else {
    errorMessage.value = 'La fecha de nacimiento es requerida.';
    loading.value = false;
    return;
  }

  try {
    // Crear un objeto solo con los datos a enviar, omitiendo confirmPassword
    const userDataToRegister = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      dni: formData.dni || null, // Enviar null si está vacío y el backend lo permite
      fecha_nacimiento: formData.fecha_nacimiento || null,
      telefono: formData.telefono || null,
      direccion: formData.direccion || null
    };

    await authStore.register(userDataToRegister);
    successMessage.value = '¡Registro exitoso! Si el login automático está configurado, serás redirigido. Sino, procede a iniciar sesión.';
    // El authStore.register ahora debería manejar el login y redirect si está configurado así

  } catch (error) {
    errorMessage.value = error.error || error.message || 'El registro falló. Por favor, inténtalo de nuevo.';
    console.error("Detalles del error de registro:", error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
/* Los estilos existentes deberían funcionar bien. Ajusta el max-width si es necesario */
.register-view { max-width: 450px; /* Ligeramente más ancho para más campos */ margin: 40px auto; padding: 25px; border: 1px solid #ccc; border-radius: 8px; background-color: #f9f9f9; }
h2 { text-align: center; color: #333; margin-bottom: 25px;}
.form-group { margin-bottom: 18px; } /* Un poco más de espacio */
label { display: block; margin-bottom: 6px; font-weight: 500; color: #555;}
input { width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; box-sizing: border-box; font-size: 0.95em; }
input[type="date"] { color: #555; } /* Para que el texto del date input sea visible */
button { width: 100%; padding: 12px 15px; background-color: #5cb85c; color: white; border: none; border-radius: 4px; cursor: pointer; font-size: 1.05em; font-weight: 500; }
button:disabled { background-color: #bdc3c7; cursor: not-allowed; }
button:hover:not(:disabled) { background-color: #4cae4c; }
p { margin-top: 20px; text-align: center; font-size: 0.9em;}
a { color: #3498db; text-decoration: none; }
a:hover { text-decoration: underline; }
</style>