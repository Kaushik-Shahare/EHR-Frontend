'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

// Import React Icons
import { FiUser, FiSearch, FiChevronRight } from 'react-icons/fi';

export default function PatientsPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get auth config for API requests
  const getAuthConfig = () => {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return {
      headers: {
        Authorization: `Bearer ${token}`
      }
    };
  };

  // Function to fetch patients
  const fetchPatients = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/patients`, 
        getAuthConfig()
      );
      
      setPatients(response.data.patients);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch patients');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated && (user?.role === 'DOCTOR' || user?.role === 'ADMIN')) {
      fetchPatients();
    }
  }, [isAuthenticated, user]);

  // Redirect if not authenticated or not doctor/admin
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!authLoading && isAuthenticated && user && 
        !(user.role === 'DOCTOR' || user.role === 'ADMIN')) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Filter patients based on search term
  const filteredPatients = searchTerm.trim() === '' 
    ? patients 
    : patients.filter(patient => 
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.email.toLowerCase().includes(searchTerm.toLowerCase())
      );

  if (authLoading || loading) {
    return (
      <MainLayout title="Patients">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Patients">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Patients">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
          
          {/* Search input */}
          <div className="mt-3 sm:mt-0 relative rounded-md shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <FiSearch className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search patients..."
              className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-md"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Patients list */}
        <div className="bg-white shadow overflow-hidden rounded-md">
          <ul className="divide-y divide-gray-200">
            {filteredPatients.length > 0 ? (
              filteredPatients.map(patient => (
                <li key={patient.id}>
                  <Link href={`/patient/${patient.id}`}>
                    <div className="block hover:bg-gray-50 px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiUser className="h-6 w-6 text-gray-600" />
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="font-medium text-gray-900">{patient.name}</div>
                            <div className="text-sm text-gray-500 flex flex-col sm:flex-row sm:gap-6">
                              <span>{patient.email}</span>
                              <span>{patient.phone}</span>
                            </div>
                          </div>
                        </div>
                        <div className="ml-2 flex-shrink-0 flex">
                          <FiChevronRight className="text-gray-400" />
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
                {searchTerm.trim() !== '' ? 'No patients match your search' : 'No patients found'}
              </li>
            )}
          </ul>
        </div>
      </div>
    </MainLayout>
  );
}
