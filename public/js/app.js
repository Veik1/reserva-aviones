const { createApp } = Vue;

createApp({
  data() {
    return {
      titulo: 'Sistema de Reserva de Vuelos',
      vuelos: []
    }
  },
  mounted() {
    this.cargarVuelos();
  },
  methods: {
    async cargarVuelos() {
      const response = await fetch('/api/vuelos');
      this.vuelos = await response.json();
    }
  }
}).mount('#app');