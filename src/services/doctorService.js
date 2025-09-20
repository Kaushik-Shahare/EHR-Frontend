import api from './apiService';
import Cookies from 'js-cookie';

/**
 * Service for handling doctor-specific operations
 * Covers all doctor APIs from the documentation including patient document access, access requests, NFC session management, and visit management
 */
const doctorService = {
  
  // Helper function to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  },

  // ===== PATIENT DOCUMENT ACCESS =====
  
  /**
   * View documents of a specific patient (requires approved access)
   * GET /api/ehr/doctor/patient/{patient_id}/documents/
   */
  async getPatientDocuments(patientId) {
    try {
      const response = await api.get(`/api/ehr/doctor/patient/${patientId}/documents/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get patient documents error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch patient documents' };
    }
  },

  /**
   * View all documents from patients who have granted access
   * GET /api/ehr/documents/
   */
  async getAllAccessibleDocuments() {
    try {
      const response = await api.get('/api/ehr/documents/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get accessible documents error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch accessible documents' };
    }
  },

  // ===== ACCESS REQUESTS =====
  
  /**
   * List all access requests made by this doctor
   * GET /api/ehr/access-requests/
   */
  async getMyAccessRequests() {
    try {
      const response = await api.get('/api/ehr/access-requests/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get access requests error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch access requests' };
    }
  },

  /**
   * Request access to a patient's documents
   * POST /api/ehr/access-requests/
   */
  async createAccessRequest(patientId, reason) {
    try {
      const response = await api.post('/api/ehr/access-requests/', {
        patient: patientId,
        reason: reason
      }, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create access request error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create access request' };
    }
  },

  /**
   * Check status of a specific access request
   * GET /api/ehr/access-requests/{request_id}/
   */
  async getAccessRequestStatus(requestId) {
    try {
      const response = await api.get(`/api/ehr/access-requests/${requestId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get access request status error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch access request status' };
    }
  },

  // ===== NFC SESSION MANAGEMENT =====
  
  /**
   * View active NFC sessions of patients with approved access
   * GET /api/ehr/nfc-sessions/
   */
  async getPatientNfcSessions() {
    try {
      const response = await api.get('/api/ehr/nfc-sessions/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC sessions error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC sessions' };
    }
  },

  /**
   * Verify an NFC session token during patient interaction
   * GET /api/ehr/nfc/verify-session/?token={session_token}
   */
  async verifyNfcSession(sessionToken) {
    try {
      const response = await api.get(`/api/ehr/nfc/verify-session/?token=${sessionToken}`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Verify NFC session error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to verify NFC session' };
    }
  },

  /**
   * View NFC cards of patients who have granted access
   * GET /api/ehr/nfc-cards/
   */
  async getPatientNfcCards() {
    try {
      const response = await api.get('/api/ehr/nfc-cards/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC cards error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC cards' };
    }
  },

  // ===== VISIT MANAGEMENT =====
  
  /**
   * Doctor can see visits of patients they attend
   * GET /api/ehr/patient-visits/
   */
  async getPatientVisits() {
    try {
      const response = await api.get('/api/ehr/patient-visits/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get patient visits error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch patient visits' };
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
   * Add an existing document to a visit
   * POST /api/ehr/patient-visits/{visit_id}/add_document/
   */
  async addDocumentToVisit(visitId, documentId) {
    try {
      const response = await api.post(`/api/ehr/patient-visits/${visitId}/add_document/`, {
        document_id: documentId
      }, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add document to visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add document to visit' };
    }
  },

  /**
   * Upload document to a visit
   * POST /api/ehr/patient-visits/{visit_id}/upload-document/
   */
  async uploadDocumentToVisit(visitId, formData) {
    try {
      const response = await api.post(`/api/ehr/patient-visits/${visitId}/upload-document/`, formData, {
        ...this.getAuthHeaders(),
        headers: {
          ...this.getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Upload document to visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to upload document to visit' };
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

  /**
   * Complete a visit and checkout the patient
   * POST /api/ehr/patient-visits/{visit_id}/checkout/
   */
  async checkoutPatient(visitId) {
    try {
      const response = await api.post(`/api/ehr/patient-visits/${visitId}/checkout/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Checkout patient error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to checkout patient' };
    }
  },

  // ===== MEDICAL REPORTS =====
  
  /**
   * Add vital signs to a visit
   * POST /api/ehr/vital-signs/?session_token={session_token}
   */
  async addVitalSigns(visitId, vitalSignsData, sessionToken = null) {
    try {
      const payload = {
        ...vitalSignsData,
        visit: visitId
      };
      
      const url = sessionToken 
        ? `/api/ehr/vital-signs/?session_token=${sessionToken}`
        : '/api/ehr/vital-signs/';
      
      const response = await api.post(url, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add vital signs error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add vital signs' };
    }
  },

  /**
   * Add diagnosis to a visit
   * POST /api/ehr/diagnoses/?session_token={session_token}
   */
  async addDiagnosis(visitId, diagnosisData, sessionToken = null) {
    try {
      const payload = {
        ...diagnosisData,
        visit: visitId
      };
      
      const url = sessionToken 
        ? `/api/ehr/diagnoses/?session_token=${sessionToken}`
        : '/api/ehr/diagnoses/';
      
      const response = await api.post(url, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add diagnosis error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add diagnosis' };
    }
  },

  /**
   * Add lab result to a visit
   * POST /api/ehr/lab-results/?session_token={session_token}
   */
  async addLabResult(visitId, labResultData, sessionToken = null) {
    try {
      const payload = {
        ...labResultData,
        visit: visitId
      };
      
      const url = sessionToken 
        ? `/api/ehr/lab-results/?session_token=${sessionToken}`
        : '/api/ehr/lab-results/';
      
      const response = await api.post(url, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add lab result error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add lab result' };
    }
  },

  /**
   * Add prescription to a visit
   * POST /api/ehr/prescriptions/?session_token={session_token}
   */
  async addPrescription(visitId, prescriptionData, sessionToken = null) {
    try {
      const payload = {
        ...prescriptionData,
        visit: visitId
      };
      
      const url = sessionToken 
        ? `/api/ehr/prescriptions/?session_token=${sessionToken}`
        : '/api/ehr/prescriptions/';
      
      const response = await api.post(url, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Add prescription error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to add prescription' };
    }
  },

  // ===== EMERGENCY ACCESS =====
  
  /**
   * Access emergency information with a token
   * GET /api/ehr/emergency-access/{token}/
   */
  async accessEmergencyInformation(token) {
    try {
      const response = await api.get(`/api/ehr/emergency-access/${token}/`);
      return response.data.data || response.data;
    } catch (error) {
      console.error('Access emergency information error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to access emergency information' };
    }
  }
};

export default doctorService;