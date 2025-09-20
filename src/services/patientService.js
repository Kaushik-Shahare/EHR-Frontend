import api from './apiService';
import Cookies from 'js-cookie';

/**
 * Service for handling patient-specific operations
 * Covers all patient APIs from the documentation including documents, emergency access, visits, NFC, and access requests
 */
const patientService = {
  
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
   * Get all documents for the logged-in patient
   * GET /api/ehr/patient/documents/
   */
  async getMyDocuments() {
    try {
      const response = await api.get('/api/ehr/patient/documents/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get patient documents error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch documents' };
    }
  },

  /**
   * Upload a new document as patient
   * POST /api/ehr/patient/documents/
   */
  async uploadDocument(formData) {
    try {
      const response = await api.post('/api/ehr/patient/documents/', formData, {
        ...this.getAuthHeaders(),
        headers: {
          ...this.getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Upload document error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to upload document' };
    }
  },

  /**
   * Delete a patient's document
   * DELETE /api/ehr/patient/documents/{document_id}/
   */
  async deleteDocument(documentId) {
    try {
      const response = await api.delete(`/api/ehr/patient/documents/${documentId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Delete document error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to delete document' };
    }
  },

  // ===== EMERGENCY ACCESS =====
  
  /**
   * Get all emergency-accessible documents
   * GET /api/ehr/patient/emergency-docs/
   */
  async getEmergencyDocuments() {
    try {
      const response = await api.get('/api/ehr/patient/emergency-docs/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get emergency documents error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch emergency documents' };
    }
  },

  /**
   * Update multiple documents' emergency access at once
   * POST /api/ehr/patient/emergency-docs/
   */
  async updateMultipleEmergencyDocs(documentIds, isEmergencyAccessible) {
    try {
      const response = await api.post('/api/ehr/patient/emergency-docs/', {
        document_ids: documentIds,
        is_emergency_accessible: isEmergencyAccessible
      }, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update multiple emergency docs error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update emergency access' };
    }
  },

  /**
   * Toggle emergency access for a single document
   * POST /api/ehr/documents/{document_id}/toggle_emergency_access/
   */
  async toggleSingleEmergencyDoc(documentId) {
    try {
      const response = await api.post(`/api/ehr/documents/${documentId}/toggle_emergency_access/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Toggle emergency doc error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to toggle emergency access' };
    }
  },

  /**
   * Generate emergency access QR code
   * GET /api/ehr/emergency/generate-qr/
   */
  async generateEmergencyQR() {
    try {
      const response = await api.get('/api/ehr/emergency/generate-qr/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Generate emergency QR error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to generate emergency QR' };
    }
  },

  // ===== VISIT MANAGEMENT =====
  
  /**
   * Get all visits for the logged-in patient
   * GET /api/ehr/patient-visits/
   */
  async getMyVisits() {
    try {
      const response = await api.get('/api/ehr/patient-visits/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get patient visits error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch visits' };
    }
  },

  /**
   * View details of a specific patient visit
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
   * View all charges for a specific visit
   * GET /api/ehr/patient-visits/{visit_id}/charges/
   */
  async getVisitCharges(visitId) {
    try {
      const response = await api.get(`/api/ehr/patient-visits/${visitId}/charges/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get visit charges error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch visit charges' };
    }
  },

  // ===== NFC MANAGEMENT =====
  
  /**
   * Generate QR code for NFC card
   * GET /api/ehr/nfc/generate-qr/
   */
  async generateNfcQR() {
    try {
      const response = await api.get('/api/ehr/nfc/generate-qr/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Generate NFC QR error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to generate NFC QR' };
    }
  },

  /**
   * View patient's own NFC card
   * GET /api/ehr/nfc-cards/
   */
  async getMyNfcCard() {
    try {
      const response = await api.get('/api/ehr/nfc-cards/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC card' };
    }
  },

  /**
   * View patient's own NFC sessions
   * GET /api/ehr/nfc-sessions/
   */
  async getMySessions() {
    try {
      const response = await api.get('/api/ehr/nfc-sessions/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC sessions error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC sessions' };
    }
  },

  /**
   * Invalidate an NFC session (patient can invalidate their own)
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

  // ===== ACCESS MANAGEMENT =====
  
  /**
   * View access requests made to the patient
   * GET /api/ehr/access-requests/
   */
  async getAccessRequests() {
    try {
      const response = await api.get('/api/ehr/access-requests/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get access requests error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch access requests' };
    }
  },

  /**
   * Approve or reject an access request (Patient)
   * This would typically be PUT/PATCH /api/ehr/access-requests/{request_id}/
   */
  async respondToAccessRequest(requestId, action, reason = null) {
    try {
      const response = await api.post(`/api/ehr/access-requests/${requestId}/${action}/`, 
        reason ? { reason } : {}, 
        this.getAuthHeaders()
      );
      return response.data.data || response.data;
    } catch (error) {
      console.error('Respond to access request error:', error.response?.data || error);
      throw error.response?.data || { message: `Failed to ${action} access request` };
    }
  },

  // ===== BACKWARD COMPATIBILITY (keeping existing methods for components that use them) =====
  
  /**
   * Get a patient by ID with detailed information
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} - Patient data with visits and document count
   */
  async getPatientById(patientId) {
    try {
      const response = await api.get(`/api/ehr/patient/${patientId}/`, this.getAuthHeaders());
      
      return response.data;
    } catch (error) {
      console.error('Get patient by ID error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch patient data' };
    }
  },

  /**
   * Get a list of doctor's patients (for doctors)
   * This uses the patient-visits endpoint to get all patients the doctor has visits with
   * @returns {Promise<Array>} - List of patients
   */
  async getMyPatients() {
    try {
      // Get patient visits for the doctor
      const response = await api.get('/api/ehr/patient-visits/');
      
      // Handle paginated response format: { count, next, previous, results }
      let visits = [];
      if (response.data && response.data.results && Array.isArray(response.data.results)) {
        visits = response.data.results;
      } else if (Array.isArray(response.data)) {
        visits = response.data;
      } else if (response.data && response.data.data && Array.isArray(response.data.data)) {
        visits = response.data.data;
      }
      
      console.log("Patient visits response:", response.data);
      console.log("Extracted visits array:", visits);
      
      // Since the visits already contain complete patient information (patient_name, etc.),
      // we can return the visits directly
      if (visits.length === 0) {
        return { results: [], count: 0 };
      }
      
      // Return the visits in the same format as the API
      return { 
        results: visits, 
        count: response.data.count || visits.length,
        next: response.data.next || null,
        previous: response.data.previous || null
      };
    } catch (error) {
      console.error('Error fetching doctor patients:', error);
      throw error.response?.data || { message: 'Failed to fetch patients' };
    }
  },
  
  /**
   * Update patient vital signs
   * @param {string} visitId - Visit ID
   * @param {Object} vitalSignsData - Vital signs data
   * @returns {Promise<Object>} - Updated vital signs
   */
  async updateVitalSigns(visitId, vitalSignsData) {
    try {
      // Check if vital signs already exist for this visit
      const existingVitalSigns = await api.get('/api/ehr/vital-signs/', {
        params: { visit: visitId }
      });
      
      let response;
      if (existingVitalSigns.data.data && existingVitalSigns.data.data.length > 0) {
        // Update existing vital signs
        const vitalSignId = existingVitalSigns.data.data[0].id;
        response = await api.put(`/api/ehr/vital-signs/${vitalSignId}/`, {
          ...vitalSignsData,
          visit: visitId
        });
      } else {
        // Create new vital signs
        response = await api.post('/api/ehr/vital-signs/', {
          ...vitalSignsData,
          visit: visitId
        });
      }
      
      return response.data.data;
    } catch (error) {
      console.error('Error updating vital signs:', error);
      throw error.response?.data || { message: 'Failed to update vital signs' };
    }
  },
  
  /**
   * Add diagnosis to patient visit
   * @param {string} visitId - Visit ID
   * @param {Object} diagnosisData - Diagnosis data
   * @returns {Promise<Object>} - Created diagnosis
   */
  async addDiagnosis(visitId, diagnosisData) {
    try {
      const response = await api.post('/api/ehr/diagnoses/', {
        ...diagnosisData,
        visit: visitId
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      throw error.response?.data || { message: 'Failed to add diagnosis' };
    }
  },
  
  /**
   * Add prescription to patient visit
   * @param {string} visitId - Visit ID
   * @param {Object} prescriptionData - Prescription data
   * @returns {Promise<Object>} - Created prescription
   */
  async addPrescription(visitId, prescriptionData) {
    try {
      // Validate required fields
      if (!prescriptionData.medication_name || !prescriptionData.dosage || 
          !prescriptionData.frequency || !prescriptionData.duration || 
          !prescriptionData.start_date) {
        throw new Error('Missing required fields for prescription');
      }
      
      // Convert date fields to ISO format
      if (prescriptionData.start_date && !prescriptionData.start_date.includes('T')) {
        prescriptionData.start_date = new Date(prescriptionData.start_date).toISOString().split('T')[0];
      }
      
      if (prescriptionData.end_date && !prescriptionData.end_date.includes('T')) {
        prescriptionData.end_date = new Date(prescriptionData.end_date).toISOString().split('T')[0];
      }
      
      const response = await api.post('/api/ehr/prescriptions/', {
        ...prescriptionData,
        visit: visitId
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding prescription:', error);
      
      // Provide more specific error message based on backend response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid prescription data. Please check all fields and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to add prescriptions for this patient.');
      } else {
        throw error.response?.data || { message: 'Failed to add prescription' };
      }
    }
  },
  
  /**
   * Add lab result to patient visit
   * @param {string} visitId - Visit ID
   * @param {Object} labResultData - Lab result data
   * @returns {Promise<Object>} - Created lab result
   */
  async addLabResult(visitId, labResultData) {
    try {
      // Validate required fields
      if (!labResultData.test_name || !labResultData.test_date || !labResultData.result) {
        throw new Error('Missing required fields for lab result');
      }
      
      // Convert test_date to ISO format if it's not already
      if (labResultData.test_date && !labResultData.test_date.includes('T')) {
        labResultData.test_date = new Date(labResultData.test_date).toISOString();
      }
      
      const response = await api.post('/api/ehr/lab-results/', {
        ...labResultData,
        visit: visitId
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error adding lab result:', error);
      
      // Provide more specific error message based on backend response
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      } else if (error.response?.status === 400) {
        throw new Error('Invalid lab result data. Please check all fields and try again.');
      } else if (error.response?.status === 401) {
        throw new Error('Authentication required. Please log in again.');
      } else if (error.response?.status === 403) {
        throw new Error('You do not have permission to add lab results for this patient.');
      } else {
        throw error.response?.data || { message: 'Failed to add lab result' };
      }
    }
  },
  
  /**
   * Mark visit as completed
   * @param {string} visitId - Visit ID
   * @returns {Promise<Object>} - Updated visit
   */
  async completeVisit(visitId) {
    try {
      const response = await api.put(`/api/ehr/patient-visits/${visitId}/`, {
        status: 'completed',
        check_out_time: new Date().toISOString()
      });
      
      return response.data.data;
    } catch (error) {
      console.error('Error completing visit:', error);
      throw error.response?.data || { message: 'Failed to complete visit' };
    }
  },
  
  /**
   * Get all patients (for doctors)
   * @returns {Promise<Array>} - List of all patients
   */
  async getAllPatients() {
    try {
      const response = await api.get('/api/account/patients');
      return response.data.patients || response.data.data || [];
    } catch (error) {
      console.error('Error fetching all patients:', error);
      throw error.response?.data || { message: 'Failed to fetch patients' };
    }
  },
};

export default patientService;
