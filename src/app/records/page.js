'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useRecords } from '@/context/RecordContext';
import RecordList from '@/components/records/RecordList';
import FilterControls from '@/components/records/FilterControls';
import api from '@/services/apiService';

export default function RecordsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  // Helper functions to reduce redundant code
  const formatString = (str) => str?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase()) || '';
  
  const getStatusClassName = (status) => {
    if (status === 'checked_in') return 'bg-green-100 text-green-800';
    if (status === 'checked_out') return 'bg-gray-100 text-gray-800';
    return 'bg-blue-100 text-blue-800';
  };
  
  const getPaymentStatusClassName = (status) => {
    if (status === 'paid') return 'bg-green-100 text-green-800';
    if (status === 'pending') return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };
  
  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
  };
  
  // Common style constants
  const cellStyle = "px-6 py-4 whitespace-nowrap text-sm text-gray-900";
  const badgeStyle = "px-2 inline-flex text-xs leading-5 font-semibold rounded-full";
  const isProvider = ['DOCTOR', 'NURSE', 'ADMIN'].includes(user?.role);
  
  const { 
    records, 
    loading: recordsLoading, 
    error, 
    pagination, 
    fetchRecords,
    fetchPatientRecords 
  } = useRecords();

  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ recordType: '', status: 'ACTIVE' });
  const [patientId, setPatientId] = useState(null);
  
  // Visit history state
  const [visitHistory, setVisitHistory] = useState([]);
  const [visitHistoryLoading, setVisitHistoryLoading] = useState(false);
  const [visitHistoryError, setVisitHistoryError] = useState(null);

  // Fetch patient visit history
  const fetchVisitHistory = async () => {
    setVisitHistoryLoading(true);
    setVisitHistoryError(null);
    
    try {
      const response = await api.get('/api/ehr/patient-visits/');
      setVisitHistory(response.data.results || []);
    } catch (error) {
      console.error('Error fetching visit history:', error);
      setVisitHistoryError(error.response?.data?.detail || error.message || 'Failed to fetch visit history');
    } finally {
      setVisitHistoryLoading(false);
    }
  };

  // Load records and visit history when component mounts or filters change
  useEffect(() => {
    if (isAuthenticated) {
      // If viewing as a patient, get own records
      if (!patientId) {
        fetchRecords(currentPage, 10, filters);
      } 
      // If viewing as provider for a specific patient
      else {
        fetchPatientRecords(patientId, currentPage, 10, filters);
      }

      // Fetch visit history for the patient
      fetchVisitHistory();
    }
  }, [isAuthenticated, currentPage, filters, patientId]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Handle filter changes
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Handle pagination
  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  if (authLoading || (recordsLoading && records.length === 0)) {
    return (
      <MainLayout title="Medical Records">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Medical Records">
      
      
      {/* Visit History Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Visit History</h1>
        </div>
        
        {/* Visit history error message */}
        {visitHistoryError && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5">
            <p className="text-red-700">{visitHistoryError}</p>
          </div>
        )}
        
        {/* Visit history loading */}
        {visitHistoryLoading && (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        )}
        
        {/* Visit history table */}
        {!visitHistoryLoading && visitHistory.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full bg-white border border-gray-200 rounded-lg overflow-hidden">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Number</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Visit Type</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Check-In Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Payment</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {visitHistory.map((visit) => (
                  <tr key={visit.id} className="hover:bg-gray-50">
                    <td className={cellStyle}>{visit.id}</td>
                    <td className={cellStyle}>{visit.patient_name}</td>
                    <td className={cellStyle}>{visit.doctor_name}</td>
                    <td className={cellStyle}>
                      {formatString(visit.visit_type)}
                    </td>
                    <td className={cellStyle}>
                      {formatDateTime(visit.check_in_time)}
                    </td>
                    <td className={cellStyle}>
                      <span className={`${badgeStyle} ${getStatusClassName(visit.status)}`}>
                        {formatString(visit.status)}
                      </span>
                    </td>
                    <td className={cellStyle}>${visit.total_amount}</td>
                    <td className={cellStyle}>
                      <span className={`${badgeStyle} ${getPaymentStatusClassName(visit.payment_status)}`}>
                        {formatString(visit.payment_status)}
                      </span>
                    </td>
                    <td className={cellStyle + " text-sm font-medium"}>
                      <Link 
                        href={`/records/${visit.id}`} 
                        className="text-indigo-600 hover:text-indigo-900 mr-4"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        
        {/* No visit history message */}
        {!visitHistoryLoading && visitHistory.length === 0 && (
          <div className="text-center py-10">
            <p className="text-gray-500">No visit history found.</p>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
