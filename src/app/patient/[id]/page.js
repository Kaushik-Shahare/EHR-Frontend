'use client';

import React, { useEffect, useState, use } from 'react';
import MainLayout from '../../../components/MainLayout';
import QuickActions from '../../../components/patient/QuickActions';
import PatientDocuments from '../../../components/documents/PatientDocuments';
import PatientRecords from '../../../components/patient/PatientRecords';
import { useRouter } from 'next/navigation';
import nfcService from '../../../services/nfcService';
import ehrService from '../../../services/ehrService';
import PatientInfoLeftColumn from '@/components/patient/PatientInfoLeftColumn';

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
            <PatientInfoLeftColumn user={user} />
            
            {/* Middle Column - Quick Actions & Visit History */}
            <div className="lg:col-span-6 space-y-6">
              {/* Quick Actions */}
              <QuickActions 
                patientId={user?.session?.patient?.id || patientId}
                sessionToken={sessionToken}
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
