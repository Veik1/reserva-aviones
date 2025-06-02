
import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import * as api from '@/services/api';
import router from '@/router'; // Import router for redirects

export const useAuthStore = defineStore('auth', () => {
    // --- State ---
    const user = ref(JSON.parse(localStorage.getItem('user') || 'null'));
    const token = ref(localStorage.getItem('token') || null);

    // --- Getters ---
    const isAuthenticated = computed(() => !!token.value && !!user.value);
    const isAdmin = computed(() => isAuthenticated.value && user.value?.role === 'admin');
    const currentUser = computed(() => user.value);
    const getToken = computed(() => token.value);

    // --- Actions ---
    async function register(userData) {
        try {
            await api.registerUser(userData);
            // Optionally login directly after registration or redirect to login
             await login({ email: userData.email, password: userData.password });
             // Or: router.push('/login');
        } catch (error) {
            console.error("Registration failed:", error.response?.data || error.message);
            throw error.response?.data || new Error("Registration failed");
        }
    }

    async function login(credentials) {
        try {
            const response = await api.loginUser(credentials);
            const userData = response.data.user;
            const userToken = response.data.token;

            // Update state
            user.value = userData;
            token.value = userToken;

            // Persist to localStorage
            localStorage.setItem('user', JSON.stringify(userData));
            localStorage.setItem('token', userToken);

            // Redirect after login
            if (isAdmin.value) {
                router.push('/admin/flights'); // Redirect admin to admin dashboard
            } else {
                router.push('/flights'); // Redirect regular user to flights list
            }
        } catch (error) {
            console.error("Login failed:", error.response?.data || error.message);
            logout(); // Clear any partial state on failure
            throw error.response?.data || new Error("Login failed");
        }
    }

    function logout() {
        // Clear state
        user.value = null;
        token.value = null;

        // Clear localStorage
        localStorage.removeItem('user');
        localStorage.removeItem('token');

        // Redirect to home or login page
        router.push('/login');
    }

    function checkAuth() {
        // This can be enhanced to verify token validity with backend if needed
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');
        if (storedUser && storedToken) {
            user.value = JSON.parse(storedUser);
            token.value = storedToken;
        } else {
            // Ensure state is cleared if localStorage is missing items
            user.value = null;
            token.value = null;
        }
    }

    // Check auth status when store is initialized
    checkAuth();

    return {
        user,
        token,
        isAuthenticated,
        isAdmin,
        currentUser,
        getToken,
        register,
        login,
        logout,
        checkAuth,
    };
});
