'use client';

import { createContext, useState, useContext } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import { useAuth } from './AuthContext';

// Create a context for managing records
const RecordContext = createContext();

export const RecordProvider = ({ children }) => {
  const { user } = useAuth();
  const [records, setRecords] = useState([]);
  const [patientRecords, setPatientRecords] = useState([]);
  const [currentRecord, setCurrentRecord] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    total: 0,
    pages: 1
  });

  // Helper function to create API request config with auth
  const getAuthConfig = () => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Get all records for the current user
  const fetchRecords = async (page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let queryParams = `page=${page}&limit=${limit}`;
      
      // Add filters to the query if they exist
      if (filters.recordType) {
        queryParams += `&recordType=${filters.recordType}`;
      }
      
      if (filters.status) {
        queryParams += `&status=${filters.status}`;
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/records?${queryParams}`, 
        getAuthConfig()
      );

      // Our backend returns data in a data property
      setRecords(response.data.data || []);
      setPagination(response.data.pagination || { page: 1, total: 0, pages: 1 });
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch records');
      setLoading(false);
      throw err;
    }
  };

  // Get records for a specific patient (doctors/nurses)
  const fetchPatientRecords = async (patientId, page = 1, limit = 10, filters = {}) => {
    try {
      setLoading(true);
      setError(null);

      let queryParams = `page=${page}&limit=${limit}`;
      
      // Add filters to the query if they exist
      if (filters.recordType) {
        queryParams += `&recordType=${filters.recordType}`;
      }
      
      if (filters.status) {
        queryParams += `&status=${filters.status}`;
      }
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/records/patient/${patientId}?${queryParams}`, 
        getAuthConfig()
      );

      setRecords(response.data.records);
      setPagination(response.data.pagination);
      setLoading(false);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patient records');
      setLoading(false);
      throw err;
    }
  };
  
  // Get all records for a specific patient ID (for patient dashboard)
  const fetchRecordsByPatientId = async (patientId) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/patient/${patientId}/records`, 
        getAuthConfig()
      );
      
      setPatientRecords(response.data.records);
      setLoading(false);
      return response.data.records;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patient records');
      setLoading(false);
      throw err;
    }
  };

  // Get a specific record by ID
  const fetchRecordById = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/records/${id}`, 
        getAuthConfig()
      );
      
      setCurrentRecord(response.data.record);
      setLoading(false);
      return response.data.record;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch record');
      setLoading(false);
      throw err;
    }
  };

  // Create a new visit record
  const createVisitRecord = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/patient-visits/`, 
        data, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        // Backend returns data in a nested data property
        const newRecord = response.data.data || response.data;
        setRecords([newRecord, ...records]);
      }
      
      setLoading(false);
      // Return the created record data
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create visit record');
      setLoading(false);
      throw err;
    }
  };

  // Create a new diagnosis record
  const createDiagnosisRecord = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Data needs to include a visit_id - if this is missing from the data,
      // we may need to create a visit first and then link the diagnosis to it
      let visitId = data.visit || null;
      
      // If no visit is provided but we have a patient, 
      // we might need to create an implicit visit first
      if (!visitId && data.patient) {
        try {
          // Create a default visit for this diagnosis if none was provided
          const visitResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/patient-visits/`,
            {
              patient: data.patient,
              visit_type: 'ROUTINE_CHECKUP',
              chief_complaint: `Diagnosis: ${data.condition_name}`,
              status: 'completed'
            },
            getAuthConfig()
          );
          
          visitId = visitResponse.data.data?.id || visitResponse.data.id;
          console.log('Created implicit visit:', visitId);
        } catch (visitErr) {
          console.error('Failed to create implicit visit for diagnosis:', visitErr);
          throw new Error('Failed to create a visit for this diagnosis');
        }
      }
      
      // Now create the diagnosis with the visit ID
      const updatedData = { ...data, visit: visitId };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/diagnoses/`, 
        updatedData, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        // Backend returns data in a nested data property
        const newRecord = response.data.data || response.data;
        setRecords([newRecord, ...records]);
      }
      
      setLoading(false);
      // Return the created record data
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create diagnosis record');
      setLoading(false);
      throw err;
    }
  };

  // Create a new lab result record
  const createLabResultRecord = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Data needs to include a visit_id - if this is missing from the data,
      // we may need to create a visit first and then link the lab result to it
      let visitId = data.visit || null;
      
      // If no visit is provided but we have a patient, 
      // we might need to create an implicit visit first
      if (!visitId && data.patient) {
        try {
          // Create a default visit for this lab result if none was provided
          const visitResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/patient-visits/`,
            {
              patient: data.patient,
              visit_type: 'ROUTINE_CHECKUP',
              chief_complaint: `Lab Test: ${data.test_name}`,
              status: 'completed'
            },
            getAuthConfig()
          );
          
          visitId = visitResponse.data.data?.id || visitResponse.data.id;
          console.log('Created implicit visit:', visitId);
        } catch (visitErr) {
          console.error('Failed to create implicit visit for lab result:', visitErr);
          throw new Error('Failed to create a visit for this lab result');
        }
      }
      
      // Now create the lab result with the visit ID
      const updatedData = { ...data, visit: visitId };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/lab-results/`, 
        updatedData, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        // Backend returns data in a nested data property
        const newRecord = response.data.data || response.data;
        setRecords([newRecord, ...records]);
      }
      
      setLoading(false);
      // Return the created record data
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create lab result record');
      setLoading(false);
      throw err;
    }
  };

  // Create a new prescription record
  const createPrescriptionRecord = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Data needs to include a visit_id - if this is missing from the data,
      // we may need to create a visit first and then link the prescription to it
      let visitId = data.visit || null;
      
      // If no visit is provided but we have a patient, 
      // we might need to create an implicit visit first
      if (!visitId && data.patient) {
        try {
          // Create a default visit for this prescription if none was provided
          const visitResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/patient-visits/`,
            {
              patient: data.patient,
              visit_type: 'ROUTINE_CHECKUP',
              chief_complaint: `Prescription: ${data.medication_name}`,
              status: 'completed'
            },
            getAuthConfig()
          );
          
          visitId = visitResponse.data.data?.id || visitResponse.data.id;
          console.log('Created implicit visit:', visitId);
        } catch (visitErr) {
          console.error('Failed to create implicit visit for prescription:', visitErr);
          throw new Error('Failed to create a visit for this prescription');
        }
      }
      
      // Now create the prescription with the visit ID
      const updatedData = { ...data, visit: visitId };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/prescriptions/`, 
        updatedData, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        // Backend returns data in a nested data property
        const newRecord = response.data.data || response.data;
        setRecords([newRecord, ...records]);
      }
      
      setLoading(false);
      // Return the created record data
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create prescription record');
      setLoading(false);
      throw err;
    }
  };

  // Create a new vital signs record
  const createVitalSignsRecord = async (data) => {
    try {
      setLoading(true);
      setError(null);
      
      // Data needs to include a visit_id - if this is missing from the data,
      // we may need to create a visit first and then link the vital signs to it
      let visitId = data.visit || null;
      
      // If no visit is provided but we have a patient, 
      // we might need to create an implicit visit first
      if (!visitId && data.patient) {
        try {
          // Create a default visit for these vital signs if none was provided
          const visitResponse = await axios.post(
            `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/patient-visits/`,
            {
              patient: data.patient,
              visit_type: 'ROUTINE_CHECKUP',
              chief_complaint: 'Vital signs recording',
              status: 'completed'
            },
            getAuthConfig()
          );
          
          visitId = visitResponse.data.data?.id || visitResponse.data.id;
          console.log('Created implicit visit:', visitId);
        } catch (visitErr) {
          console.error('Failed to create implicit visit for vital signs:', visitErr);
          throw new Error('Failed to create a visit for these vital signs');
        }
      }
      
      // Now create the vital signs with the visit ID
      const updatedData = { ...data, visit: visitId };
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/vital-signs/`, 
        updatedData, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        // Backend returns data in a nested data property
        const newRecord = response.data.data || response.data;
        setRecords([newRecord, ...records]);
      }
      
      setLoading(false);
      // Return the created record data
      return response.data.data || response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create vital signs record');
      setLoading(false);
      throw err;
    }
  };

  // Update a record's status
  const updateRecordStatus = async (id, status) => {
    try {
      setLoading(true);
      setError(null);
       const response = await axios.patch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/records/${id}/status`, 
        { status },
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        setRecords(records.map(record => 
          record.id === id ? { ...record, status } : record
        ));
      }
      
      // Update current record if it's the one being modified
      if (currentRecord && currentRecord.id === id) {
        setCurrentRecord({ ...currentRecord, status });
      }
      
      setLoading(false);
      return response.data.record;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update record status');
      setLoading(false);
      throw err;
    }
  };

  // Delete (archive) a record
  const deleteRecord = async (id) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.delete(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/records/${id}`, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        setRecords(records.map(record => 
          record.id === id ? { ...record, status: 'ARCHIVED' } : record
        ));
      }
      
      // Update current record if it's the one being deleted
      if (currentRecord && currentRecord.id === id) {
        setCurrentRecord({ ...currentRecord, status: 'ARCHIVED' });
      }
      
      setLoading(false);
      return response.data.record;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete record');
      setLoading(false);
      throw err;
    }
  };

  return (
    <RecordContext.Provider
      value={{
        records,
        patientRecords,
        currentRecord,
        loading,
        error,
        pagination,
        fetchRecords,
        fetchPatientRecords,
        fetchRecordsByPatientId,
        fetchRecordById,
        createVisitRecord,
        createDiagnosisRecord,
        createLabResultRecord,
        createPrescriptionRecord,
        createVitalSignsRecord,
        updateRecordStatus,
        deleteRecord,
        setCurrentRecord
      }}
    >
      {children}
    </RecordContext.Provider>
  );
};

export const useRecords = () => useContext(RecordContext);

export default RecordContext;
