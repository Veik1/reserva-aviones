
import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import LoginView from '../views/LoginView.vue';
import RegisterView from '../views/RegisterView.vue';
import FlightsListView from '../views/FlightsListView.vue';
import FlightDetailsView from '../views/FlightDetailsView.vue';
import CreateBookingView from '../views/CreateBookingView.vue';
import AdminFlightsView from '../views/AdminFlightsView.vue';
import AdminBookingsView from '../views/AdminBookingsView.vue';
import MyBookingsView from '../views/MyBookingsView.vue'; // Crear este archivo
import NotFoundView from '../views/NotFoundView.vue';

import { useAuthStore } from '@/store/auth';

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
            meta: { guestOnly: true } // Redirect if already logged in
        },
        {
            path: '/register',
            name: 'register',
            component: RegisterView,
            meta: { guestOnly: true } // Redirect if already logged in
        },
        {
            path: '/flights',
            name: 'flights-list',
            component: FlightsListView,
        },
        {
            path: '/flights/:id',
            name: 'flight-details',
            component: FlightDetailsView,
            props: true, // Pass route params as props
        },
        {
            path: '/flights/:flightId/book',
            name: 'create-booking',
            component: CreateBookingView,
            props: true,
            meta: { requiresAuth: true }, // Must be logged in to book
        },
        {
            path: '/my-bookings',
            name: 'my-bookings',
            component: MyBookingsView,
            meta: { requiresAuth: true } // Solo usuarios logueados
        },
        // --- Admin Routes --- 
        {
            path: '/admin/flights',
            name: 'admin-flights',
            component: AdminFlightsView,
            meta: { requiresAdmin: true },
        },
        {
            path: '/admin/bookings',
            name: 'admin-bookings',
            component: AdminBookingsView,
            meta: { requiresAdmin: true },
        },
        // --- Catch All ---
        {
            path: '/:pathMatch(.*)*', // Catch all 404
            name: 'NotFound',
            component: NotFoundView,
        },
    ],
});

// --- Navigation Guard ---
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore();
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const requiresAdmin = to.matched.some(record => record.meta.requiresAdmin);
    const guestOnly = to.matched.some(record => record.meta.guestOnly);

    // Ensure auth state is loaded (might be redundant if checkAuth runs early)
    // authStore.checkAuth(); // Be careful about calling this too often

    if (guestOnly && authStore.isAuthenticated) {
        // If trying to access login/register while logged in, redirect away
        next({ name: 'home' });
    } else if (requiresAdmin && !authStore.isAdmin) {
        // If admin required and user is not admin (or not logged in)
        console.warn('Admin access required for:', to.fullPath);
        next({ name: 'login', query: { redirect: to.fullPath } }); // Redirect to login, maybe show message
    } else if (requiresAuth && !authStore.isAuthenticated) {
        // If auth required and user is not logged in
        console.warn('Authentication required for:', to.fullPath);
        next({ name: 'login', query: { redirect: to.fullPath } }); // Redirect to login
    } else {
        // Otherwise, allow navigation
        next();
    }
});

export default router;