"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';
import ScheduleCalendar from '@/components/doctor/ScheduleCalendar';

export default function DoctorDashboard() {
  const router = useRouter();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Date filtering state
  const [selectedDate, setSelectedDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // Changed from 'pending' to 'all'
  // Calendar modal state
  const [showCalendar, setShowCalendar] = useState(false);

  useEffect(() => {
    // Only fetch visits if auth is checked and user is authenticated as doctor
    if (!authChecked || authLoading || !isAuthenticated || !user || user.user_type !== 'Doctor') {
      return;
    }
    
    fetchVisits();
  }, [authChecked, authLoading, isAuthenticated, user]);

  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (authLoading) {
      console.log('Doctor Dashboard - AuthContext loading...');
      return;
    }
    
    setAuthChecked(true);
    
    if (!isAuthenticated || !user) {
      console.log('Doctor Dashboard - Not authenticated, redirecting to login');
      // Add a small delay to prevent redirect loops
      setTimeout(() => {
        router.push('/login');
      }, 1000);
      return;
    }
    
    // Check if user is actually a doctor
    if (user.user_type !== 'Doctor') {
      console.log('Doctor Dashboard - User is not a doctor, redirecting to appropriate dashboard');
      if (user.user_type === 'Patient') {
        router.push('/dashboard');
      } else {
        router.push('/admin/dashboard');
      }
      return;
    }
    
    console.log('Doctor Dashboard - Authentication successful');
  }, [authLoading, isAuthenticated, user, router]);
  // Log visits whenever they change
  useEffect(() => {
    console.log("Current visits state:", visits);
  }, [visits]);
  
  // Fetch appointment data from the API
  const fetchVisits = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Remove NFC token checking code
      
      // Build query parameters for filtering
      const queryParams = new URLSearchParams();
      queryParams.append('status', statusFilter);
      
      if (selectedDate) {
        queryParams.append('date', selectedDate);
      }
      
      // Make the API call to fetch visits with filters
      const response = await api.get(`/api/ehr/patient-visits/?${queryParams.toString()}`);
      console.log("Appointments API response:", response.data);
      
      // Deep inspection of response format
      console.log("Response type:", typeof response.data);
      const responseKeys = typeof response.data === 'object' ? Object.keys(response.data) : [];
      console.log("Response root keys:", responseKeys);
      
      // Log a full example of one visit to see its structure
      if (response.data?.data?.length > 0) {
        console.log("Example visit data structure:", JSON.stringify(response.data.data[0], null, 2));
        const sampleVisit = response.data.data[0];
        console.log("Patient property type:", typeof sampleVisit.patient);
        console.log("Patient property value:", sampleVisit.patient);
        if (typeof sampleVisit.patient === 'object') {
          console.log("Patient object keys:", Object.keys(sampleVisit.patient));
        }
      } else if (Array.isArray(response.data) && response.data.length > 0) {
        console.log("Example visit data structure:", JSON.stringify(response.data[0], null, 2));
        const sampleVisit = response.data[0];
        console.log("Patient property type:", typeof sampleVisit.patient);
        console.log("Patient property value:", sampleVisit.patient);
        if (typeof sampleVisit.patient === 'object' && sampleVisit.patient !== null) {
          console.log("Patient object keys:", Object.keys(sampleVisit.patient));
        }
      }
      
      // Extract visits data based on response structure
      let extractedVisits = [];
      
      if (Array.isArray(response.data)) {
        console.log("Case 1: Direct array response");
        extractedVisits = response.data;
      } else if (response.data?.data && Array.isArray(response.data.data)) {
        console.log("Case 2: Array in data property");
        extractedVisits = response.data.data;
      } else if (response.data?.results && Array.isArray(response.data.results)) {
        console.log("Case 3: Array in results property");
        extractedVisits = response.data.results;
      } else if (response.data?.visits && Array.isArray(response.data.visits)) {
        console.log("Case 4: Array in visits property");
        extractedVisits = response.data.visits;
      } else if (response.data?.patient_visits && Array.isArray(response.data.patient_visits)) {
        console.log("Case 5: Array in patient_visits property");
        extractedVisits = response.data.patient_visits;
      } else {
        console.warn("Could not find visits array in API response, using empty array");
        extractedVisits = [];
      }
      
      // NFC session enrichment code removed
      
      console.log("Final extracted visits:", extractedVisits);
      setVisits(extractedVisits);
      
      setLoading(false);
    } catch (err) {
      console.error('Error fetching appointment data:', err);
      setError('Failed to load appointment data. Please try again.');
      setLoading(false);
    }
  };

  // Handle date filter change
  const handleDateFilterChange = (date) => {
    setSelectedDate(date);
    // Trigger refetch with new filter
    setTimeout(() => fetchVisits(), 100);
  };

  // Handle status filter change
  const handleStatusFilterChange = (status) => {
    setStatusFilter(status);
    // Trigger refetch with new filter
    setTimeout(() => fetchVisits(), 100);
  };

  // Reset filters
  const resetFilters = () => {
    setSelectedDate('');
    setStatusFilter('all'); // Changed from 'pending' to 'all'
    // Trigger refetch with reset filters
    setTimeout(() => fetchVisits(), 100);
  };

  // Get today's date in YYYY-MM-DD format
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleStartConsultation = (id) => {
    if (!id) {
      console.error("Cannot start consultation: Patient ID is undefined or null");
      return;
    }
    
    console.log(`Starting consultation for patient ${id}`);
    // Navigate to the new record page for this patient
    router.push(`/records/new?patientId=${id}`);
  };

  const handleViewEHR = (id) => {
    if (!id) {
      console.error("Cannot view EHR: Patient ID is undefined or null");
      return;
    }
    
    console.log(`Navigating to patient details page for ${id}`);
    // Use direct window.location for more reliable navigation
    window.location.href = `/patient/${id}`;
    // Note: We're only using window.location.href and not router.push to avoid duplicate navigation
  };

  // Show loading screen while authentication is being checked
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">
            {authLoading ? 'Authenticating...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  // Show redirect message if not authenticated or not a doctor
  if (!isAuthenticated || !user || user.user_type !== 'Doctor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-blue-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="p-4 md:p-6 max-w-screen-2xl mx-auto">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <h1 className='text-4xl font-bold'>
          Welcome Dr. {user?.profile.name || user?.email?.split('@')[0] || 'Doctor'}
        </h1>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowCalendar(true)}
            className="flex items-center space-x-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-lg hover:bg-blue-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Quick View</span>
          </button>
          
          <a
            href="/doctor/schedule"
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 8h5a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
            <span>Full Schedule</span>
          </a>
        </div>
      </div>
      
      {/* Appointments Section with Filters */}
      <section className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden ring-1 ring-gray-100 ring-opacity-80">
        <div className="p-5 border-b border-gray-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h2 className="text-xl font-bold text-gray-800">Appointments</h2>
              <p className="text-sm text-gray-500">
                Showing {statusFilter === 'all' ? 'all' : statusFilter} appointments
                {selectedDate && ` for ${new Date(selectedDate).toLocaleDateString()}`}
              </p>
            </div>
            
            {/* Filter Controls */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Date:</label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => handleDateFilterChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-center space-x-2">
                <label className="text-sm font-medium text-gray-700">Status:</label>
                <select
                  value={statusFilter}
                  onChange={(e) => handleStatusFilterChange(e.target.value)}
                  className="px-3 py-1.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="cancelled">Cancelled</option>
                </select>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={() => handleDateFilterChange(getTodayDate())}
                  className="px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md transition-colors"
                >
                  Today
                </button>
                <button
                  onClick={resetFilters}
                  className="px-3 py-1.5 text-sm bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-md transition-colors"
                >
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
            
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Appointment Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Visit Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Loading appointment data...</span>
                    </div>
                  </td>
                </tr>
              ) : error ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-red-500">
                    {error}
                  </td>
                </tr>
              ) : visits.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-8 text-gray-500">
                    <div className="flex flex-col items-center">
                      <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3a2 2 0 012-2h4a2 2 0 012 2v4m-6 4h6m-6 4h6" />
                      </svg>
                      <p className="text-lg font-medium">
                        No {statusFilter === 'all' ? '' : statusFilter + ' '}appointments
                      </p>
                      <p className="text-sm">
                        {selectedDate 
                          ? `for ${new Date(selectedDate).toLocaleDateString()}` 
                          : 'found'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                visits.map((visit) => {
                  // Debugging what visit.patient actually is
                  console.log(`Visit ${visit.id} - Raw patient data:`, visit.patient, typeof visit.patient);
                  
                  // Handle the case where visit.patient is directly the numeric ID
                  // OR the case where it's an object with an id property
                  const patientId = typeof visit.patient === 'object' 
                    ? visit.patient?.id 
                    : typeof visit.patient === 'number' || typeof visit.patient === 'string'
                      ? visit.patient
                      : null;
                      
                  const patientName = (typeof visit.patient === 'object' ? visit.patient.name : null) || 
                                     visit.patient_name || 'Patient';
                  
                  console.log(`Visit ${visit.id} - Patient ID: ${patientId}, Name: ${patientName}`);
                  
                  return (
                    <tr 
                      key={visit.id} 
                      className="hover:bg-gray-50 transition-colors duration-150 ease-in-out cursor-pointer"
                      onClick={(e) => {
                        e.preventDefault();
                        
                        // Output more debugging information
                        console.log(`Visit data:`, visit);
                        console.log(`Patient data type: ${typeof visit.patient}`);
                        console.log(`Patient data:`, visit.patient);
                        console.log(`Calculated patientId: ${patientId}`);
                        
                        // Ensure we have a valid patient ID
                        if (patientId) {
                          console.log(`Navigating to patient detail page for ID: ${patientId}`);
                          window.location.href = `/patient/${patientId}`;
                        } else {
                          console.error('Missing patient ID, cannot navigate');
                          // Try a direct approach if we can access the raw patient value
                          const rawPatientValue = visit.patient;
                          if (rawPatientValue) {
                            console.log(`Trying alternative navigation using raw patient value: ${rawPatientValue}`);
                            window.location.href = `/patient/${rawPatientValue}`;
                          }
                        }
                      }}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 overflow-hidden">
                            <span className="text-sm font-bold">
                              {patientName.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium">{patientName}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          {visit.check_in_time 
                            ? new Date(visit.check_in_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                                hour12: true
                              })
                            : 'Not scheduled'}
                        </div>
                        <div className="text-xs text-gray-500">
                          {visit.check_in_time 
                            ? new Date(visit.check_in_time).toLocaleDateString('en-US', { weekday: 'short' })
                            : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm max-w-xs truncate capitalize">
                          {visit.visit_type?.replace('_', ' ') || 'General consultation'}
                        </div>
                        <div className="text-xs text-gray-500">
                          #{visit.visit_number?.substring(0, 8) || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          visit.status === 'completed' || visit.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800' 
                            : visit.status === 'in_progress' || visit.status === 'IN_PROGRESS'
                              ? 'bg-blue-100 text-blue-800'
                              : visit.status === 'pending'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-gray-100 text-gray-800'
                        }`}>
                          {visit.status?.replace('_', ' ')?.toLowerCase() || 'pending'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              if (!patientId) {
                                console.error("Cannot navigate: Patient ID is undefined or null");
                                return;
                              }
                              
                              console.log(`View EHR button: Navigating to patient ID: ${patientId}`);
                              // Use direct window.location for more reliable navigation
                              window.location.href = `/patient/${patientId}`;
                            }}
                            className="hover:bg-gray-100 px-2 py-1 rounded"
                            disabled={!patientId}
                          >
                            View EHR
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Prevent row click
                              handleStartConsultation(patientId);
                            }}
                            disabled={!patientId}
                            className="bg-doctorTeal hover:bg-doctorTeal/90 px-2 py-1 rounded"
                          >
                            {visit.status === 'COMPLETED' ? 'Review' : 'Start'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Schedule Calendar Modal */}
      {showCalendar && (
        <ScheduleCalendar
          isOpen={showCalendar}
          onClose={() => setShowCalendar(false)}
        />
      )}
    </main>
  );
}
