<!-- filepath: c:\Users\marti\OneDrive\Desktop\dev-pers\reserva-aviones\src\views\personasList.vue -->
<template>
  <v-container>
    <h2 class="text-center mb-4">Lista de Personas</h2>
    <v-row>
      <v-col v-for="persona in personas" :key="persona.id" cols="12" md="4">
        <v-card outlined>
          <v-card-title>{{ persona.nombre }} {{ persona.apellido }}</v-card-title>
          <v-card-text>
            <p><strong>Email:</strong> {{ persona.email }}</p>
          </v-card-text>
          <v-card-actions>
            <v-btn color="error" @click="eliminarPersona(persona.id)">Eliminar</v-btn>
          </v-card-actions>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  data() {
    return {
      personas: [],
    };
  },
  methods: {
    async cargarPersonas() {
      try {
        const response = await fetch('/api/personas');
        if (!response.ok) {
          throw new Error('Error al obtener las personas');
        }
        this.personas = await response.json();
      } catch (error) {
        console.error('Error al cargar personas:', error);
      }
    },
    async eliminarPersona(id) {
      if (window.confirm('¿Estás seguro de que deseas eliminar esta persona?')) {
        try {
          const response = await fetch(`/api/personas/${id}`, { method: 'DELETE' });
          if (response.ok) {
            this.cargarPersonas();
          }
        } catch (error) {
          console.error('Error al eliminar persona:', error);
        }
      }
    },
  },
  mounted() {
    this.cargarPersonas();
  },
};
</script>