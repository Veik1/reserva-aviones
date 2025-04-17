<template>
  <div class="not-found">
    <h1 class="text-4xl font-bold text-red-500">404</h1>
    <p class="text-lg text-gray-700">La página que buscas no existe.</p>
    <router-link to="/" class="text-blue-500 underline">Volver al inicio</router-link>
  </div>
</template>

<script>
export default {
  name: 'NotFound',
};
</script>

<style scoped>
.not-found {
  text-align: center;
  margin-top: 50px;
}
</style>