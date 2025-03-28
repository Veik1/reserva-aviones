import { createRouter, createWebHistory } from 'vue-router';
import VuelosList from '../views/VuelosList.vue';

const routes = [
  {
    path: '/',
    name: 'Vuelos',
    component: VuelosList
  },
  {
    path: '/vuelos/:id',
    name: 'VueloDetalle',
    component: () => import('../views/VueloDetalle.vue')
  }
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;