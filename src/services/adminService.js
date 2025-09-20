import api from './apiService';
import Cookies from 'js-cookie';

/**
 * Service for handling admin-specific operations
 * Covers all admin APIs from the documentation including document management, access management, NFC management, and visit management
 */
const adminService = {
  
  // Helper function to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  },

  // ===== DOCUMENT MANAGEMENT =====
  
  /**
   * Admin can view all documents in the system
   * GET /api/ehr/documents/
   */
  async getAllDocuments() {
    try {
      const response = await api.get('/api/ehr/documents/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get all documents error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch all documents' };
    }
  },

  /**
   * View document details
   * GET /api/ehr/documents/{document_id}/
   */
  async getDocumentDetails(documentId) {
    try {
      const response = await api.get(`/api/ehr/documents/${documentId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get document details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch document details' };
    }
  },

  /**
   * Admin approves a document
   * POST /api/ehr/documents/{document_id}/approve/
   */
  async approveDocument(documentId) {
    try {
      const response = await api.post(`/api/ehr/documents/${documentId}/approve/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Approve document error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to approve document' };
    }
  },

  // ===== ACCESS MANAGEMENT =====
  
  /**
   * Admin can see all access requests
   * GET /api/ehr/access-requests/
   */
  async getAllAccessRequests() {
    try {
      const response = await api.get('/api/ehr/access-requests/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get all access requests error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch access requests' };
    }
  },

  /**
   * Admin approves an access request
   * POST /api/ehr/access-requests/{request_id}/approve/
   */
  async approveAccessRequest(requestId) {
    try {
      const response = await api.post(`/api/ehr/access-requests/${requestId}/approve/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Approve access request error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to approve access request' };
    }
  },

  // ===== NFC CARD MANAGEMENT =====
  
  /**
   * Admin can view all NFC cards
   * GET /api/ehr/nfc-cards/
   */
  async getAllNfcCards() {
    try {
      const response = await api.get('/api/ehr/nfc-cards/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get all NFC cards error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC cards' };
    }
  },

  /**
   * Admin creates an NFC card for a patient
   * POST /api/ehr/nfc-cards/
   */
  async createNfcCard(patientId, isActive = true) {
    try {
      const response = await api.post('/api/ehr/nfc-cards/', {
        patient: patientId,
        is_active: isActive
      }, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create NFC card' };
    }
  },

  /**
   * View details of a specific NFC card
   * GET /api/ehr/nfc-cards/{card_id}/
   */
  async getNfcCardDetails(cardId) {
    try {
      const response = await api.get(`/api/ehr/nfc-cards/${cardId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC card details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC card details' };
    }
  },

  /**
   * Activate or deactivate an NFC card
   * PATCH /api/ehr/nfc-cards/{card_id}/
   */
  async updateNfcCard(cardId, isActive) {
    try {
      const response = await api.patch(`/api/ehr/nfc-cards/${cardId}/`, {
        is_active: isActive
      }, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update NFC card' };
    }
  },

  // ===== VISIT MANAGEMENT =====
  
  /**
   * Admin can view all patient visits
   * GET /api/ehr/patient-visits/
   */
  async getAllVisits() {
    try {
      const response = await api.get('/api/ehr/patient-visits/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get all visits error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch visits' };
    }
  },

  /**
   * Get patient visit history for a specific patient
   * GET /api/ehr/patient-visits/patient_visits/?session_token={session_token}&patient_id={patient_id}
   */
  async getPatientVisitHistory(patientId, sessionToken = null) {
    try {
      const params = new URLSearchParams();
      if (sessionToken) params.append('session_token', sessionToken);
      if (patientId) params.append('patient_id', patientId);
      
      const response = await api.get(`/api/ehr/patient-visits/patient_visits/?${params}`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get patient visit history error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch patient visit history' };
    }
  },

  /**
   * Admin can create a new patient visit
   * POST /api/ehr/patient-visits/
   */
  async createVisit(visitData) {
    try {
      const response = await api.post('/api/ehr/patient-visits/', visitData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create visit' };
    }
  },

  /**
   * Get visit details
   * GET /api/ehr/patient-visits/{visit_id}/
   */
  async getVisitDetails(visitId) {
    try {
      const response = await api.get(`/api/ehr/patient-visits/${visitId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get visit details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch visit details' };
    }
  },

  /**
   * Update visit details
   * PATCH /api/ehr/patient-visits/{visit_id}/
   */
  async updateVisit(visitId, updateData) {
    try {
      const response = await api.patch(`/api/ehr/patient-visits/${visitId}/`, updateData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update visit' };
    }
  },

  /**
   * Admin can add billing charges to a visit
   * POST /api/ehr/patient-visits/{visit_id}/add_charge/
   */
  async addChargeToVisit(visitId, chargeData) {
    try {
      const response = await api.post(`/api/ehr/patient-visits/${visitId}/add_charge/`, chargeData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add charge to visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add charge to visit' };
    }
  },

  /**
   * Checkout visit
   * POST /api/ehr/patient-visits/{visit_id}/checkout/
   */
  async checkoutVisit(visitId) {
    try {
      const response = await api.post(`/api/ehr/patient-visits/${visitId}/checkout/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Checkout visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to checkout visit' };
    }
  },

  /**
   * Link an active NFC session to a visit
   * POST /api/ehr/patient-visits/{visit_id}/add_session/
   */
  async addSessionToVisit(visitId, sessionToken) {
    try {
      const response = await api.post(`/api/ehr/patient-visits/${visitId}/add_session/`, {
        session_token: sessionToken
      }, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add session to visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add session to visit' };
    }
  },

  // ===== SESSION MANAGEMENT =====
  
  /**
   * Admin can view all NFC sessions
   * GET /api/ehr/nfc-sessions/
   */
  async getAllSessions() {
    try {
      const response = await api.get('/api/ehr/nfc-sessions/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get all sessions error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch sessions' };
    }
  },

  /**
   * View details of a specific session
   * GET /api/ehr/nfc-sessions/{session_id}/
   */
  async getSessionDetails(sessionId) {
    try {
      const response = await api.get(`/api/ehr/nfc-sessions/${sessionId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get session details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch session details' };
    }
  },

  /**
   * Admin can invalidate any session
   * POST /api/ehr/nfc-sessions/{session_id}/invalidate/
   */
  async invalidateSession(sessionId) {
    try {
      const response = await api.post(`/api/ehr/nfc-sessions/${sessionId}/invalidate/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Invalidate session error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to invalidate session' };
    }
  },

  // ===== USER MANAGEMENT (from Auth APIs) =====
  
  /**
   * Get list of doctors (Admin only)
   * GET /api/auth/doctors/
   */
  async getDoctors() {
    try {
      const response = await api.get('/api/auth/doctors/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get doctors error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch doctors' };
    }
  }
};

export default adminService;