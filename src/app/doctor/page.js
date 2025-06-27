"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/services/apiService';
import { useAuth } from '@/context/AuthContext';

export default function DoctorDashboard() {
  const router = useRouter();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchVisits();
    }
  }, [isAuthenticated, user]);

  // useEffect(()=>{
  //   console.log("user from doctor:",user);
  //   if(!user){
  //     router.push('/login');
  //   }
  //   if(!isAuthenticated) {
  //     router.push('/login');
  //   }
  // })
  
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
      
      // Make the API call to fetch visits
      const response = await api.get('/api/ehr/patient-visits/');
      console.log("Direct API response:", response.data);
      
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

  return (
    <main className="p-4 md:p-6 max-w-screen-2xl mx-auto">
      <h1 className='text-4xl font-bold mb-6'>
        Welcome {`Dr. ${user?.profile?.name}`|| 'Doctor'}
      </h1>
      
      {/* Today's Appointments Section */}
      <section className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden ring-1 ring-gray-100 ring-opacity-80">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-800">Today's Appointments</h2>
          <span className="text-sm bg-blue-50 text-blue-700 py-1 px-3 rounded-full font-medium">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
          </span>
        </div>
            
        <div className="overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Time
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Complaint
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider">
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
                  <td colSpan="5" className="text-center py-4 text-gray-500">
                    No appointments scheduled for today.
                  </td>
                </tr>
              ) : (
                visits.map((visit) => {
                  const patientId = typeof visit.patient === 'object' 
                    ? visit.patient?.id 
                    : typeof visit.patient === 'number' || typeof visit.patient === 'string'
                      ? visit.patient
                      : null;
                      
                  const patientName = (typeof visit.patient === 'object' ? visit.patient.name : null) || 
                                     visit.patient_name || 'Patient';
                  
                  // console.log(`Visit ${visit.id} - Patient ID: ${patientId}, Name: ${patientName}`);
                  
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
                          {visit.appointment_time 
                            ? new Date(visit.appointment_time).toLocaleString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                hour: 'numeric',
                                minute: '2-digit',
                              })
                            : 'Scheduled'}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm max-w-xs truncate">
                          {visit.reason || visit.chief_complaint || "General checkup"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          visit.status === 'COMPLETED' 
                            ? 'bg-green-100 text-green-800' 
                            : visit.status === 'IN_PROGRESS'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                        }`}>
                          {visit.status || 'Scheduled'}
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
    </main>
  );
}
