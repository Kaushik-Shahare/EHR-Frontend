import api from './apiService';

/**
 * EHR Service for handling Electronic Health Record related API calls
 */
const ehrService = {
  /**
   * Fetch patient visits using a session token
   * @param {string} sessionToken - The NFC session token
   * @param {string|number} patientId - The patient ID
   * @returns {Promise} - API response with patient visits data
   */
  getPatientVisits: async (sessionToken, patientId) => {
    // First try the specific patient_visits endpoint
    try {
      console.log(`Fetching patient visits with session token and patientId ${patientId}`);
      return api.get('/api/ehr/patient-visits/patient_visits/', {
        params: {
          session_token: sessionToken,
          patient_id: patientId
        }
      });
    } catch (error) {
      console.warn("First patient visits endpoint failed, trying alternate endpoint...", error);
      // If that fails, try the alternative endpoint
      return api.get('/api/ehr/patient-visits/patient_visits/', {
        params: {
          session_token: sessionToken,
          patient_id: patientId
        }
      });
    }
  },

  /**
   * Fetch patient documents using a documents URL
   * @param {string} documentsUrl - The URL to fetch documents from
   * @returns {Promise} - API response with patient documents
   */
  getPatientDocuments: async (documentsUrl) => {
    // If documentsUrl is a relative path, use it as-is
    // If it's a full URL, just use it directly
    const endpoint = documentsUrl.startsWith('http') 
      ? documentsUrl 
      : documentsUrl;
    
    return api.get(endpoint);
  },

  /**
   * Add a document to a patient's record
   * @param {object} documentData - Document data to add
   * @param {string} sessionToken - The NFC session token
   * @returns {Promise} - API response
   */
  addPatientDocument: async (documentData, sessionToken) => {
    return api.post('/api/ehr/documents/', documentData, {
      params: { session_token: sessionToken }
    });
  },

  /**
   * Add a prescription to a patient's record
   * @param {object} prescriptionData - Prescription data to add
   * @param {string} sessionToken - The NFC session token
   * @returns {Promise} - API response
   */
  addPatientPrescription: async (prescriptionData, sessionToken) => {
    return api.post('/api/ehr/prescriptions/', prescriptionData, {
      params: { session_token: sessionToken }
    });
  },

  /**
   * Add lab results to a patient's record
   * @param {object} labResultData - Lab result data to add
   * @param {string} sessionToken - The NFC session token
   * @returns {Promise} - API response
   */
  addPatientLabResult: async (labResultData, sessionToken) => {
    return api.post('/api/ehr/lab-results/', labResultData, {
      params: { session_token: sessionToken }
    });
  },

  /**
   * Fetch a single patient visit record by ID
   * @param {string} sessionToken - The NFC session token
   * @param {string|number} visitId - The visit ID
   * @returns {Promise} - API response with detailed visit data
   */
  getPatientVisitById: async (sessionToken, visitId) => {
    console.log(`Fetching patient visit details for visit ID ${visitId}`);
    return api.get(`/api/ehr/patient-visits/${visitId}/`);
  }
};

export default ehrService;
