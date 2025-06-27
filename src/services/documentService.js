import api from './apiService';

/**
 * Service for handling document operations
 */
const documentService = {
  /**
   * Get all documents for the current user
   * @returns {Promise<Array>} List of documents
   */
  async getMyDocuments() {
    try {
      const response = await api.get('/api/ehr/patient/documents/');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error.response?.data || { message: 'Failed to fetch documents' };
    }
  },

  /**
   * Get documents for a specific patient (for doctors)
   * @param {string} patientId Patient ID
   * @returns {Promise<Array>} List of patient documents
   */
  async getPatientDocuments(patientId) {
    try {
      const response = await api.get(`/api/ehr/doctor/patient/${patientId}/documents/`);
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching documents for patient ${patientId}:`, error);
      throw error.response?.data || { message: 'Failed to fetch patient documents' };
    }
  },

  /**
   * Upload a new document
   * @param {FormData} formData Form data with file and metadata
   * @returns {Promise<Object>} Uploaded document data
   */
  async uploadDocument(formData) {
    try {
      const response = await api.post('/api/ehr/patient/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error.response?.data || { message: 'Failed to upload document' };
    }
  },

  /**
   * Download a document by ID
   * @param {string} documentId Document ID
   * @param {string} fileName Optional file name for download
   * @returns {Promise<void>} Promise that resolves when download starts
   */
  async downloadDocument(documentId, fileName = 'document') {
    try {
      // Get the document URL
      const response = await api.get(`/api/ehr/documents/${documentId}/download/`, {
        responseType: 'blob' // Important for file downloads
      });
      
      // Create a blob URL from the response data
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      
      // Create a temporary link and trigger download
      const link = document.createElement('a');
      link.href = url;
      
      // Set the file name, use a default if not provided
      if (!fileName.includes('.')) {
        // Try to determine file extension from response headers if available
        const contentType = response.headers['content-type'];
        if (contentType) {
          if (contentType.includes('pdf')) {
            fileName += '.pdf';
          } else if (contentType.includes('jpeg') || contentType.includes('jpg')) {
            fileName += '.jpg';
          } else if (contentType.includes('png')) {
            fileName += '.png';
          } else if (contentType.includes('docx') || contentType.includes('doc')) {
            fileName += '.docx';
          } else {
            fileName += '.pdf'; // Default to PDF if unknown
          }
        } else {
          fileName += '.pdf'; // Default to PDF if no content type
        }
      }
      
      link.download = fileName;
      
      // Append to body, click, and remove
      document.body.appendChild(link);
      link.click();
      
      // Clean up
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error.response?.data || { message: 'Failed to download document' };
    }
  },

  /**
   * Delete a document
   * @param {string} documentId Document ID to delete
   * @returns {Promise<Object>} Response data
   */
  async deleteDocument(documentId) {
    try {
      const response = await api.delete(`/api/ehr/patient/documents/${documentId}/`);
      return response.data;
    } catch (error) {
      console.error(`Error deleting document ${documentId}:`, error);
      throw error.response?.data || { message: 'Failed to delete document' };
    }
  },

  /**
   * Toggle emergency access for a document
   * @param {string} documentId Document ID
   * @returns {Promise<Object>} Updated document data
   */
  async toggleEmergencyAccess(documentId) {
    try {
      const response = await api.post(`/api/ehr/documents/${documentId}/toggle_emergency_access/`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error toggling emergency access for document ${documentId}:`, error);
      throw error.response?.data || { message: 'Failed to update emergency access' };
    }
  },

  /**
   * Get emergency accessible documents
   * @returns {Promise<Array>} List of emergency documents
   */
  async getEmergencyDocuments() {
    try {
      const response = await api.get('/api/ehr/patient/emergency-docs/');
      return response.data.data || [];
    } catch (error) {
      console.error('Error fetching emergency documents:', error);
      throw error.response?.data || { message: 'Failed to fetch emergency documents' };
    }
  },

  /**
   * Update emergency access for multiple documents
   * @param {Array} documentIds List of document IDs
   * @param {boolean} isAccessible Whether to make documents emergency accessible
   * @returns {Promise<Object>} Response data
   */
  async updateEmergencyAccess(documentIds, isAccessible = true) {
    try {
      const response = await api.post('/api/ehr/patient/emergency-docs/', {
        document_ids: documentIds,
        is_emergency_accessible: isAccessible
      });
      return response.data;
    } catch (error) {
      console.error('Error updating emergency access for documents:', error);
      throw error.response?.data || { message: 'Failed to update emergency access' };
    }
  },
  
  /**
   * Get documents associated with a specific visit
   * @param {string} visitId Visit ID
   * @returns {Promise<Array>} List of visit documents
   */
  async getVisitDocuments(visitId) {
    try {
      const response = await api.get('/api/ehr/documents/', {
        params: { visit: visitId }
      });
      return response.data.data || [];
    } catch (error) {
      console.error(`Error fetching documents for visit ${visitId}:`, error);
      throw error.response?.data || { message: 'Failed to fetch visit documents' };
    }
  },
  
  /**
   * Upload document for a specific visit
   * @param {FormData} formData Form data with file and metadata
   * @param {string} visitId Visit ID
   * @returns {Promise<Object>} Uploaded document data
   */
  async uploadVisitDocument(formData, visitId) {
    try {
      // Add visit ID to form data
      formData.append('visit', visitId);
      
      const response = await api.post('/api/ehr/documents/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error uploading document for visit ${visitId}:`, error);
      throw error.response?.data || { message: 'Failed to upload visit document' };
    }
  },
  
  /**
   * Get document by ID
   * @param {string} documentId Document ID
   * @returns {Promise<Object>} Document data
   */
  async getDocumentById(documentId) {
    try {
      const response = await api.get(`/api/ehr/documents/${documentId}/`);
      return response.data.data || response.data;
    } catch (error) {
      console.error(`Error fetching document ${documentId}:`, error);
      throw error.response?.data || { message: 'Failed to fetch document' };
    }
  }
};

export default documentService;
