import api from './apiService';
import Cookies from 'js-cookie';

/**
 * EHR Service for patient visits and medical records
 */
const ehrService = {
  // Helper function to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  },

  /**
   * Get patient visits
   * GET /api/ehr/visits/
   */
  async getPatientVisits() {
    try {
      const response = await api.get('/api/ehr/patient-visits/');
      console.log('✅ Patient visits loaded:', response.data);
      // Handle both possible response structures for visits
      return response.data.data || response.data;
    } catch (error) {
      console.error('❌ Error loading patient visits:', error);
      throw error;
    }
  },

  async getVisitDocuments(visitId) {
    try {
      const response = await api.get(`/api/ehr/patient-visits/${visitId}/documents/`);
      console.log('✅ Visit documents loaded:', response.data);
      return response.data;
    } catch (error) {
      console.error('❌ Error loading visit documents:', error);
      throw error;
    }
  },

  /**
   * Get specific visit details
   * GET /api/ehr/visits/{visit_id}/
   */
  async getVisitDetails(visitId) {
    try {
      const response = await api.get(`/api/ehr/visits/${visitId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get visit details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch visit details' };
    }
  },

  /**
   * Create new visit
   * POST /api/ehr/visits/
   */
  async createVisit(visitData) {
    try {
      const response = await api.post('/api/ehr/visits/', visitData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create visit' };
    }
  },

  /**
   * Update visit
   * PUT /api/ehr/visits/{visit_id}/
   */
  async updateVisit(visitId, visitData) {
    try {
      const response = await api.put(`/api/ehr/visits/${visitId}/`, visitData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update visit' };
    }
  },

  /**
   * Complete visit
   * POST /api/ehr/visits/{visit_id}/complete/
   */
  async completeVisit(visitId, completionData = {}) {
    try {
      const response = await api.post(`/api/ehr/visits/${visitId}/complete/`, completionData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Complete visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to complete visit' };
    }
  },

  /**
   * Get visit vital signs
   * GET /api/ehr/visits/{visit_id}/vitals/
   */
  async getVisitVitalSigns(visitId) {
    try {
      const response = await api.get(`/api/ehr/visits/${visitId}/vitals/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get visit vital signs error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch vital signs' };
    }
  },

  /**
   * Add vital signs to visit
   * POST /api/ehr/visits/{visit_id}/vitals/
   */
  async addVitalSigns(visitId, vitalSignsData) {
    try {
      const response = await api.post(`/api/ehr/visits/${visitId}/vitals/`, vitalSignsData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add vital signs error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add vital signs' };
    }
  },

  /**
   * Get visit diagnoses
   * GET /api/ehr/visits/{visit_id}/diagnoses/
   */
  async getVisitDiagnoses(visitId) {
    try {
      const response = await api.get(`/api/ehr/visits/${visitId}/diagnoses/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get visit diagnoses error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch diagnoses' };
    }
  },

  /**
   * Add diagnosis to visit
   * POST /api/ehr/visits/{visit_id}/diagnoses/
   */
  async addDiagnosis(visitId, diagnosisData) {
    try {
      const response = await api.post(`/api/ehr/visits/${visitId}/diagnoses/`, diagnosisData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add diagnosis error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add diagnosis' };
    }
  },

  /**
   * Get visit prescriptions
   * GET /api/ehr/visits/{visit_id}/prescriptions/
   */
  async getVisitPrescriptions(visitId) {
    try {
      const response = await api.get(`/api/ehr/visits/${visitId}/prescriptions/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get visit prescriptions error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch prescriptions' };
    }
  },

  /**
   * Add prescription to visit
   * POST /api/ehr/visits/{visit_id}/prescriptions/
   */
  async addPrescription(visitId, prescriptionData) {
    try {
      const response = await api.post(`/api/ehr/visits/${visitId}/prescriptions/`, prescriptionData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add prescription error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add prescription' };
    }
  }
};

export default ehrService;
