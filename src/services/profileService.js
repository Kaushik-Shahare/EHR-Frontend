import api from './apiService';

const profileService = {
  // Get current user profile
  async getProfile() {
    try {
      const response = await api.get('/api/auth/profile/');
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error getting profile:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to get profile' };
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.put('/api/auth/profile/', profileData);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error updating profile:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update profile' };
    }
  }
};

export default profileService;
