import api from "./apiService";
import Cookies from 'js-cookie';

/**
 * Service for handling NFC-related operations
 * Covers all NFC APIs from the documentation including NFC tap, session management, and access control
 */
const nfcService = {
  
  // Helper function to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  },

  // ===== NFC TAP/READ =====
  
  /**
   * Handle NFC tap/read for card verification
   * POST /api/nfc/tap/
   */
  async nfcTap(cardId, patientId = null, deviceId = null, location = null) {
    try {
      const payload = {
        card_id: cardId,
        ...(patientId && { patient_id: patientId }),
        ...(deviceId && { device_id: deviceId }),
        ...(location && { location })
      };
      
      const response = await api.post('/api/nfc/tap/', payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('NFC tap error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to process NFC tap' };
    }
  },

  /**
   * Get NFC card information
   * GET /api/nfc/card/{card_id}/
   */
  async getNfcCard(cardId) {
    try {
      const response = await api.get(`/api/nfc/card/${cardId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC card information' };
    }
  },

  /**
   * Verify NFC card authenticity
   * POST /api/nfc/verify/
   */
  async verifyNfcCard(cardId, signature = null, timestamp = null) {
    try {
      const payload = {
        card_id: cardId,
        ...(signature && { signature }),
        ...(timestamp && { timestamp })
      };
      
      const response = await api.post('/api/nfc/verify/', payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Verify NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to verify NFC card' };
    }
  },

  // ===== NFC SESSION MANAGEMENT =====
  
  /**
   * Start NFC session for secure communication
   * POST /api/nfc/session/start/
   */
  async startNfcSession(cardId, sessionType = 'read', timeout = 300) {
    try {
      const payload = {
        card_id: cardId,
        session_type: sessionType,
        timeout: timeout
      };
      
      const response = await api.post('/api/nfc/session/start/', payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Start NFC session error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to start NFC session' };
    }
  },

  /**
   * End/close NFC session
   * POST /api/nfc/session/end/
   */
  async endNfcSession(sessionId) {
    try {
      const payload = {
        session_id: sessionId
      };
      
      const response = await api.post('/api/nfc/session/end/', payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('End NFC session error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to end NFC session' };
    }
  },

  /**
   * Get NFC session status
   * GET /api/nfc/session/{session_id}/status/
   */
  async getNfcSessionStatus(sessionId) {
    try {
      const response = await api.get(`/api/nfc/session/${sessionId}/status/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC session status error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to get NFC session status' };
    }
  },

  /**
   * Get active NFC sessions
   * GET /api/nfc/sessions/active/
   */
  async getActiveSessions() {
    try {
      const response = await api.get('/api/nfc/sessions/active/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get active sessions error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch active sessions' };
    }
  },

  // ===== NFC CARD MANAGEMENT (Admin/Doctor) =====
  
  /**
   * Register/create new NFC card
   * POST /api/nfc/cards/
   */
  async createNfcCard(cardData) {
    try {
      const response = await api.post('/api/nfc/cards/', cardData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create NFC card' };
    }
  },

  /**
   * Get all NFC cards (Admin/Doctor view)
   * GET /api/nfc/cards/
   */
  async getNfcCards(patientId = null, status = null, limit = null, offset = null) {
    try {
      let url = '/api/nfc/cards/';
      const params = new URLSearchParams();
      
      if (patientId) params.append('patient_id', patientId);
      if (status) params.append('status', status);
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC cards error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC cards' };
    }
  },

  /**
   * Update NFC card information
   * PUT /api/nfc/cards/{card_id}/
   */
  async updateNfcCard(cardId, cardData) {
    try {
      const response = await api.put(`/api/nfc/cards/${cardId}/`, cardData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update NFC card' };
    }
  },

  /**
   * Delete/deactivate NFC card
   * DELETE /api/nfc/cards/{card_id}/
   */
  async deleteNfcCard(cardId) {
    try {
      const response = await api.delete(`/api/nfc/cards/${cardId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Delete NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to delete NFC card' };
    }
  },

  /**
   * Assign NFC card to patient
   * POST /api/nfc/cards/{card_id}/assign/
   */
  async assignNfcCard(cardId, patientId, activateImmediately = false) {
    try {
      const payload = {
        patient_id: patientId,
        activate_immediately: activateImmediately
      };
      
      const response = await api.post(`/api/nfc/cards/${cardId}/assign/`, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Assign NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to assign NFC card' };
    }
  },

  /**
   * Activate NFC card
   * POST /api/nfc/cards/{card_id}/activate/
   */
  async activateNfcCard(cardId) {
    try {
      const response = await api.post(`/api/nfc/cards/${cardId}/activate/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Activate NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to activate NFC card' };
    }
  },

  /**
   * Deactivate NFC card
   * POST /api/nfc/cards/{card_id}/deactivate/
   */
  async deactivateNfcCard(cardId, reason = null) {
    try {
      const payload = reason ? { reason } : {};
      const response = await api.post(`/api/nfc/cards/${cardId}/deactivate/`, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Deactivate NFC card error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to deactivate NFC card' };
    }
  },

  // ===== NFC ACCESS LOGS =====
  
  /**
   * Get NFC access logs/history
   * GET /api/nfc/logs/
   */
  async getNfcLogs(cardId = null, patientId = null, startDate = null, endDate = null, limit = null) {
    try {
      let url = '/api/ehr/session-activities/';
      const params = new URLSearchParams();
      
      if (cardId) params.append('card_id', cardId);
      if (patientId) params.append('patient_id', patientId);
      if (startDate) params.append('start_date', startDate);
      if (endDate) params.append('end_date', endDate);
      if (limit) params.append('limit', limit);
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await api.get(url, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC logs error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC logs' };
    }
  },

  /**
   * Get specific NFC log entry
   * GET /api/nfc/logs/{log_id}/
   */
  async getNfcLogDetails(logId) {
    try {
      const response = await api.get(`/api/nfc/logs/${logId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get NFC log details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch NFC log details' };
    }
  },

  // ===== EMERGENCY ACCESS =====
  
  /**
   * Request emergency access via NFC
   * POST /api/nfc/emergency-access/
   */
  async requestEmergencyAccess(cardId, reason, requestorId) {
    try {
      const payload = {
        card_id: cardId,
        reason: reason,
        requestor_id: requestorId
      };
      
      const response = await api.post('/api/nfc/emergency-access/', payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Request emergency access error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to request emergency access' };
    }
  },

  /**
   * Grant emergency access
   * POST /api/nfc/emergency-access/{request_id}/grant/
   */
  async grantEmergencyAccess(requestId, duration = 60) {
    try {
      const payload = {
        duration_minutes: duration
      };
      
      const response = await api.post(`/api/nfc/emergency-access/${requestId}/grant/`, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Grant emergency access error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to grant emergency access' };
    }
  },

  // ===== UTILITY METHODS =====
  
  /**
   * Check if device supports NFC
   */
  isNfcSupported() {
    return 'NDEFReader' in window || navigator.nfc;
  },

  /**
   * Request NFC permissions (if supported)
   */
  async requestNfcPermissions() {
    try {
      if ('permissions' in navigator && 'nfc' in navigator.permissions) {
        const permission = await navigator.permissions.query({ name: 'nfc' });
        return permission.state;
      }
      return 'unsupported';
    } catch (error) {
      console.error('NFC permissions error:', error);
      return 'denied';
    }
  },

  /**
   * Initialize Web NFC reader (if supported)
   */
  async initializeNfcReader() {
    try {
      if ('NDEFReader' in window) {
        const ndef = new NDEFReader();
        await ndef.scan();
        return ndef;
      }
      throw new Error('Web NFC not supported');
    } catch (error) {
      console.error('Initialize NFC reader error:', error);
      throw error;
    }
  }
};

export { nfcService };
export default nfcService;
