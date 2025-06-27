'use client';

import React from 'react';
import MainLayout from '../../../components/MainLayout';
import QuickActions from '../../../components/patient/QuickActions';
import { useRouter } from 'next/navigation';

export default function PatientDetailPage({ params }) {
  const router = useRouter();

  // Dummy patient data
  const patientData = {
    id: params?.id || "PT123456",
    name: "Jane Doe",
    email: "jane.doe@example.com",
    dateOfBirth: "12/15/1985",
    age: 38,
    gender: "Female",
    bloodType: "O+",
    contactNumber: "+1 (555) 123-4567",
    lastVisit: "03/15/2024",
    vitalSigns: {
      height: 165,
      weight: 68,
      bmi: 25.0,
      bloodPressure: "120/80",
      heartRate: 72,
      temperature: 98.6,
      oxygenSaturation: 98
    },
    allergies: ["Penicillin", "Latex", "Peanuts"],
    chronicConditions: ["Hypertension", "Asthma"],
    currentMedications: [
      {
        name: "Lisinopril",
        dosage: "10mg",
        frequency: "Once daily",
        purpose: "Blood pressure control"
      },
      {
        name: "Albuterol",
        dosage: "90mcg",
        frequency: "As needed",
        purpose: "Asthma relief"
      }
    ],
    insurance: {
      provider: "HealthPlus Insurance",
      policyNumber: "HP78923457",
      expiryDate: "12/31/2024"
    },
    recentLabResults: [
      {
        id: "LR001",
        testName: "Complete Blood Count",
        date: "03/01/2024",
        status: "Normal",
        values: [
          { name: "WBC", value: "7.8", unit: "10^9/L", range: "4.5-11.0", flag: "normal" },
          { name: "RBC", value: "4.8", unit: "10^12/L", range: "4.5-5.9", flag: "normal" },
          { name: "Hemoglobin", value: "14.2", unit: "g/dL", range: "13.5-17.5", flag: "normal" },
          { name: "Hematocrit", value: "42", unit: "%", range: "41-50", flag: "normal" },
          { name: "Platelets", value: "250", unit: "10^9/L", range: "150-450", flag: "normal" }
        ]
      },
      {
        id: "LR002",
        testName: "Lipid Panel",
        date: "02/15/2024",
        status: "Abnormal",
        values: [
          { name: "Total Cholesterol", value: "210", unit: "mg/dL", range: "<200", flag: "high" },
          { name: "LDL", value: "140", unit: "mg/dL", range: "<100", flag: "high" },
          { name: "HDL", value: "55", unit: "mg/dL", range: ">40", flag: "normal" },
          { name: "Triglycerides", value: "150", unit: "mg/dL", range: "<150", flag: "normal" }
        ]
      }
    ],
    visits: [
      {
        id: "VT78901",
        date: "03/15/2024",
        reason: "Annual check-up",
        provider: "Dr. Robert Smith",
        status: "completed",
        notes: "Patient reports feeling well. No significant changes in health status.",
        vitals: {
          bloodPressure: "120/80",
          heartRate: 72,
          temperature: 98.6,
          respiratoryRate: 16,
          oxygenSaturation: 98
        }
      },
      {
        id: "VT78902",
        date: "01/22/2024",
        reason: "Asthma flare-up",
        provider: "Dr. Robert Smith",
        status: "completed",
        notes: "Patient experienced increased asthma symptoms after exercise. Advised to use inhaler before physical activity.",
        vitals: {
          bloodPressure: "125/82",
          heartRate: 80,
          temperature: 98.8,
          respiratoryRate: 18,
          oxygenSaturation: 96
        }
      },
      {
        id: "VT78903",
        date: "11/05/2023",
        reason: "Seasonal allergies",
        provider: "Dr. Sarah Johnson",
        status: "completed",
        notes: "Experiencing nasal congestion and itchy eyes. Prescribed antihistamine.",
        vitals: {
          bloodPressure: "118/78",
          heartRate: 75,
          temperature: 98.4,
          respiratoryRate: 16,
          oxygenSaturation: 99
        }
      }
    ],
    documents: [
      {
        id: "DOC001",
        title: "Chest X-Ray Report",
        type: "Imaging",
        date: "03/15/2024",
        provider: "City Radiology",
        fileUrl: "#"
      },
      {
        id: "DOC002",
        title: "Pulmonary Function Test",
        type: "Test Result",
        date: "01/22/2024",
        provider: "Respiratory Clinic",
        fileUrl: "#"
      },
      {
        id: "DOC003",
        title: "Annual Physical Summary",
        type: "Clinical Note",
        date: "03/15/2023",
        provider: "Dr. Robert Smith",
        fileUrl: "#"
      }
    ],
    session: {
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      access_level: "Full access"
    }
  };

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
    <MainLayout title={patientData?.name || "Patient Details"}>
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
                    new Date(patientData?.session?.expires_at || Date.now() + 3600000).toLocaleTimeString()
                  }
                </p>
                {patientData?.session?.access_level && (
                  <span className="text-sm font-medium text-blue-800 bg-blue-100 px-2 py-0.5 rounded-full">
                    {patientData?.session?.access_level || "Full access"}
                  </span>
                )}
              </div>
            </div>
          </div>
          
          {/* Patient Header */}
          <div className="mb-6">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {patientData?.name || "Patient"}
            </h1>
            <div className="flex flex-wrap items-center mt-2 text-sm text-gray-600">
              <span className="mr-4">ID: {patientData?.id}</span>
              <span className="mr-4">DOB: {patientData?.dateOfBirth}</span>
              <span className="mr-4">{patientData?.age} years</span>
              <span>Last visit: {patientData?.lastVisit}</span>
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
                      {patientData?.name?.charAt(0) || "P"}
                    </div>
                    <h4 className="font-medium">{patientData?.name}</h4>
                    <p className="text-sm text-gray-600">{patientData?.email}</p>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Basic Information</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Gender:</span>
                          <span className="font-medium">{patientData?.gender}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Blood Type:</span>
                          <span className="font-medium">{patientData?.bloodType}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Phone:</span>
                          <span className="font-medium">{patientData?.contactNumber}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Vital Signs</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Height:</span>
                          <span className="font-medium">{patientData?.vitalSigns?.height} cm</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Weight:</span>
                          <span className="font-medium">{patientData?.vitalSigns?.weight} kg</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">BMI:</span>
                          <span className="font-medium">{patientData?.vitalSigns?.bmi}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">BP:</span>
                          <span className="font-medium">{patientData?.vitalSigns?.bloodPressure}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Heart Rate:</span>
                          <span className="font-medium">{patientData?.vitalSigns?.heartRate} bpm</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Temp:</span>
                          <span className="font-medium">{patientData?.vitalSigns?.temperature} °F</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">O₂ Sat:</span>
                          <span className="font-medium">{patientData?.vitalSigns?.oxygenSaturation}%</span>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Medical</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                        <div>
                          <span className="text-gray-600">Allergies:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {patientData?.allergies?.map((allergy, index) => (
                              <span key={index} className="px-2 py-0.5 bg-red-100 text-red-800 text-xs rounded-full">
                                {allergy}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Chronic Conditions:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {patientData?.chronicConditions?.map((condition, index) => (
                              <span key={index} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Current Medications</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-3 text-sm">
                        {patientData?.currentMedications?.length > 0 ? (
                          patientData.currentMedications.map((med, index) => (
                            <div key={index} className="border-l-2 border-blue-500 pl-2 py-1">
                              <div className="font-medium">{med.name}</div>
                              <div className="text-xs text-gray-600">{med.dosage} - {med.frequency}</div>
                              <div className="text-xs text-gray-500">{med.purpose}</div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-600">No current medications</p>
                        )}
                      </div>
                    </div>
                    
                    <div>
                      <h5 className="text-xs font-semibold uppercase text-gray-500 mb-2">Insurance</h5>
                      <div className="bg-gray-50 rounded-lg p-3 space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Provider:</span>
                          <div className="font-medium">{patientData?.insurance?.provider}</div>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Policy No:</span>
                          <span className="font-medium">{patientData?.insurance?.policyNumber}</span>
                        </div>
                        <div className="grid grid-cols-2">
                          <span className="text-gray-600">Expires:</span>
                          <span className="font-medium">{patientData?.insurance?.expiryDate}</span>
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
                patientId={patientData?.id}
                onAddDocument={handleAddDocument}
                onAddPrescription={handleAddPrescription}
                onAddLabResult={handleAddLabResult}
              />
              
              {/* Recent Lab Results Summary */}
              {patientData?.recentLabResults?.length > 0 && (
                <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                  <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
                    <h3 className="text-lg font-bold text-black">Recent Lab Results</h3>
                    <button className="text-sm text-black hover:underline">View All</button>
                  </div>
                  <div className="p-4">
                    {patientData.recentLabResults.map((lab, index) => (
                      <div key={index} className={`mb-4 ${index !== patientData.recentLabResults.length - 1 ? "border-b pb-4" : ""}`}>
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-medium">{lab.testName}</h4>
                            <p className="text-sm text-gray-600">{lab.date}</p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            lab.status === 'Normal' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
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
                              {lab.values.map((item, i) => (
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
                  {patientData.visits.map((visit, index) => (
                    <div key={index} className={`${index !== patientData.visits.length - 1 ? "border-b border-gray-200 pb-4 mb-4" : ""}`}>
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
                          {visit.status.charAt(0).toUpperCase() + visit.status.slice(1)}
                        </span>
                      </div>
                      <div className="mt-2 text-sm">
                        <p className="text-gray-700">{visit.notes}</p>
                        
                        <div className="mt-2">
                          <h5 className="text-xs font-semibold text-gray-500">Vitals</h5>
                          <div className="flex flex-wrap gap-2 mt-1">
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                              BP: {visit.vitals.bloodPressure}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                              HR: {visit.vitals.heartRate} bpm
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                              Temp: {visit.vitals.temperature}°F
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                              Resp: {visit.vitals.respiratoryRate}
                            </span>
                            <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                              O₂: {visit.vitals.oxygenSaturation}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            {/* Right Column - Documents */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-black">Documents</h3>
                  <button className="text-sm text-black hover:underline">View All</button>
                </div>
                <div className="p-4">
                  {patientData.documents.map((doc, index) => (
                    <div key={index} className={`flex items-start space-x-3 py-3 ${
                      index !== patientData.documents.length - 1 ? "border-b border-gray-200" : ""
                    }`}>
                      <div className="flex-shrink-0">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="flex-grow">
                        <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
                        <div className="flex flex-wrap text-xs text-gray-500 mt-0.5">
                          <span>{doc.date}</span>
                          <span className="mx-1">•</span>
                          <span>{doc.type}</span>
                        </div>
                        <div className="text-xs text-gray-500">{doc.provider}</div>
                      </div>
                      <button className="flex-shrink-0 text-blue-600 hover:text-blue-800">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
