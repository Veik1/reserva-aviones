
import axios from 'axios';
import { useAuthStore } from '@/store/auth'; // Adjust path if needed

// Define the base URL from environment variable or default
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Add a request interceptor to include the token
apiClient.interceptors.request.use(
    (config) => {
        const authStore = useAuthStore();
        const token = authStore.token;
        console.log(`[Interceptor] Petición a ${config.url}. Método: ${config.method}. ¿Token existe?: ${!!token}`); // <-- LOG DETALLADO
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
            console.log('[Interceptor] Token añadido a la cabecera.'); // <-- CONFIRMACIÓN
        } else {
            console.warn('[Interceptor] No se encontró token para añadir.'); // <-- ADVERTENCIA
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add a response interceptor for debugging/error handling (optional)
// apiClient.interceptors.response.use(
//  (response) => {
//      console.log('Received response:', response); // Debugging responses
//      return response;
//  },
//  (error) => {
//      console.error('API Error:', error.response || error.message); // Debugging errors
//      if (error.response && error.response.status === 401) {
//          // Handle unauthorized errors, e.g., logout user
//          const authStore = useAuthStore();
//          authStore.logout();
//          // Optionally redirect to login
//          // router.push('/login'); // Need to import router here or handle in component
//      }
//      return Promise.reject(error);
//  }
// );


// --- Auth Service ---
export const registerUser = (userData) => apiClient.post('/auth/register', userData);
export const loginUser = (credentials) => apiClient.post('/auth/login', credentials);

// --- Flight Service ---
export const fetchFlights = () => apiClient.get('/flights');
export const fetchFlightById = (id) => apiClient.get(`/flights/${id}`);
export const createFlight = (flightData) => apiClient.post('/flights', flightData); // Needs admin token
export const updateFlight = (id, flightData) => apiClient.put(`/flights/${id}`, flightData); // Needs admin token
export const deleteFlight = (id) => apiClient.delete(`/flights/${id}`); // Needs admin token

// --- FlightOffering Service (AÑADE ESTA SECCIÓN COMPLETA) ---
export const fetchOfferingsByFlight = (flightId) => apiClient.get(`/flightofferings/flight/${flightId}`);
export const createFlightOffering = (offeringData) => apiClient.post('/flightofferings', offeringData);
export const updateFlightOffering = (offeringId, offeringData) => apiClient.put(`/flightofferings/${offeringId}`, offeringData);
export const deleteFlightOffering = (offeringId) => apiClient.delete(`/flightofferings/${offeringId}`);


// --- FlightClass Service (NUEVO) ---
export const fetchFlightClasses = () => apiClient.get('/flightclasses');

// --- City Service (NUEVO) ---
export const fetchCities = () => apiClient.get('/cities');

// --- Airport Service (NUEVO) ---
export const fetchAirports = (params) => apiClient.get('/airports', { params }); // params puede ser { cityId: '...' } o { search: '...' }

// --- Booking Service ---
export const createBooking = (bookingData) => apiClient.post('/bookings', bookingData); // Needs user/admin token
export const fetchBookings = () => apiClient.get('/bookings'); // Needs admin token
// --- NUEVA FUNCIÓN ---
export const fetchMyBookings = () => apiClient.get('/bookings/my'); // Para usuario logueado

export const fetchBookingById = (id) => apiClient.get(`/bookings/${id}`); // Needs user/admin token
export const updateBooking = (id, bookingData) => apiClient.put(`/bookings/${id}`, bookingData); // Needs user/admin token
export const deleteBooking = (id) => apiClient.delete(`/bookings/${id}`); // Needs admin token

export const fetchSeatsByOffering = (offeringId) => apiClient.get(`/flightofferings/${offeringId}/seats`);

export default apiClient; // Export the configured instance
