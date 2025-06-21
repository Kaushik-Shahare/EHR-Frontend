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
    const token = Cookies.get('token');
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records?${queryParams}`, 
        getAuthConfig()
      );

      setRecords(response.data.records);
      setPagination(response.data.pagination);
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/patient/${patientId}?${queryParams}`, 
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/patient/${patientId}/all`, 
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/${id}`, 
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/visit`, 
        data, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        setRecords([response.data.record, ...records]);
      }
      
      setLoading(false);
      return response.data.record;
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
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/diagnosis`, 
        data, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        setRecords([response.data.record, ...records]);
      }
      
      setLoading(false);
      return response.data.record;
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
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/lab-result`, 
        data, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        setRecords([response.data.record, ...records]);
      }
      
      setLoading(false);
      return response.data.record;
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
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/prescription`, 
        data, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        setRecords([response.data.record, ...records]);
      }
      
      setLoading(false);
      return response.data.record;
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
      
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/vital-signs`, 
        data, 
        getAuthConfig()
      );
      
      // Update the records list if we have records already loaded
      if (records.length > 0) {
        setRecords([response.data.record, ...records]);
      }
      
      setLoading(false);
      return response.data.record;
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/${id}/status`, 
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
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/records/${id}`, 
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
