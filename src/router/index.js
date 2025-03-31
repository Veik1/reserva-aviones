import { createRouter, createWebHistory } from 'vue-router';
import Home from '../views/Home.vue';
import VuelosList from '../views/vuelosList.vue';
import VueloDetalle from '../views/vueloDetalle.vue';
import PersonasList from '../views/personasList.vue';
import ReservasList from '../views/reservasList.vue';
import GenerarReserva from '../views/GenerarReserva.vue';
import NotFound from '../views/NotFound.vue';
import TestVuetify from '../views/TestVuetify.vue'; // Importa el componente de prueba

const routes = [
  { path: '/', component: Home },
  { path: '/vuelos', component: VuelosList },
  { path: '/vuelos/:id', component: VueloDetalle },
  { path: '/personas', component: PersonasList },
  { path: '/reservas', component: ReservasList },
  { path: '/generar-reserva', component: GenerarReserva },
  { path: '/test-vuetify', component: TestVuetify }, // Ruta para el componente de prueba
  { path: '/:pathMatch(.*)*', component: NotFound },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;