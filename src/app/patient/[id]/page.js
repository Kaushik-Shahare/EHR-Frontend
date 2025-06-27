'use client';

import React, { useEffect, useState, use } from 'react';
import MainLayout from '../../../components/MainLayout';
import QuickActions from '../../../components/patient/QuickActions';
import PatientDocuments from '../../../components/documents/PatientDocuments';
import PatientRecords from '../../../components/patient/PatientRecords';
import { useRouter } from 'next/navigation';
import nfcService from '../../../services/nfcService';
import ehrService from '../../../services/ehrService';

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
  }, [patientId, router]);

  // Handlers for QuickActions
  const handleAddDocument = async (formData) => {
    try {
      console.log("Add document:", formData);
      // Use sessionToken from state
      if (sessionToken) {
        const response = await ehrService.addPatientDocument(formData, sessionToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding document:", error);
      return false;
    }
  };

  const handleAddPrescription = async (prescriptionData) => {
    try {
      console.log("Add prescription:", prescriptionData);
      // Use sessionToken from state
      if (sessionToken) {
        const response = await ehrService.addPatientPrescription(prescriptionData, sessionToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding prescription:", error);
      return false;
    }
  };

  const handleAddLabResult = async (labResultData) => {
    try {
      console.log("Add lab result:", labResultData);
      // Use sessionToken from state
      if (sessionToken) {
        const response = await ehrService.addPatientLabResult(labResultData, sessionToken);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Error adding lab result:", error);
      return false;
    }
  };

  return (
    <MainLayout title={user?.session?.patient?.profile?.name || "Patient Details"}>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 md:px-6 lg:px-8">
          
          {/* Patient Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {user?.session?.patient?.profile?.name || "Patient"}
            </h1>
            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600">
              <span className="mr-4">ID: {user?.session?.patient?.id || patientId}</span>
              <span className="mr-4">DOB: {user?.session?.patient?.profile?.date_of_birth || "N/A"}</span>
              <span className="mr-4">{user?.session?.patient?.profile?.age || "N/A"} years</span>
              <span className="mr-4">Last visit: {user?.session?.patient?.latest_visit_date || "N/A"}</span>
            </div>
          </div>

          {/* Main Content - 3 Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column - Patient Details */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3">
                  <h3 className="text-lg font-bold text-black">Patient Profile</h3>
                </div>
                <div className="p-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-blue-600 text-black flex items-center justify-center mb-2 text-2xl font-bold">
                      {user?.session?.patient?.profile?.name?.charAt(0) || "P"}
                    </div>
                    <h4 className="font-medium">{user?.session?.patient?.profile?.name}</h4>
                    <p className="text-sm text-gray-600">{user?.session?.patient?.profile?.email}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Basic Information</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.gender || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Blood Type:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.blood_group || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.phone_number || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Vital Signs</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Height:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.height_cm || "N/A"} cm</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.weight_kg || "N/A"} kg</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Age:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.age || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Medical</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                        <div>
                          <span className="text-gray-600">Allergies:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {user?.session?.patient?.profile?.allergies?.map((allergy, index) => (
                              <span key={index} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                {allergy}
                              </span>
                            )) || <span className="text-gray-500">No recorded</span>}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Chronic Conditions:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {user?.session?.patient?.profile?.chronic_conditions?.map((condition, index) => (
                              <span key={index} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                {condition}
                              </span>
                            )) || <span className="text-gray-500">No recorded</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Current Medications</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                        {user?.session?.patient?.profile?.current_medications?.map((condition, index) => (
                              <span key={index} className="px-2 py-0.5 bg-green-100 text-green-800 text-xs rounded-full">
                                {condition}
                              </span>
                            )) || <span className="text-gray-500">No recorded</span>}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Insurance</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Provider:</span>
                          <div className="font-medium">{user?.session?.patient?.profile?.insurance?.provider || "N/A"}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Policy No:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.insurance?.policy_number || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Expires:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.insurance?.valid_till || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                    
                    {/* Emergency contacts */}
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Emergency Contacts</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <div className="font-medium">{user?.session?.patient?.profile?.emergency_contact?.name || "N/A"}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">relation:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.emergency_contact?.relation || "N/A"}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Phone No.:</span>
                          <span className="font-medium">{user?.session?.patient?.profile?.emergency_contact?.phone_number || "N/A"}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Middle Column - Quick Actions & Visit History */}
            <div className="lg:col-span-6 space-y-6">
              {/* Quick Actions */}
              <QuickActions 
                patientId={user?.session?.patient?.id || patientId}
                onAddDocument={handleAddDocument}
                onAddPrescription={handleAddPrescription}
                onAddLabResult={handleAddLabResult}
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
    </MainLayout>
  );
}
