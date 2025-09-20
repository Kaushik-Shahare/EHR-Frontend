import api from './apiService';
import Cookies from 'js-cookie';

// Authentication service for interacting with the backend
const authService = {
  // Register a new user
  async register(userData) {
    try {
      const { email, password, user_type = 'Patient' } = userData;
      
      const requestData = {
        email,
        password,
        user_type
      };
      
      const response = await api.post('/api/auth/register/', requestData);
      
      // Return formatted response
      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data || null
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
      
      // Save tokens to both localStorage and cookies
      localStorage.setItem('token', access);
      localStorage.setItem('refreshToken', refresh);
      Cookies.set('token', access, { expires: 1 });
      
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

  // Forgot password
  async forgotPassword(email) {
    try {
      const response = await api.post('/api/auth/forgot-password/', { email });
      
      return {
        success: response.data.status,
        message: response.data.message,
        data: response.data.data || null
      };
    } catch (error) {
      console.error('Forgot password error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to send password reset email' };
    }
  },

  // Load authenticated user's data
  async loadUser() {
    try {
      // Get token from localStorage or cookies
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }
      
      // Try to get user profile with bearer token
      const response = await api.get('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      // Check if we have data and handle different response formats
      if (!response.data) {
        throw new Error('Empty response data');
      }
      
      const userData = response.data.data || response.data;
      
      return {
        user: userData,
        hasProfile: !!userData.profile,
      };
    } catch (error) {
      console.error('Load user error:', error.response?.data || error);
      
      if (error.response) {
        throw {
          message: `Server error: ${error.response.status}`,
          data: error.response.data,
          status: error.response.status
        };
      } else if (error.request) {
        throw { message: 'No response received from server. Please check your connection.' };
      } else {
        throw { message: `Request error: ${error.message}` };
      }
    }
  },

  // Logout user
  async logout() {
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      if (token) {
        // Call the logout API endpoint with token
        await api.post('/api/auth/logout/', {}, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
      }
    } catch (error) {
      console.error('Logout API error:', error);
      // Continue with local cleanup even if API logout fails
    }
    
    // Clean up local storage and cookies
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    Cookies.remove('token');
  },

  // Get list of doctors (Admin only)
  async getDoctors() {
    try {
      const token = localStorage.getItem('token') || Cookies.get('token');
      
      if (!token) {
        throw new Error('Authentication token not found');
      }

      const response = await api.get('/api/auth/doctors/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      return response.data.data || response.data;
    } catch (error) {
      console.error('Get doctors error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch doctors' };
    }
  }
};

export default authService;
