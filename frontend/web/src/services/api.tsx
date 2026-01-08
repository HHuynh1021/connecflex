import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use(
  (config) => {
    const persistedState = localStorage.getItem("persist:auth");
    if (persistedState) {
      try {
        const authState = JSON.parse(persistedState);
        
        // The user object contains the access token
        const user = authState.user ? JSON.parse(authState.user) : null;
        const token = user?.access || user?.token;
        
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
      } catch (error) {
        console.error('Error parsing auth state:', error);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor for 401 errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Avoid redirect loop if already on /login
      if (window.location.pathname !== '/login') {
        // Clear persisted auth state
        localStorage.removeItem('persist:auth');
        // window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;