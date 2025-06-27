import api from './apiService';

/**
 * Service for handling patient data and operations
 */
const patientService = {
  /**
   * Get patient data by ID (for doctors)
   * @param {string} patientId - Patient ID
   * @returns {Promise<Object>} - Patient data
   */
  async getPatientById(patientId) {
    try {
      console.log(`patientService: Fetching patient with ID ${patientId}`);

      // First, try the user profile endpoint
      try {
        const response = await api.get(`/api/auth/profile/`, {
          params: { user_id: patientId }
        });
        
        console.log('patientService: Profile response received:', response.data);
        
        // Extract patient data based on response format
        const patientData = response.data.data || response.data;
        
        if (patientData && (patientData.id || patientData.user_id)) {
          console.log('patientService: Valid patient data found');
          return patientData;
        } else {
          console.warn('patientService: Profile endpoint returned data without patient ID');
        }
      } catch (profileError) {
        console.warn('patientService: Profile endpoint failed, trying alternative', profileError);
      }
      
      // If profile endpoint fails or returns invalid data, try a direct patient endpoint
      try {
        const directResponse = await api.get(`/api/ehr/patients/${patientId}/`);
        console.log('patientService: Direct patient response:', directResponse.data);
        
        const directData = directResponse.data.data || directResponse.data;
        if (directData) {
          return directData;
        }
      } catch (directError) {
        console.warn('patientService: Direct patient endpoint failed', directError);
      }
      
      // If we still don't have data, create a minimal patient object
      console.warn('patientService: Could not retrieve full patient data, creating minimal patient object');
      return {
        id: patientId,
        profile: {
          name: `Patient ${patientId}`,
        },
        email: `patient${patientId}@example.com`,
      };
    } catch (error) {
      console.error(`Error fetching patient ${patientId}:`, error);
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
      
      // The data might be in different formats depending on the backend
      const visits = response.data.data || response.data || [];
      
      console.log("Patient visits response:", visits);
      
      // Extract unique patients from visits
      const patientMap = new Map();
      
      visits.forEach(visit => {
        // Handle different response structures
        if (visit.patient && typeof visit.patient === 'object') {
          // If the response includes complete patient objects
          patientMap.set(visit.patient.id, visit.patient);
        } else if (visit.patient && typeof visit.patient === 'number') {
          // If the response only includes patient IDs
          if (!patientMap.has(visit.patient)) {
            patientMap.set(visit.patient, {
              id: visit.patient,
              // We'll fetch more details below
            });
          }
        }
      });
      
      // For any patients where we only have IDs, fetch their complete data
      const patientPromises = Array.from(patientMap.values()).map(async (patient) => {
        if (!patient.email && !patient.name) {
          try {
            return await this.getPatientById(patient.id);
          } catch (err) {
            console.error(`Failed to get patient ${patient.id}:`, err);
            return patient; // Return at least the ID if we can't get full details
          }
        }
        return patient;
      });
      
      const patients = await Promise.all(patientPromises);
      return patients.filter(patient => patient !== null);
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
