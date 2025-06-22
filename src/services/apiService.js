import axios from 'axios';
import Cookies from 'js-cookie';

// Use the backend URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage first, then fallback to cookies for consistency
    const token = localStorage.getItem('token') || Cookies.get('token');
    
    // Log for debugging purposes (remove in production)
    console.log(`API Request to: ${config.url}`);
    console.log(`Token available: ${!!token}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error(`API Error Response: ${error.config?.url || 'unknown endpoint'}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);

export default api;
