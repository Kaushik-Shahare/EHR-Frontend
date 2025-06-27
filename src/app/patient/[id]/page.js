'use client';

import React, { useEffect, useState } from 'react';
import MainLayout from '../../../components/MainLayout';
import QuickActions from '../../../components/patient/QuickActions';
import PatientDocuments from '../../../components/documents/PatientDocuments';
import { useRouter } from 'next/navigation';
import axios from 'axios';
import { set } from 'react-hook-form';

export default function PatientDetailPage({ params }) {
  const [user, setUser] = useState(null);
  const [documentsUrl, setDocumentsUrl] = useState(null);
  const router = useRouter();
  const users = {
    3:"2e0d0831-8cf6-4cec-9e0f-39d1ce64ba2c",
    5:"be135026-0295-448c-85de-39a64c83d067",
  };
  
  const fetchPatientData = async (id) => {
    const card_id = users[id];
    console.log("Fetching patient data for Patient ID:", id, "Card ID:", card_id);
    try {
      // This will return a session token for doctor
      const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/ehr/nfc/tap/${card_id}`);
      console.log("Response from NFC tap:", response);
      
      // Extract session token and user data
      const sessionToken = response.data.data.session.session_token;
      const userData = response.data.data;
      console.log("Data fetched from NFC tap:", response.data);
      setUser(userData);
      console.log("api response:", response.data);
      // Set documents URL if available in the response
      if (userData.documents_url) {
        setDocumentsUrl(userData.documents_url);
        console.log("Documents URL set:", userData.documents_url);
      }
      console.log("user data:", userData);
      let sessionTokens = {};
      const existingTokens = localStorage.getItem('sessionTokens');
      
      if (existingTokens) {
        try {
          sessionTokens = JSON.parse(existingTokens);
        } catch (e) {
          console.error("Error parsing existing session tokens:", e);
          // If parsing fails, start with empty object
          sessionTokens = {};
        }
      }
      
      // Add/update this user's token
      sessionTokens[id] = {
        token: sessionToken,
        expires_at: userData.session.expires_at,
        created_at: new Date().toISOString()
      };
      
      // Save back to localStorage
      localStorage.setItem('sessionTokens', JSON.stringify(sessionTokens));
      console.log(`Session token for patient ${id} saved to localStorage`);
      
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
    if (!params?.id || !users[params.id]) {
      router.push('/doctor');
      return;
    }
    fetchPatientData(params.id);
  }, [params?.id, router]);

  // Mock handlers for QuickActions
  const handleAddDocument = async (formData) => {
    console.log("Add document:", formData);
    return true; // Simulate success
  };

  const handleAddPrescription = async (prescriptionData) => {
    console.log("Add prescription:", prescriptionData);
    return true; // Simulate success
  };

  const handleAddLabResult = async (labResultData) => {
    console.log("Add lab result:", labResultData);
    return true; // Simulate success
  };

  return (
    <MainLayout title={user?.session?.patient?.profile?.name || "Patient Details"}>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 md:px-6 lg:px-8">
          {/* NFC Session Notification */}
          <div className="mb-4 bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex justify-between w-full">
                <p className="text-sm text-blue-700">
                  NFC session active. You have secure access to this patient's records until {
                    new Date(user?.session?.expires_at || Date.now() + 3600000).toLocaleTimeString()
                  }
                </p>
                {user?.session?.access_level && (
                  <span className="text-sm font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    {user?.session?.access_level || "Full access"}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Patient Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {user?.session?.patient?.profile?.name || "Patient"}
            </h1>
            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600">
              <span className="mr-4">ID: {user?.session?.patient?.id || params?.id}</span>
              <span className="mr-4">DOB: {user?.session?.patient?.profile?.date_of_birth || "N/A"}</span>
              <span className="mr-4">{user?.session?.patient?.profile?.age || "N/A"} years</span>
              <span>Last visit: {user?.session?.patient?.latest_visit_date || "N/A"}</span>
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
                patientId={user?.session?.patient?.id || params?.id}
                onAddDocument={handleAddDocument}
                onAddPrescription={handleAddPrescription}
                onAddLabResult={handleAddLabResult}
              />
              
              {/* Recent Lab Results Summary */}
              {user?.session?.patient?.lab_results && user?.session?.patient?.lab_results?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-black">Recent Lab Results</h3>
                    <button className="text-sm text-black hover:underline">View All</button>
                  </div>
                  <div className="p-4">
                    {user.session.patient.lab_results.map((lab, index) => (
                      <div key={index} className={`mb-4 ${index !== user.session.patient.lab_results.length - 1 ? "border-b pb-4" : ""}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{lab.test_name}</h4>
                            <p className="text-sm text-gray-600">{lab.date}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            lab.status === 'normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {lab.status}
                          </span>
                        </div>
                        <div className="mt-2 overflow-x-auto">
                          <table className="min-w-full text-xs">
                            <thead>
                              <tr className="bg-gray-50">
                                <th className="px-2 py-1 text-left">Test</th>
                                <th className="px-2 py-1 text-left">Result</th>
                                <th className="px-2 py-1 text-left">Units</th>
                                <th className="px-2 py-1 text-left">Reference</th>
                              </tr>
                            </thead>
                            <tbody>
                              {lab.values && lab.values.map((item, i) => (
                                <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                  <td className="px-2 py-1">{item.name}</td>
                                  <td className={`px-2 py-1 font-medium ${
                                    item.flag === 'normal' ? 'text-gray-900' : 
                                    item.flag === 'high' ? 'text-red-600' : 'text-blue-600'
                                  }`}>{item.value}</td>
                                  <td className="px-2 py-1 text-gray-500">{item.unit}</td>
                                  <td className="px-2 py-1 text-gray-500">{item.range}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Visit History */}
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Visit History</h3>
                  <button className="text-sm text-black hover:underline">View All</button>
                </div>
                <div className="p-4">
                  {user?.session?.patient?.visits?.length > 0 ? (
                    user.session.patient.visits.map((visit, index) => (
                      <div key={index} className={`${index !== user.session.patient.visits.length - 1 ? "border-b border-gray-200 pb-4 mb-4" : ""}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{visit.reason}</h4>
                            <div className="text-sm text-gray-600">{visit.date} • {visit.provider}</div>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            visit.status === 'completed' ? 'bg-green-100 text-green-800' : 
                            visit.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {visit.status?.charAt(0).toUpperCase() + visit.status?.slice(1)}
                          </span>
                        </div>
                        <div className="mt-2 text-sm">
                          <p className="text-gray-700">{visit.notes}</p>
                          
                          {visit.vitals && (
                            <div className="mt-2">
                              <h5 className="text-xs font-semibold text-gray-500">Vitals</h5>
                              <div className="flex flex-wrap gap-2 mt-1">
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                                  BP: {visit.vitals.blood_pressure || "N/A"}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                                  HR: {visit.vitals.heart_rate || "N/A"} bpm
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                                  Temp: {visit.vitals.temperature || "N/A"}°F
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                                  Resp: {visit.vitals.respiratory_rate || "N/A"}
                                </span>
                                <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                                  O₂: {visit.vitals.oxygen_saturation || "N/A"}%
                                </span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-gray-600 py-4">No visit history available</p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Right Column - Documents */}
            <div className="lg:col-span-3">
              <PatientDocuments documentsUrl={user?.documents_url} />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
