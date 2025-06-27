import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import ehrService from '../../services/ehrService';
import nfcService from '../../services/nfcService';

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

const PatientRecords = ({ patientId }) => {
  const [patientRecords, setPatientRecords] = useState([]);
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState(null);
  const router = useRouter();

  const extractRecordsData = (responseData) => {
    console.log("Extracting records from data structure:", responseData);
    
    // Handle various possible response structures
    if (Array.isArray(responseData)) {
      console.log("Found array at top level, using directly");
      return responseData;
    }
    
    if (responseData && typeof responseData === 'object') {
      // Try common nested structures
      if (Array.isArray(responseData.data)) {
        console.log("Found array in .data property");
        return responseData.data;
      }
      
      if (responseData.results && Array.isArray(responseData.results)) {
        console.log("Found array in .results property");
        return responseData.results;
      }
      
      if (responseData.visits && Array.isArray(responseData.visits)) {
        console.log("Found array in .visits property");
        return responseData.visits;
      }
      
      if (responseData.patient_visits && Array.isArray(responseData.patient_visits)) {
        console.log("Found array in .patient_visits property");
        return responseData.patient_visits;
      }
      
      // Deep search for any array containing visit-like objects
      const findVisitArray = (obj, depth = 0) => {
        if (depth > 3) return null; // Prevent infinite recursion
        
        for (const key in obj) {
          if (Array.isArray(obj[key])) {
            // Check if this array contains objects that look like visits
            if (obj[key].length > 0 && 
                typeof obj[key][0] === 'object' &&
                (obj[key][0].visit_number || 
                 obj[key][0].check_in_time || 
                 obj[key][0].visit_type)) {
              console.log(`Deep search found likely visit array in .${key} property`);
              return obj[key];
            }
          } else if (obj[key] && typeof obj[key] === 'object') {
            const result = findVisitArray(obj[key], depth + 1);
            if (result) return result;
          }
        }
        return null;
      };
      
      const deepSearchResult = findVisitArray(responseData);
      if (deepSearchResult) return deepSearchResult;
      
      // If the object itself has visit-like properties, wrap it in an array
      if (responseData.visit_number || 
          responseData.check_in_time || 
          responseData.visit_type) {
        console.log("Found single visit object, wrapping in array");
        return [responseData];
      }
      
      // Last resort - log the structure and return empty array
      console.log("Could not find visit data in response structure");
      return [];
    }
    
    return [];
  };

  const fetchPatientRecords = async () => {
    if (!patientId) return null;

    setLoading(true);
    setError(null);
    
    try {
      // Get session token from localStorage
      const sessionData = nfcService.getSessionToken(patientId);
      
      if (sessionData?.token) {
        console.log(`Using session token for patient ${patientId}: ${sessionData.token.substring(0, 10)}...`);
        const response = await ehrService.getPatientVisits(sessionData.token, patientId);
        console.log("Patient records API response:", response);
        
        // Extract the records data from the response
        const recordsData = extractRecordsData(response.data);
        console.log("Processed records data:", recordsData);
        
        // Store fetched records in state
        if (recordsData && recordsData.length > 0) {
          setPatientRecords(recordsData);
          return recordsData;
        } else {
          console.warn("No records found in API response");
          setPatientRecords([]);
        }
      } else {
        console.warn("No session token available for patient ID:", patientId);
        setError("No session token available. Please tap the NFC card to authenticate and view patient records.");
      }
    } catch (error) {
      console.error("Error fetching patient records:", error);
      const errorMessage = error.response ? 
        `API Error: ${error.response.status} - ${error.response.statusText}` : 
        `Failed to load patient records: ${error.message || 'Unknown error'}`;
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
    
    return null;
  };



  // Fetch records when component mounts or patientId changes
  useEffect(() => {
    if (patientId) {
      fetchPatientRecords();
    }
  }, [patientId]);

  // Debug the current state
  console.log("Rendering PatientRecords component with:", {
    patientId,
    records: patientRecords,
    recordsCount: patientRecords?.length || 0,
    loading,
    error
  });

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
      <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
        <h3 className="text-lg font-bold text-black">
          Visit History
        </h3>
        <div className="flex items-center">
          {patientRecords && patientRecords.length > 0 && (
            <span className="mr-2 px-2 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-medium">
              {patientRecords.length} {patientRecords.length === 1 ? 'visit' : 'visits'} 
            </span>
          )}
          <button 
            className="text-sm text-black hover:underline"
            onClick={() => fetchPatientRecords()}
          >
            {patientRecords && patientRecords.length > 0 ? 'Refresh' : 'View All'}
          </button>
        </div>
      </div>
      
      <div className="p-4">
        {loading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="py-4">
            <p className="text-red-500 mb-2">{error}</p>
            <div className="flex gap-2">
              <button 
                onClick={() => fetchPatientRecords()}
                className="px-4 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 rounded-md text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : patientRecords && patientRecords.length > 0 ? (
          <div>
            {patientRecords.map((record, index) => {
              // For each record, log its structure to help debug
              console.log(`Rendering record ${index}:`, record);
              
              // Create a safe reference to avoid null/undefined errors
              const safeRecord = record || {};
              
              // Navigate to the record detail when clicked
              const handleRecordClick = () => {
                router.push(`/patient/record/${safeRecord.id}`);
              };
              
              return (
                <div 
                  key={safeRecord.id || index} 
                  className={`${index !== patientRecords.length - 1 ? "border-b border-gray-200 pb-4 mb-4" : ""} cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2`}
                  onClick={handleRecordClick}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="font-medium text-blue-600">
                        Visit {safeRecord.id || `Record-${index}`}
                      </h4>
                      <div className="text-sm text-gray-600">
                        {formatDate(safeRecord.check_in_time)} 
                        {safeRecord.doctor_name && <span> • Dr. {safeRecord.doctor_name}</span>}
                        {safeRecord.attending_doctor && !safeRecord.doctor_name && <span> • Doctor ID: {safeRecord.attending_doctor}</span>}
                      </div>
                    </div>
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                      safeRecord.status === 'completed' ? 'bg-green-100 text-green-800' : 
                      safeRecord.status === 'checked_in' ? 'bg-blue-100 text-blue-800' : 
                      'bg-yellow-100 text-yellow-800'
                    }`}>
                      {safeRecord.status ? 
                        safeRecord.status.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') : 
                        'Unknown Status'}
                    </span>
                  </div>
                  <div className="mt-2 text-sm">
                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-2">
                      {safeRecord.visit_type && (
                        <>
                          <div className="text-gray-600">Visit Type:</div>
                          <div className="font-medium capitalize">
                            {safeRecord.visit_type.replace(/_/g, ' ')}
                          </div>
                        </>
                      )}
                      
                      {safeRecord.total_amount && (
                        <>
                          <div className="text-gray-600">Payment:</div>
                          <div className="font-medium flex items-center">
                            ${safeRecord.total_amount}
                            {safeRecord.payment_status && (
                              <span className={`ml-2 px-1.5 py-0.5 text-xs rounded-full ${
                                safeRecord.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {safeRecord.payment_status}
                              </span>
                            )}
                          </div>
                        </>
                      )}
                      
                      <div className="text-gray-600">Duration:</div>
                      <div className="font-medium">
                        {safeRecord.duration || (safeRecord.check_out_time ? 
                          `${Math.round((new Date(safeRecord.check_out_time) - new Date(safeRecord.check_in_time)) / (1000 * 60))} min` : 
                          'In progress')}
                      </div>
                    </div>
                    
                    {/* We don't have vitals in the current data structure, but we can add it if it becomes available */}
                    {safeRecord.vitals && (
                      <div className="mt-2">
                        <h5 className="text-xs font-semibold text-gray-500">Vitals</h5>
                        <div className="flex flex-wrap gap-2 mt-1">
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                            BP: {safeRecord.vitals.blood_pressure || "N/A"}
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                            HR: {safeRecord.vitals.heart_rate || "N/A"} bpm
                          </span>
                          <span className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-800 text-xs rounded">
                            Temp: {safeRecord.vitals.temperature || "N/A"}°F
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-gray-600 py-4">
            <p>No visit history available</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientRecords;
