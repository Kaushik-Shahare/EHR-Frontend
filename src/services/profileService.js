import api from './apiService';

// Service for managing user profile
const profileService = {
  // Get user profile
  async getProfile() {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found in localStorage');
        throw { message: 'Authentication token not found' };
      }

      // Make API request with explicit token
      const response = await api.get('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Full API Response:', response);
      console.log('Profile response data structure:', JSON.stringify(response.data, null, 2));
      
      // Check if the profile data is in response.data.data, response.data.profile or directly in response.data
      const profileData = response.data.data?.profile || response.data.profile || response.data;
      console.log('Extracted profile data:', profileData);
      
      return profileData;
    } catch (error) {
      console.error('Get profile error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch profile' };
    }
  },

  // Update user profile with complete data
  async updateProfile(profileData) {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found in localStorage');
        throw { message: 'Authentication token not found' };
      }
      
      // Make API request with explicit token
      const response = await api.put('/api/auth/profile/', profileData, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile update response:', response.data);
      const updatedProfile = response.data.data?.profile || response.data.profile || response.data;
      console.log('Updated profile data:', updatedProfile);
      
      return updatedProfile;
    } catch (error) {
      console.error('Update profile error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  },

  // Check if profile is complete
  async checkProfileStatus() {
    try {
      // Get token from localStorage
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No authentication token found in localStorage');
        throw { message: 'Authentication token not found' };
      }
      
      // Make API request with explicit token
      const response = await api.get('/api/auth/profile/', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      console.log('Profile status check response:', response.data);
      const profile = response.data.data?.profile || response.data.profile || response.data;
      console.log('Profile data extracted for status check:', profile);
      
      // Check if essential profile fields are filled
      const isComplete = !!profile && 
        !!profile.name && 
        !!profile.gender && 
        !!profile.date_of_birth && 
        !!profile.phone_number;
      
      return {
        profile,
        isComplete
      };
    } catch (error) {
      console.error('Profile status check error:', error.response?.data || error);
      return {
        profile: null,
        isComplete: false
      };
    }
  }
};

export default profileService;
