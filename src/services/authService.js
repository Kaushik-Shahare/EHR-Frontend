import api from './apiService';
import Cookies from 'js-cookie';

// Authentication service for interacting with the backend
const authService = {
  // Register a new user
  async register(userData) {
    try {
      const { email, password, firstName, lastName, role } = userData;
      
      // Always set user_type to 'Patient'
      const requestData = {
        email,
        password,
        user_type: 'Patient' // Always register as Patient
      };
      
      const response = await api.post('/api/auth/register/', requestData);
      
      // Return formatted response
      return {
        success: response.data.status,
        message: response.data.message,
      };
    } catch (error) {
      console.error('Registration error:', error.response?.data || error);
      throw error.response?.data || { message: 'Registration failed' };
    }
  },

  // Login user
  async login(email, password) {
    try {
      const response = await api.post('/api/auth/login/', { email, password });
      
      // Extract tokens and user data from backend response format
      const { refresh, access, user } = response.data.data;
      
      // Save tokens
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      
      // Return user data and tokens
      return {
        user,
        token: access,
        refreshToken: refresh,
        hasProfile: !!user.profile, // Check if profile exists
      };
    } catch (error) {
      console.error('Login error:', error.response?.data || error);
      throw error.response?.data || { message: 'Login failed' };
    }
  },

  // Load authenticated user's data
  async loadUser() {
    try {
      // Get token from localStorage or cookies
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      console.log('Token found:', !!token); // Debug if token exists
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      console.log('Making API request to /api/auth/profile/');
      
      // Try to get user profile with bearer token explicitly included
      const response = await api.get('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile API response:', response); // Log full response for debugging
      
      // Check if we have data and handle different response formats
      if (!response.data) {
        throw new Error('Empty response data');
      }
      
      const userData = response.data.data || response.data;
      
      console.log('Extracted user data:', userData); // Debug the extracted data
      
      return {
        user: userData,
        hasProfile: !!userData.profile,
      };
    } catch (error) {
      // More detailed error logging
      console.error('Load user error details:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        stack: error.stack
      });
      
      // Throw a more informative error
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        throw {
          message: `Server error: ${error.response.status}`,
          data: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        // The request was made but no response was received
        throw { message: 'No response received from server. Please check your connection.' };
      } else {
        // Something happened in setting up the request that triggered an Error
        throw { message: `Request error: ${error.message}` };
      }
    }
  },

  // Logout user
  async logout() {
    try {
      // Call the logout API endpoint first
      await api.post('/api/auth/logout/');
    } catch (error) {
      console.error('Logout error:', error);
      // Continue with local cleanup even if API logout fails
    }
    
    // Clean up local storage and cookies
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
};

export default authService;
