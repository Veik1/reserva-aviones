import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import RegisterView from '../views/RegisterView.vue'
import FlightsListView from '@/views/FlightsListView.vue'
import FlightDetailsView from '@/views/FlightDetailsView.vue'
import CreateBookingView from '@/views/CreateBookingView.vue'
import AdminFlightsView from '../views/AdminFlightsView.vue'
import AdminBookingsView from '../views/AdminBookingsView.vue'
import AdminFlightOfferingsView from '../views/AdminFlightOfferingsView.vue'
import MyBookingsView from '../views/MyBookingsView.vue'
import NotFoundView from '../views/NotFoundView.vue'

import { useAuthStore } from '@/store/auth'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', name: 'home', component: HomeView },
    { path: '/login', name: 'login', component: LoginView, meta: { guestOnly: true } },
    { path: '/register', name: 'register', component: RegisterView, meta: { guestOnly: true } },
    { path: '/flights', name: 'flights-list', component: FlightsListView },
    { path: '/flights/:id', name: 'flight-details', component: FlightDetailsView, props: true },
    {
      path: '/flights/:flightId/book',
      name: 'create-booking',
      component: CreateBookingView,
      props: true,
      meta: { requiresAuth: true },
    },
    {
      path: '/my-bookings',
      name: 'my-bookings',
      component: MyBookingsView,
      meta: { requiresAuth: true },
    },
    // Admin
    {
      path: '/admin/flights',
      name: 'admin-flights',
      component: AdminFlightsView,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/flights/:flightId/offerings',
      name: 'admin-flight-offerings',
      component: AdminFlightOfferingsView,
      props: true,
      meta: { requiresAdmin: true },
    },
    {
      path: '/admin/bookings',
      name: 'admin-bookings',
      component: AdminBookingsView,
      meta: { requiresAdmin: true },
    },
    // 404
    { path: '/:pathMatch(.*)*', name: 'NotFound', component: NotFoundView },
  ],
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const requiresAuth = to.matched.some((record) => record.meta.requiresAuth)
  const requiresAdmin = to.matched.some((record) => record.meta.requiresAdmin)
  const guestOnly = to.matched.some((record) => record.meta.guestOnly)

  if (guestOnly && authStore.isAuthenticated) {
    next({ name: 'home' })
  } else if (requiresAdmin && !authStore.isAdmin) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else if (requiresAuth && !authStore.isAuthenticated) {
    next({ name: 'login', query: { redirect: to.fullPath } })
  } else {
    next()
  }
})

export default router
