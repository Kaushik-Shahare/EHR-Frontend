import axios from 'axios';
import Cookies from 'js-cookie';

// Use the backend URL from environment variables
const API_URL = `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL}`;

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // <-- Important for sending cookies
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from cookie first, then fallback to localStorage
    const token = Cookies.get('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


export const NfcTap = async (data) => {
  try {
    const response = await api.post(`/api/ehr/nfc/tap/${data}`);
    return response.data;
  } catch (error) {
    console.error('Error tapping NFC:', error);
    throw error.response?.data || { message: 'Failed to tap NFC' };
  }
};


export const NfcGetdocuments = async (data) => {
  try {
    const response = await api.post(`/api/ehr/nfc/read/${data}`);
    return response.data;
  } catch (error) {
    console.error('Error reading NFC:', error);
    throw error.response?.data || { message: 'Failed to read NFC' };
  }
};

export default api;
