import axios from 'axios';
import Cookies from 'js-cookie';

// Use the backend URL from environment variables
const API_URL = process.env.NEXT_PUBLIC_BACKEND_URL || '';

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
    const token = localStorage.getItem('accesstoken') || Cookies.get('token');
    
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
    const response = await api.get(`/api/ehr/patient-visits/`);
    return response.data;
  } catch (error) {
    console.error('Error fetching patient visits:', error);
    throw error.response?.data || { message: 'Failed to fetch patient visits' };
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

export default api;
