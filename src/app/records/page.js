'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useRecords } from '@/context/RecordContext';
import RecordList from '@/components/records/RecordList';
import FilterControls from '@/components/records/FilterControls';

export default function RecordsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
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

  // Load records when component mounts or filters change
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            {patientId && patientId !== user?.id 
              ? "Patient Records" 
              : "My Medical Records"}
          </h1>
          
          {/* Only providers can create new records */}
          {(user?.role === 'DOCTOR' || user?.role === 'NURSE' || user?.role === 'ADMIN') && (
            <div className="flex space-x-2">
              <Link href="/records/new">
                <button className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 transition-colors">
                  Add New Record
                </button>
              </Link>
            </div>
          )}
        </div>

        {/* Filter controls */}
        <FilterControls 
          filters={filters} 
          onFilterChange={handleFilterChange} 
        />
        
        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-5">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {/* Records list */}
        <RecordList 
          records={records} 
          isLoading={recordsLoading} 
        />

        {/* Pagination */}
        {pagination && pagination.total > 0 && (
          <div className="mt-5 flex justify-center">
            <div className="flex space-x-1">
              <button 
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded ${
                  currentPage === 1 
                    ? "bg-gray-200 text-gray-500" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Previous
              </button>
              
              {[...Array(pagination.pages)].map((_, index) => (
                <button
                  key={index + 1}
                  onClick={() => handlePageChange(index + 1)}
                  className={`px-3 py-1 rounded ${
                    currentPage === index + 1
                      ? "bg-blue-600 text-black"
                      : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                  }`}
                >
                  {index + 1}
                </button>
              ))}
              
              <button 
                onClick={() => handlePageChange(Math.min(pagination.pages, currentPage + 1))}
                disabled={currentPage === pagination.pages}
                className={`px-3 py-1 rounded ${
                  currentPage === pagination.pages 
                    ? "bg-gray-200 text-gray-500" 
                    : "bg-gray-200 hover:bg-gray-300 text-gray-700"
                }`}
              >
                Next
              </button>
            </div>
          </div>
        )}

        {/* No records message */}
        {records.length === 0 && !recordsLoading && (
          <div className="text-center py-10">
            <p className="text-gray-500 mb-4">No medical records found.</p>
            {(user?.role === 'DOCTOR' || user?.role === 'NURSE' || user?.role === 'ADMIN') && (
              <Link href="/records/new">
                <button className="px-4 py-2 bg-blue-600 text-black rounded-md hover:bg-blue-700 transition-colors">
                  Create First Record
                </button>
              </Link>
            )}
          </div>
        )}
      </div>
    </MainLayout>
  );
}
