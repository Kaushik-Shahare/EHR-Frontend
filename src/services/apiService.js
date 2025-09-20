import axios from 'axios';
import Cookies from 'js-cookie';

// Use the backend URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';

// Create an axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // <-- Important for sending cookies
});

// Add request interceptor for authentication
api.interceptors.request.use(
  (config) => {
    // Get token from cookie first, then fallback to localStorage

    // Get token from localStorage first, then fallback to cookies for consistency
    const token = localStorage.getItem('token') || Cookies.get('token');
    
    // Log for debugging purposes (remove in production)
    console.log(`API Request to: ${config.url}`);
    console.log(`Token available: ${!!token}`);
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    console.error('API request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
api.interceptors.response.use(
  (response) => {
    // Log successful responses for debugging
    console.log(`API Success Response from: ${response.config.url}`, {
      status: response.status,
      dataType: typeof response.data,
      isArray: Array.isArray(response.data),
      hasData: response.data && typeof response.data === 'object' ? 'data' in response.data : false,
      keys: response.data && typeof response.data === 'object' ? Object.keys(response.data) : []
    });
    return response;
  },
  (error) => {
    console.error(`API Error Response: ${error.config?.url || 'unknown endpoint'}`, {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    return Promise.reject(error);
  }
);


export const NfcTap = async (data) => {
  try {
    const response = await api.post(`/api/ehr/nfc/tap/${data}`);
    return response.data;
  } catch (error) {
    console.error('Error tapping NFC:', error);
    throw error.response?.data || { message: 'Failed to tap NFC' };
  }
};


export const NfcGetdocuments = async (data) => {
  try {
    const response = await api.post(`/api/ehr/nfc/read/${data}`);
    return response.data;
  } catch (error) {
    console.error('Error reading NFC:', error);
    throw error.response?.data || { message: 'Failed to read NFC' };
  }
};


export const getDoctors = async () => {
  try {
    const response = await api.get('/api/auth/doctors/');
    return response.data;
  } catch (error) {
    console.error('Error fetching doctors:', error);
    throw error.response?.data || { message: 'Failed to fetch doctors' };
  }
};

export const createVisit = async (data) => {
  try {
    const response = await api.post('/api/ehr/patient-visits/', data);
    return response.data;
  } catch (error) {
    console.error('Error creating visit:', error);
    throw error.response?.data || { message: 'Failed to create visit' };
  }
};


export const getPatientVisits = async (patientId) => {
  try {
    console.log('Making API call to fetch patient visits...');
    const response = await api.get(`/api/ehr/patient-visits/`);
    console.log('Patient visits API response:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient visits:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    // If it's a 401, provide specific auth error message
    if (error.response?.status === 401) {
      throw { 
        message: 'Authentication required. Please log in again.', 
        status: 401,
        requiresAuth: true 
      };
    }
    
    throw error.response?.data || { message: 'Failed to fetch patient visits' };
  }
};

export const getDoctorVisits = async (filters = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    // Add filters to query params
    if (filters.date) {
      queryParams.append('date', filters.date);
    }
    if (filters.date_range) {
      queryParams.append('date_range', filters.date_range);
    }
    if (filters.status) {
      queryParams.append('status', filters.status);
    } else {
      // Default to all statuses for calendar view
      queryParams.append('status', 'all');
    }
    
    const response = await api.get(`/api/ehr/patient-visits/?${queryParams.toString()}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching doctor visits:', {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      message: error.message,
      url: error.config?.url
    });
    
    // If it's a 401, provide specific auth error message
    if (error.response?.status === 401) {
      throw { 
        message: 'Authentication required. Please log in again.', 
        status: 401,
        requiresAuth: true 
      };
    }
    
    throw error.response?.data || { message: 'Failed to fetch doctor visits' };
  }
};

export const updatePatientVisit = async (visitId, data) => {
  try {
    const response = await api.patch(`/api/ehr/patient-visits/${visitId}/`, data);
    return response.data;
  } catch (error) {
    console.error('Error updating patient visit:', error);
    throw error.response?.data || { message: 'Failed to update patient visit' };
  }
};

export const getAllPoliciesofPatient = async (id) => {
  try {
    const response = await api.get(`/api/insurance/policies/patient_policies/?patient_id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance policies:', error);
    throw error.response?.data || { message: 'Failed to fetch insurance policies' };
  }
};


export const generateInsurancePolicy = async (data) => {
  try {
    const response = await api.post('/api/insurance/forms/auto_create_from_visit/', data);
    return response.data; 
  } catch (error) {
    console.error('Error generating insurance policy:', error);
    throw error.response?.data || { message: 'Failed to generate insurance policy' };
  }
};

export const verifyClaim = async (data) => {
  try {
    const response = await api.post(`/api/ai/verification/${data}/`);
    return response.data; 
  } catch (error) {
    console.error('Error verifying claim:', error);
    throw error.response?.data || { message: 'Failed to verify claim' };
  }
}; 


export const getResult = async (data) => {
  try {
    const response = await api.get(`/api/ai/verification/${data}/result`);
    return response.data; 
  } catch (error) {
    console.error('Error fetching verification result:', error);
    throw error.response?.data || { message: 'Failed to fetch verification result' };
  }
};


export const getInsuranceDetails = async (id) => {
  try {
    const response = await api.get(`/api/insurance/forms/visit_forms/?visit_id=${id}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching insurance details:', error);
    throw error.response?.data || { message: 'Failed to fetch insurance details' };
  }
};

// Medical Document APIs
export const uploadDocument = async (formData) => {
  try {
    const response = await api.post('/api/ehr/documents/', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document:', error);
    throw error.response?.data || { message: 'Failed to upload document' };
  }
};

// Upload document to a specific visit
export const uploadDocumentToVisit = async (visitId, formData) => {
  try {
    const response = await api.post(`/api/ehr/patient-visits/${visitId}/upload-document/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    console.error('Error uploading document to visit:', error);
    throw error.response?.data || { message: 'Failed to upload document to visit' };
  }
};

export const addPrescription = async (prescriptionData) => {
  try {
    const response = await api.post('/api/ehr/prescriptions/', prescriptionData);
    return response.data;
  } catch (error) {
    console.error('Error adding prescription:', error);
    throw error.response?.data || { message: 'Failed to add prescription' };
  }
};

export const addLabResult = async (labData) => {
  try {
    const response = await api.post('/api/ehr/lab-results/', labData);
    return response.data;
  } catch (error) {
    console.error('Error adding lab result:', error);
    throw error.response?.data || { message: 'Failed to add lab result' };
  }
};

export const addVitalSigns = async (vitalData) => {
  try {
    const response = await api.post('/api/ehr/vital-signs/', vitalData);
    return response.data;
  } catch (error) {
    console.error('Error adding vital signs:', error);
    throw error.response?.data || { message: 'Failed to add vital signs' };
  }
};

export const addDiagnosis = async (diagnosisData) => {
  try {
    const response = await api.post('/api/ehr/diagnoses/', diagnosisData);
    return response.data;
  } catch (error) {
    console.error('Error adding diagnosis:', error);
    throw error.response?.data || { message: 'Failed to add diagnosis' };
  }
};

// Get visit-specific data
export const getVisitDocuments = async (visitId, sessionToken = null) => {
  try {
    const params = {};
    if (sessionToken) {
      params.session_token = sessionToken;
    }
    const response = await api.get(`/api/ehr/patient-visits/${visitId}/documents/`, { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching visit documents:', error);
    throw error.response?.data || { message: 'Failed to fetch visit documents' };
  }
};

export const getVisitPrescriptions = async (visitId) => {
  try {
    const response = await api.get(`/api/ehr/prescriptions/by_visit/?visit_id=${visitId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visit prescriptions:', error);
    throw error.response?.data || { message: 'Failed to fetch visit prescriptions' };
  }
};

export const getVisitLabResults = async (visitId) => {
  try {
    const response = await api.get(`/api/ehr/lab-results/by_visit/?visit_id=${visitId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visit lab results:', error);
    throw error.response?.data || { message: 'Failed to fetch visit lab results' };
  }
};

// Get all documents for a patient (for doctors)
export const getPatientDocuments = async (patientId, sessionToken = null) => {
  try {
    const params = { patient: patientId };
    if (sessionToken) {
      params.session_token = sessionToken;
    }
    const response = await api.get('/api/ehr/documents/', { params });
    return response.data;
  } catch (error) {
    console.error('Error fetching patient documents:', error);
    throw error.response?.data || { message: 'Failed to fetch patient documents' };
  }
};

export const getVisitDiagnoses = async (visitId) => {
  try {
    const response = await api.get(`/api/ehr/diagnoses/by_visit/?visit_id=${visitId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visit diagnoses:', error);
    throw error.response?.data || { message: 'Failed to fetch visit diagnoses' };
  }
};

export const getVisitVitalSigns = async (visitId) => {
  try {
    const response = await api.get(`/api/ehr/vital-signs/by_visit/?visit_id=${visitId}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching visit vital signs:', error);
    throw error.response?.data || { message: 'Failed to fetch visit vital signs' };
  }
};

export default api;
