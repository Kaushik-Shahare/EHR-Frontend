"use client"
import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import MainLayout from '@/components/MainLayout'
import EHRWidget from '@/components/patient/EHRWidget'
import AIHelper from '@/components/patient/AIHelper'
import QuickActions from '@/components/patient/QuickActions'
import { useAuth } from '@/context/AuthContext'

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated, loading } = useAuth();
  const [patientData, setPatientData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Mock AI suggestions for the demo
  const aiSuggestions = [
    {
      condition: "Type 2 Diabetes",
      confidence: 85,
      description: "Based on elevated blood glucose levels, family history, and recent symptoms of fatigue and increased thirst. The patient's medical history and latest lab values strongly suggest Type 2 Diabetes that requires immediate management.",
      keySymptoms: ["Elevated glucose", "Increased thirst", "Frequent urination", "Fatigue", "Family history"]
    },
    {
      condition: "Hypertension",
      confidence: 72,
      description: "Consistently elevated blood pressure readings over multiple visits suggest essential hypertension. This is likely related to family history, diet, and lifestyle factors. Recommend regular monitoring and possible lifestyle modifications.",
      keySymptoms: ["Elevated blood pressure", "Occasional headaches", "Family history"]
    },
    {
      condition: "Mild Dyslipidemia",
      confidence: 65,
      description: "Recent lipid panel indicates elevated LDL levels and slightly low HDL. This combined with family history suggests dyslipidemia that may require management through diet and possibly medication.",
      keySymptoms: ["Elevated LDL", "Reduced HDL", "Family history of heart disease"]
    }
  ];

  // Mock patient data for the demo
  useEffect(() => {
    // In a real application, fetch patient data from API
    const fetchPatientData = async () => {
      setIsLoading(true);
      try {
        // Mock API call delay
        await new Promise(resolve => setTimeout(resolve, 800));
        
        // Mock patient data
        const mockPatient = {
          id: params.id,
          name: "James Wilson",
          age: 42,
          gender: "Male",
          dateOfBirth: "1983-04-15",
          bloodType: "O+",
          contactNumber: "+1 (555) 123-4567",
          email: "james.wilson@example.com",
          emergencyContact: {
            name: "Emily Wilson",
            relationship: "Spouse",
            phone: "+1 (555) 987-6543"
          },
          address: {
            street: "123 Main Street",
            city: "Austin",
            state: "TX",
            zipCode: "78701"
          },
          insurance: {
            provider: "Blue Cross Blue Shield",
            policyNumber: "BCBS-12345678",
            groupNumber: "GRP-987654",
            expiryDate: "2026-12-31"
          },
          vitalSigns: {
            height: 180, // cm
            weight: 85, // kg
            bmi: 26.2,
            bloodPressure: "138/88",
            heartRate: 72,
            temperature: 98.6,
            respiratoryRate: 14,
            oxygenSaturation: 98
          },
          allergies: ["Penicillin", "Shellfish"],
          chronicConditions: ["Hypertension", "Prediabetes"],
          currentMedications: [
            {
              name: "Lisinopril",
              dosage: "10mg",
              frequency: "Once daily",
              purpose: "Hypertension"
            },
            {
              name: "Metformin",
              dosage: "500mg",
              frequency: "Twice daily",
              purpose: "Blood sugar control"
            }
          ],
          recentLabResults: [
            {
              name: "HbA1c",
              value: "6.4%",
              referenceRange: "4.0-5.6%",
              date: "2025-05-10",
              status: "High"
            },
            {
              name: "Total Cholesterol",
              value: "215 mg/dL",
              referenceRange: "< 200 mg/dL",
              date: "2025-05-10",
              status: "High"
            },
            {
              name: "HDL Cholesterol",
              value: "42 mg/dL",
              referenceRange: "> 40 mg/dL",
              date: "2025-05-10",
              status: "Normal"
            },
            {
              name: "LDL Cholesterol",
              value: "145 mg/dL",
              referenceRange: "< 100 mg/dL",
              date: "2025-05-10",
              status: "High"
            },
            {
              name: "Triglycerides",
              value: "140 mg/dL",
              referenceRange: "< 150 mg/dL",
              date: "2025-05-10",
              status: "Normal"
            }
          ],
          lastVisit: "2025-05-10",
          upcomingAppointment: "2025-06-30"
        };
        
        setPatientData(mockPatient);
      } catch (error) {
        console.error("Error fetching patient data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (params.id) {
      fetchPatientData();
    }
  }, [params.id]);

  const handleAcceptDiagnosis = (suggestion) => {
    // Handle accepting AI diagnosis suggestion
    console.log("Accepted diagnosis:", suggestion);
    // In a real app, you would save this to the patient record
  };

  const handleRejectDiagnosis = (suggestion) => {
    // Handle rejecting AI diagnosis suggestion
    console.log("Rejected diagnosis:", suggestion);
  };

  const handleRefreshSuggestions = () => {
    // In a real app, you would fetch new suggestions
    console.log("Refreshing AI suggestions");
  };

  if (loading || isLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-700">Loading patient data...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Check if user is a doctor
  // if (user?.user_type !== 'doctor') {
  //   return (
  //     <MainLayout>
  //       <div className="min-h-screen flex items-center justify-center">
  //         <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
  //           <svg className="w-12 h-12 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
  //             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  //           </svg>
  //           <h2 className="text-xl font-bold text-red-700 mb-2">Access Restricted</h2>
  //           <p className="text-red-600 mb-4">This page is only accessible to medical providers.</p>
  //           <button 
  //             onClick={() => router.push('/dashboard')}
  //             className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
  //           >
  //             Return to Dashboard
  //           </button>
  //         </div>
  //       </div>
  //     </MainLayout>
  //   );
  // }

  return (
    <MainLayout title={patientData?.name || "Patient Details"}>
      <div className="min-h-screen bg-gray-50">
        <div className="px-4 py-6 md:px-6 lg:px-8">
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
                  <h3 className="text-lg font-bold">Patient Profile</h3>
                </div>
                <div className="p-4">
                  <div className="flex flex-col items-center mb-4">
                    <div className="w-20 h-20 rounded-full bg-blue-600 text-white flex items-center justify-center mb-2 text-2xl font-bold">
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
                            )) || "None reported"}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-600">Chronic Conditions:</span>
                          <div className="mt-1 flex flex-wrap gap-1">
                            {patientData?.chronicConditions?.map((condition, index) => (
                              <span key={index} className="px-2 py-0.5 bg-yellow-100 text-yellow-800 text-xs rounded-full">
                                {condition}
                              </span>
                            )) || "None reported"}
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
            
            {/* Middle Column - Quick Actions & EHR */}
            <div className="lg:col-span-6 space-y-6">
              {/* Quick Actions */}
              <QuickActions />
              
              {/* Recent Lab Results Summary */}
              {/* <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
                <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
                  <h3 className="text-lg font-bold">Recent Lab Results</h3>
                  <span className="text-sm">{patientData?.recentLabResults?.[0]?.date}</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 text-left">
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Test</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Result</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Reference</th>
                        <th className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {patientData?.recentLabResults?.map((result, index) => (
                        <tr key={index} className={result.status === "High" ? "bg-red-50" : result.status === "Low" ? "bg-blue-50" : ""}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{result.name}</td>
                          <td className="px-4 py-3 text-sm text-gray-700">{result.value}</td>
                          <td className="px-4 py-3 text-sm text-gray-500">{result.referenceRange}</td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex px-2 text-xs font-semibold rounded-full ${
                              result.status === "High" ? "bg-red-100 text-red-800" : 
                              result.status === "Low" ? "bg-blue-100 text-blue-800" : 
                              "bg-green-100 text-green-800"
                            }`}>
                              {result.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div> */}
              
              {/* EHR Records */}
              <EHRWidget 
                patientName={patientData?.name || "Patient"}
                patientId={patientData?.id || ""}
                lastUpdated={new Date().toLocaleDateString()}
              />
            </div>
            
            {/* Right Column - AI Helper */}
            <div className="lg:col-span-3">
              <AIHelper
                patientName={patientData?.name || "Patient"}
                suggestions={aiSuggestions}
                onAccept={handleAcceptDiagnosis}
                onReject={handleRejectDiagnosis}
                onRefresh={handleRefreshSuggestions}
              />
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}