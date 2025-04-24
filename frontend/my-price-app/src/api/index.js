// src/api/index.js
import axios from 'axios';
import useAuthStore from '../store';

const apiClient = axios.create({
    baseURL: 'http://localhost:5000/api', // Your Flask API base URL
    
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add the token
apiClient.interceptors.request.use(
    (config) => {
        const token = useAuthStore.getState().token;
        if (token) {
            config.headers['Authorization'] = `Bearer ${token}`;
        }
        // console.log('Starting Request:', config); // Debugging requests
        return config;
    },
    (error) => {
        console.error('Request Error Interceptor:', error);
        return Promise.reject(error);
    }
);

// Response interceptor for handling global errors like 401
apiClient.interceptors.response.use(
    (response) => response, // Pass through successful responses
    (error) => {
        console.error('Response Error Interceptor:', error.response || error);
        if (error.response && error.response.status === 401) {
            // Unauthorized - Token likely invalid or expired
            console.warn("Unauthorized (401) Response - Logging out.");
            // Check if already logged out to prevent loops
            if (useAuthStore.getState().isLoggedIn) {
                 useAuthStore.getState().logout();
                 // Redirect to login - Ensure this doesn't cause loops
                 // It might be safer to let components handle redirect based on isLoggedIn state change
                 if (window.location.pathname !== '/login') {
                    window.location.href = '/login'; // Force redirect
                 }
            }
        }
        // Important: Always reject the promise so component-level .catch() works
        return Promise.reject(error);
    }
);

export default apiClient;