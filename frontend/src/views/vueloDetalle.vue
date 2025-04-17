<template>
  <div>
    <h2 class="text-xl font-bold mb-4">Detalle del Vuelo</h2>
    <div v-if="vuelo" class="border rounded-lg p-4 shadow">
      <h3 class="text-lg font-semibold">{{ vuelo.numero_vuelo }}</h3>
      <p><strong>Origen:</strong> {{ vuelo.origen }}</p>
      <p><strong>Destino:</strong> {{ vuelo.destino }}</p>
      <p><strong>Fecha:</strong> {{ new Date(vuelo.fecha).toLocaleString() }}</p>
    </div>
    <div v-else>
      <p class="text-red-500">Cargando detalles del vuelo...</p>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      vuelo: null,
    };
  },
  methods: {
    async cargarVuelo() {
      try {
        const response = await fetch(`/api/vuelos/${this.$route.params.id}`);
        if (!response.ok) {
          throw new Error('Error al obtener el vuelo');
        }
        this.vuelo = await response.json();
      } catch (error) {
        console.error('Error al cargar el vuelo:', error);
      }
    },
  },
  mounted() {
    this.cargarVuelo();
  },
};
</script>