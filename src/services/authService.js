import api from './apiService';

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
      console.log("=============================================", response.data)
      // Extract tokens and user data from backend response format
      const { refresh, access, user } = response.data.data;
      
      // Save tokens
      localStorage.setItem('accesstoken', response.data.data.access);
      localStorage.setItem('refreshToken', response.data.data.refresh);
      
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
      // Try to get user profile with current token
      const response = await api.get('/api/auth/profile/');
      const userData = response.data.data || response.data;
      
      return {
        user: userData,
        hasProfile: !!userData.profile,
      };
    } catch (error) {
      console.error('Load user error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to load user data' };
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
