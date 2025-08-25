'use client';

import React, { useEffect, useState, use } from 'react';
import MainLayout from '../../../components/MainLayout';
import QuickActions from '../../../components/patient/QuickActions';
import PatientDocuments from '../../../components/documents/PatientDocuments';
import PatientRecords from '../../../components/patient/PatientRecords';
import { useRouter } from 'next/navigation';
import nfcService from '../../../services/nfcService';
import PatientInfoLeftColumn from '@/components/patient/PatientInfoLeftColumn';
import api from '@/services/apiService';

// Helper function for formatting dates consistently
const formatDate = (dateString) => {
  if (!dateString) return 'N/A';
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date) 
    ? date.toLocaleDateString('en-US', { 
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : dateString;
};

export default function PatientDetailPage({ params }) {
  const [sessionToken, setSessionToken] = useState(null);
  // Unwrap params using React.use() - Next.js now requires this for route parameters
  const unwrappedParams = use(params);
  const patientId = unwrappedParams.id;
  
  const [user, setUser] = useState(null);
  const [documentsUrl, setDocumentsUrl] = useState(null);
  const [visitId, setVisitId] = useState(null);
  const [isCompletingVisit, setIsCompletingVisit] = useState(false);
  const [visitUpdateSuccess, setVisitUpdateSuccess] = useState(false);
  const [visitUpdateError, setVisitUpdateError] = useState(null);
  const [showCompletionModal, setShowCompletionModal] = useState(false);
  const [visitFormData, setVisitFormData] = useState({
    diagnosis: '',
    treatment_notes: '',
    follow_up_required: false,
    follow_up_date: ''
  });
  const router = useRouter();
  const users = {
    3:"2e0d0831-8cf6-4cec-9e0f-39d1ce64ba2c",
    5:"be135026-0295-448c-85de-39a64c83d067",
    4:"ee2ddcf4-1712-4840-a5ab-8708bc6810c8"
  };
  
  const fetchPatientData = async (id) => {
    const card_id = users[id];
    console.log("Fetching patient data for Patient ID:", id, "Card ID:", card_id);
    try {
      // This will return a session token for doctor
      const response = await nfcService.tapNfcCard(card_id);
      console.log("Response from NFC tap:", response);
      
      // Extract session token and user data
      const sessionToken = response.data.data.session.session_token;
      setSessionToken(sessionToken);
      const userData = response.data.data;
      console.log("Data fetched from NFC tap:", response.data);
      setUser(userData);
      
      // Set documents URL if available in the response
      if (userData.documents_url) {
        setDocumentsUrl(userData.documents_url);
      }
      
      // Save session token to localStorage
      nfcService.saveSessionToken(id, sessionToken, userData.session.expires_at);
      
      // Continue with patient data handling
      // You can add more code here to use the token for API calls
      
      return {
        sessionToken,
        userData
      };
    } catch (error) {
      console.error("Error fetching patient data:", error);
      // Handle error appropriately
    }
  }

  useEffect(() => {
    if (!patientId || !users[patientId]) {
      console.log("Invalid patient ID, redirecting to doctor page");
      router.push('/doctor');
      return;
    }
    
    // Fetch patient data
    fetchPatientData(patientId);
    
    // Get the visitId from localStorage that was set in the doctor dashboard
    const storedVisitId = localStorage.getItem('currentVisitId');
    if (storedVisitId) {
      console.log("Retrieved visit ID from localStorage:", storedVisitId);
      setVisitId(storedVisitId);
    }
  }, [patientId, router]);

  // Set default follow-up date to tomorrow
  useEffect(() => {
    // Create tomorrow's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0); // Set to 10:00 AM
    
    // Format date to ISO string and trim milliseconds
    // Format: 2025-07-15T10:00:00Z
    const formattedDate = tomorrow.toISOString().split('.')[0];
    
    setVisitFormData(prev => ({
      ...prev,
      follow_up_date: formattedDate
    }));
  }, []);

  // Function to handle input changes in the visit completion form
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setVisitFormData({
      ...visitFormData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  // Function to complete visit with API call
  const completeVisit = async () => {
    if (!visitId) {
      setVisitUpdateError("No active visit found. Please start a visit first.");
      return;
    }

    try {
      setIsCompletingVisit(true);
      setVisitUpdateError(null);

      // Format the data for the API call
      const visitData = {
        ...visitFormData,
        // If follow-up is not required, send null for follow-up date
        follow_up_date: visitFormData.follow_up_required ? visitFormData.follow_up_date : null,
        status: "ready_for_checkout"
      };

      // Make the PATCH API call to update the visit
      const response = await api.patch(`/api/ehr/patient-visits/${visitId}/`, visitData);
      
      console.log('Visit completed successfully:', response.data);
      
      setVisitUpdateSuccess(true);
      setShowCompletionModal(false);
      
      // Clear visit ID from local storage after completion
      localStorage.removeItem('currentVisitId');
      
      // Optional: Show success message or redirect
      setTimeout(() => {
        setVisitUpdateSuccess(false);
      }, 5000);
    } catch (error) {
      console.error('Error completing visit:', error);
      setVisitUpdateError(error.response?.data?.detail || error.message || 'Failed to complete visit');
    } finally {
      setIsCompletingVisit(false);
    }
  };

  return (
    <MainLayout title={user?.session?.patient?.profile?.name || "Patient Details"}>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 md:px-6 lg:px-8">
          
          {/* Patient Header */}
          <div className="mb-6">
            <div className="flex justify-between items-center">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                {user?.session?.patient?.profile?.name || "Patient"}
              </h1>
              
              {/* Complete Visit Button */}
              {visitId && (
                <button
                  onClick={() => setShowCompletionModal(true)}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-md shadow-sm transition-colors flex items-center"
                >
                  {isCompletingVisit ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Processing...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7"></path>
                      </svg>
                      Complete Visit
                    </>
                  )}
                </button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600">
              <span className="mr-4">ID: {user?.session?.patient?.id || patientId}</span>
              <span className="mr-4">DOB: {user?.session?.patient?.profile?.date_of_birth || "N/A"}</span>
              <span className="mr-4">{user?.session?.patient?.profile?.age || "N/A"} years</span>
              <span className="mr-4">Last visit: {user?.session?.patient?.latest_visit_date || "N/A"}</span>
              {visitId && <span className="font-medium text-blue-600">Active Visit ID: {visitId}</span>}
            </div>
            
            {/* Success and Error Messages */}
            {visitUpdateSuccess && (
              <div className="mt-2 p-2 bg-green-50 border-l-4 border-green-500 text-green-700 text-sm">
                Visit completed successfully!
              </div>
            )}
            
            {visitUpdateError && (
              <div className="mt-2 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                {visitUpdateError}
              </div>
            )}
          </div>
          

          {/* Main Content - 3 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Patient Details */}
            <PatientInfoLeftColumn user={user} />
            
            {/* Middle Column - Quick Actions & Visit History */}
            <div className="lg:col-span-6 space-y-6">
              {/* Quick Actions */}
              <QuickActions
                patientId={user?.session?.patient?.id || patientId}
                sessionToken={sessionToken}
                visitId={visitId || null}
              />
              
              {/* Visit History - Using the separate PatientRecords component */}
              <PatientRecords patientId={patientId} />
            </div>
            
            {/* Right Column - Documents */}
            <div className="lg:col-span-3">
              {/* Pass the documents_url from the API response to the PatientDocuments component */}
              <PatientDocuments documentsUrl={documentsUrl} sessionToken={sessionToken} />
            </div>
          </div>
        </div>
      </div>
      
      {/* Visit Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">Complete Visit</h2>
              <button 
                className="text-gray-400 hover:text-gray-500"
                onClick={() => setShowCompletionModal(false)}
              >
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              completeVisit();
            }}>
              {/* Diagnosis field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnosis *
                </label>
                <input
                  type="text"
                  name="diagnosis"
                  value={visitFormData.diagnosis}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Acute respiratory infection"
                />
              </div>

              {/* Treatment notes field */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Treatment Notes *
                </label>
                <textarea
                  name="treatment_notes"
                  value={visitFormData.treatment_notes}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="e.g., Prescribed antibiotics and rest for 5 days"
                ></textarea>
              </div>

              {/* Follow-up required checkbox */}
              <div className="mb-4 flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="follow_up_required"
                    name="follow_up_required"
                    type="checkbox"
                    checked={visitFormData.follow_up_required}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="follow_up_required" className="font-medium text-gray-700">
                    Follow-up Required
                  </label>
                  <p className="text-gray-500">Check if patient needs a follow-up appointment</p>
                </div>
              </div>

              {/* Follow-up date field (only shown if follow-up is required) */}
              {visitFormData.follow_up_required && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Follow-up Date *
                  </label>
                  <input
                    type="datetime-local"
                    name="follow_up_date"
                    value={visitFormData.follow_up_date}
                    onChange={handleInputChange}
                    required={visitFormData.follow_up_required}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              )}

              {/* Error message */}
              {visitUpdateError && (
                <div className="mb-4 p-2 bg-red-50 border-l-4 border-red-500 text-red-700 text-sm">
                  {visitUpdateError}
                </div>
              )}

              {/* Action buttons */}
              <div className="flex justify-end gap-3 mt-5">
                <button
                  type="button"
                  onClick={() => setShowCompletionModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isCompletingVisit}
                  className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-400"
                >
                  {isCompletingVisit ? 'Submitting...' : 'Complete Visit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </MainLayout>
  );
}
