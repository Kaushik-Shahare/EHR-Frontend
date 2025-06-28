'use client';

import React, { useState, useEffect } from 'react';
import { getAllPoliciesofPatient, generateInsurancePolicy, verifyClaim, getResult, getInsuranceDetails } from '@/services/apiService';
import { useSearchParams } from 'next/navigation';
import { set } from 'react-hook-form';

export default function InsuranceCheckPage() {
  const [activeTab, setActiveTab] = useState('claims');
  const [policies, setPolicies] = useState([]);
  const [selectedPolicies, setSelectedPolicies] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const searchParams = useSearchParams()
  const [insuranceId, setInsuranceId] = useState(null);
  const [verificationDetails, setVerificationDetails] = useState(null);
  const visitedId = searchParams.get('visited_id')
  const patientId = searchParams.get('patient_id')

  // Function to verify the selected policy
  const generatePolicy = async () => {
    if (!selectedPolicies || !visitedId) {
      setVerificationResult({
        status: 'ERROR',
        message: 'Missing required information. Please select a policy and ensure visit ID is present.'
      });
      return;
    }

    try {
      setVerifying(true);
      setVerificationResult(null);
      setError(null);

      // First check if insurance details already exist
      const existingPolicy = await getInsuranceDetails(visitedId).catch(() => null);
      console.log("Existing Policy Response==============================:", existingPolicy);
      // If existing policy found, use it
      if (existingPolicy && existingPolicy.status === true && existingPolicy.data && existingPolicy.data.length > 0) {
        // Get the first insurance detail from the array
        const insuranceDetail = existingPolicy.data[0];
        setInsuranceId(insuranceDetail.id);
        
        // Map the API response to the expected format for the form
        const formattedData = {
          id: insuranceDetail.id,
          visit_id: insuranceDetail.visit,
          policy_number: insuranceDetail.policy_number,
          provider: insuranceDetail.provider_name,
          reference_number: insuranceDetail.reference_number,
          status: insuranceDetail.status,
          status_display: insuranceDetail.status.charAt(0).toUpperCase() + insuranceDetail.status.slice(1),
          is_ai_approved: insuranceDetail.is_ai_approved,
          ai_confidence_score: insuranceDetail.ai_confidence_score,
          is_cashless_claim: insuranceDetail.is_cashless_claim,
          provider_type: insuranceDetail.provider_type,
          provider_type_display: insuranceDetail.provider_type.charAt(0).toUpperCase() + insuranceDetail.provider_type.slice(1),
          diagnosis: insuranceDetail.diagnosis,
          icd_code: insuranceDetail.icd_code,
          treatment_type: insuranceDetail.treatment_type,
          treatment_type_display: insuranceDetail.treatment_type.charAt(0).toUpperCase() + insuranceDetail.treatment_type.slice(1),
          hospitalization_type: insuranceDetail.hospitalization_type,
          hospitalization_type_display: insuranceDetail.hospitalization_type.replace('_', ' ').split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '),
          admission_date: insuranceDetail.admission_date,
          expected_discharge_date: insuranceDetail.expected_discharge_date,
          expected_days_of_stay: insuranceDetail.expected_days_of_stay,
          treating_doctor: insuranceDetail.treating_doctor,
          past_history: insuranceDetail.past_history,
          claim_amount: insuranceDetail.claim_amount,
          room_rent_per_day: insuranceDetail.room_rent_per_day,
          professional_fees: insuranceDetail.professional_fees,
          approved_amount: insuranceDetail.approved_amount,
          policy: {
            policy_number: insuranceDetail.policy_number,
            provider: insuranceDetail.provider_name,
            sum_insured: null, // Not available in the response
            premium_amount: null, // Not available in the response
            valid_from: null, // Not available in the response
            valid_till: null, // Not available in the response
            insurance_type_name: null // Not available in the response
          }
        };

        setVerificationResult({
          status: 'SUCCESS',
          message: 'Using existing policy details',
          data: formattedData
        });
      } else {
        const newPolicy = await generateInsurancePolicy({
          visit_id: visitedId,
          policy_id: selectedPolicies.id,
        });
  
        if (!newPolicy || !newPolicy.data) {
          throw new Error('Failed to generate policy: Invalid response');
        }
  
        setInsuranceId(newPolicy.data.id);
        setVerificationResult({
          status: 'SUCCESS',
          message: newPolicy.message || 'Policy generated successfully',
          data: newPolicy.data
        });
      }

      // Generate new policy if none exists

    } catch (error) {
      console.error('Policy generation error:', error);
      setVerificationResult({
        status: 'ERROR',
        message: error.message || 'Failed to process insurance policy. Please try again.'
      });
      setError('Policy generation failed');
    } finally {
      setVerifying(false);
    }
  };

  // Using useEffect to fetch policies when component mounts
  useEffect(() => {
    const fetchPolicies = async () => {
      // Get patient_id from URL 
      console.log("Patient ID from URL:==============", patientId);
      if (patientId) {
        try {
          setLoading(true);
          setError(null);
          const res = await getAllPoliciesofPatient(patientId);
          setPolicies(res);
          if (res && res.length > 0) {
            setSelectedPolicies(res[0]);
          }
        } catch (error) {
          console.error("Error fetching policies:", error);
          setError("Failed to fetch insurance policies. Please try again.");
          setPolicies([]);
        } finally {
          setLoading(false);
        }
      }
    };

    fetchPolicies();
  }, [patientId]); 
  
  const verifyPolicy = async () => {
    if (!selectedPolicies || !insuranceId) return;
    try {
      setVerifying(true);
      const response = await verifyClaim(insuranceId);
      if(response.task_id ) {
        const res = await getResult(insuranceId);
        if (res) {
          setVerificationDetails(res);
          // Update verification result with the verification details
          setVerificationResult(prev => ({
            ...prev,
            verificationStatus: res.status,
            isApproved: res.is_approved,
            confidenceScore: res.confidence_score,
            summary: res.summary
          }));
        }
      }
    } catch (error) {
      console.error('Error verifying claim:', error);
    } finally {
      setVerifying(false);
    }}
  
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">Insurance Validation</h1>
          <p className="text-sm text-gray-500 mt-1">
            Manage insurance types, policies, and claims processing
          </p>
        </div>
      </header>

      {/* Main Content */}
      <main className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
                <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                  <button
                  onClick={() => setActiveTab('claims')}
                  className={`${
                    activeTab === 'claims'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                  Claims
                  </button>
                </nav>
                </div>

                
                
                <div className="mt-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                    <h2 className="text-lg font-medium text-gray-900">Insurance Claims</h2>
                    
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>Loading policies...</span>
                      </div>
                    ) : error ? (
                      <div className="text-red-500">{error}</div>
                    ) : (
                      <select
                        className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                        value={selectedPolicies?.id || ''}
                        onChange={(e) => {
                          const selected = policies.find(policy => policy.id === e.target.value);
                          setSelectedPolicies(selected);
                        }}
                        disabled={loading || policies.length === 0}
                      >
                        <option value="">Select a policy</option>
                        {policies.map((policy) => (
                          <option key={policy.id} value={policy.id}>
                            {policy.policy_number || policy.name || `Policy ${policy.id}`}
                          </option>
                        ))}
                      </select>
                    )}
                  </div>
                  
                  {!loading && policies.length === 0 && !error && (
                    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 my-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-yellow-700">
                            No insurance policies found for this patient.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
                
                {/* Display selected policy details */}
                {selectedPolicies && (
                  <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">Policy Details</h3>
                      <p className="mt-1 max-w-2xl text-sm text-gray-500">Insurance policy information for patient.</p>
                    </div>
                    <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                      <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Policy Number</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedPolicies.policy_number || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Insurance Provider</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedPolicies.provider || selectedPolicies.name || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Status</dt>
                          <dd className="mt-1 text-sm text-gray-900">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${selectedPolicies.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {selectedPolicies.is_active ? 'Active' : 'Inactive'}
                            </span>
                          </dd>
                        </div>
                        <div className="sm:col-span-1">
                          <dt className="text-sm font-medium text-gray-500">Expiry Date</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedPolicies.expiry_date || 'N/A'}</dd>
                        </div>
                        <div className="sm:col-span-2">
                          <dt className="text-sm font-medium text-gray-500">Coverage Details</dt>
                          <dd className="mt-1 text-sm text-gray-900">{selectedPolicies.coverage_details || 'No coverage details available'}</dd>
                        </div>
                      </dl>
                    </div>
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                      <button
                        type="button"
                        onClick={generatePolicy}
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        {verifying ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Generating...
                          </>
                        ) : (
                          'Generate Verification Form'
                        )}
                      </button>
                    </div>
                  </div>
                )}
                
                {/* Generated Insurance Form Display */}
                {verificationResult && verificationResult.status === 'SUCCESS' && verificationResult.data && (
                  <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 bg-green-50">
                      <h3 className="text-lg leading-6 font-medium text-green-800">Insurance Form Generated</h3>
                      <p className="mt-1 max-w-2xl text-sm text-green-600">{verificationResult.message}</p>
                    </div>
                    
                    <div className="border-t border-gray-200">
                      {/* Policy Information */}
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <div className="text-sm font-medium text-gray-500">Policy Information</div>
                        <div className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <span className="block text-xs text-gray-500">Policy Number</span>
                                <span className="block font-medium">{verificationResult.data.policy?.policy_number || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500">Provider</span>
                                <span className="block font-medium">{verificationResult.data.policy?.provider || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500">Type</span>
                                <span className="block font-medium">{verificationResult.data.policy?.insurance_type_name || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500">Valid From - Till</span>
                                <span className="block font-medium">
                                  {verificationResult.data.policy?.valid_from || 'N/A'} to {verificationResult.data.policy?.valid_till || 'N/A'}
                                </span>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500">Sum Insured</span>
                                <span className="block font-medium">${verificationResult.data.policy?.sum_insured || 'N/A'}</span>
                              </div>
                              <div>
                                <span className="block text-xs text-gray-500">Premium</span>
                                <span className="block font-medium">${verificationResult.data.policy?.premium_amount || 'N/A'}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Claim Details */}
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <div className="text-sm font-medium text-gray-500">
                          Claim Details
                          {verificationDetails && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                                verificationDetails.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {verificationDetails.status === 'completed' ? 'Verification Completed' : 'Pending Verification'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {/* Verification Summary */}
                          {verificationDetails && (
                            <div className="mb-4 p-4 rounded-md border border-yellow-200 bg-yellow-50">
                              <h4 className="text-sm font-semibold text-yellow-800">Verification Summary</h4>
                              <p className="mt-1 text-sm text-yellow-700">{verificationDetails.summary}</p>
                              <div className="mt-2 flex items-center">
                                <span className="text-xs font-medium text-yellow-800">Confidence Score:</span>
                                <div className="ml-2 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-yellow-500" style={{ width: `${verificationDetails.confidence_score * 100}%` }}></div>
                                </div>
                                <span className="ml-2 text-xs text-yellow-800">{(verificationDetails.confidence_score * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <span className="block text-xs text-gray-500">Reference Number</span>
                              <span className="block font-medium">{verificationResult.data.reference_number || 'Not yet assigned'}</span>
                            </div>
                            <div>
                              <span className="block text-xs text-gray-500">Status</span>
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium ${
                                verificationDetails ? 
                                  (verificationDetails.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800') :
                                  (verificationResult.data.status === 'draft' ? 'bg-yellow-100 text-yellow-800' : 
                                  verificationResult.data.status === 'approved' ? 'bg-green-100 text-green-800' : 
                                  'bg-gray-100 text-gray-800')
                              }`}>
                                {verificationDetails ? 
                                  (verificationDetails.is_approved ? 'Approved' : 'Rejected') : 
                                  (verificationResult.data.status_display || 'Draft')}
                              </span>
                            </div>
                            
                            {/* Treatment Type with verification */}
                            <div className="relative group">
                              <div className="flex items-center">
                                <span className="block text-xs text-gray-500">Treatment Type</span>
                                {verificationDetails && verificationDetails.treatment_verification && (
                                  <span className={`ml-2 h-3 w-3 rounded-full ${
                                    verificationDetails.treatment_verification.is_approved ? 'bg-green-500' : 'bg-red-500'
                                  }`}></span>
                                )}
                              </div>
                              <span className="block font-medium">{verificationResult.data.treatment_type_display || 'N/A'}</span>
                              {verificationDetails && verificationDetails.treatment_verification && (
                                <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                  <p className="text-xs text-gray-700">{verificationDetails.treatment_verification.notes}</p>
                                  <div className="mt-2">
                                    <span className="text-xs font-medium">Confidence: {(verificationDetails.treatment_verification.confidence_score * 100).toFixed(0)}%</span>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Hospitalization info */}
                            <div>
                              <span className="block text-xs text-gray-500">Hospitalization</span>
                              <span className="block font-medium">{verificationResult.data.hospitalization_type_display || 'N/A'}</span>
                            </div>
                            
                            {/* Provider Type with verification */}
                            <div className="relative group">
                              <div className="flex items-center">
                                <span className="block text-xs text-gray-500">Provider Type</span>
                                {verificationDetails && verificationDetails.eligibility_verification && (
                                  <span className={`ml-2 h-3 w-3 rounded-full ${
                                    verificationDetails.eligibility_verification.verification_result.policy_active ? 'bg-green-500' : 'bg-red-500'
                                  }`}></span>
                                )}
                              </div>
                              <span className="block font-medium">{verificationResult.data.provider_type_display || 'N/A'}</span>
                              {verificationDetails && verificationDetails.eligibility_verification && (
                                <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                  <p className="text-xs text-gray-700">{verificationDetails.eligibility_verification.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Cashless Claim */}
                            <div>
                              <span className="block text-xs text-gray-500">Cashless Claim</span>
                              <span className="block font-medium">{verificationResult.data.is_cashless_claim ? 'Yes' : 'No'}</span>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                            {/* Diagnostic verification */}
                            <div className="relative group">
                              <div className="flex items-center">
                                <span className="block text-xs text-gray-500">Diagnosis</span>
                                {verificationDetails && verificationDetails.diagnostic_verification && (
                                  <span className={`ml-2 h-3 w-3 rounded-full ${
                                    verificationDetails.diagnostic_verification.is_approved ? 'bg-green-500' : 'bg-red-500'
                                  }`}></span>
                                )}
                              </div>
                              <span className="block font-medium">{verificationResult.data.diagnosis || 'Not specified'}</span>
                              {verificationDetails && verificationDetails.diagnostic_verification && (
                                <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                  <p className="text-xs text-gray-700">{verificationDetails.diagnostic_verification.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            <div>
                              <span className="block text-xs text-gray-500">ICD Code</span>
                              <span className={`block font-medium ${verificationDetails && verificationDetails.diagnostic_verification && !verificationDetails.diagnostic_verification.verification_result.icd_code_appropriate ? 'text-red-600' : ''}`}>
                                {verificationResult.data.icd_code || 'Not specified'}
                              </span>
                            </div>
                            
                            <div>
                              <span className="block text-xs text-gray-500">Admission Date</span>
                              <span className="block font-medium">{verificationResult.data.admission_date || 'N/A'}</span>
                            </div>
                            
                            <div>
                              <span className="block text-xs text-gray-500">Expected Discharge</span>
                              <span className="block font-medium">{verificationResult.data.expected_discharge_date || 'N/A'}</span>
                            </div>
                            
                            <div>
                              <span className="block text-xs text-gray-500">Expected Stay (Days)</span>
                              <span className="block font-medium">{verificationResult.data.expected_days_of_stay || 'N/A'}</span>
                            </div>
                            
                            {/* Treating doctor with fraud detection */}
                            <div className="relative group">
                              <div className="flex items-center">
                                <span className="block text-xs text-gray-500">Treating Doctor</span>
                                {verificationDetails && verificationDetails.fraud_detection && (
                                  <span className={`ml-2 h-3 w-3 rounded-full ${
                                    verificationDetails.fraud_detection.verification_result.fraud_risk_level === 'low' ? 'bg-green-500' : 'bg-red-500'
                                  }`}></span>
                                )}
                              </div>
                              <span className="block font-medium">{verificationResult.data.treating_doctor || 'N/A'}</span>
                              {verificationDetails && verificationDetails.fraud_detection && (
                                <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                  <h5 className="text-xs font-bold">Fraud Risk: {verificationDetails.fraud_detection.verification_result.fraud_risk_level}</h5>
                                  <p className="text-xs text-gray-700 mt-1">{verificationDetails.fraud_detection.notes}</p>
                                </div>
                              )}
                            </div>
                            
                            {/* Past Medical History */}
                            <div className="relative group">
                              <div className="flex items-center">
                                <span className="block text-xs text-gray-500">Past Medical History</span>
                                {verificationDetails && verificationDetails.fraud_detection && (
                                  <span className={`ml-2 h-3 w-3 rounded-full ${
                                    !verificationDetails.fraud_detection.verification_result.no_inconsistencies_detected ? 'bg-red-500' : 'bg-green-500'
                                  }`}></span>
                                )}
                              </div>
                              <span className="block font-medium">{verificationResult.data.past_history || 'None'}</span>
                              {verificationDetails && verificationDetails.fraud_detection && (
                                <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                  <p className="text-xs text-gray-700">
                                    {verificationDetails.fraud_detection.verification_result.no_inconsistencies_detected ? 
                                      'No inconsistencies detected in medical history.' : 
                                      'Inconsistencies detected in medical history. Review required.'}
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Financial Details */}
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <div className="text-sm font-medium text-gray-500">
                          Financial Details
                          {verificationDetails && verificationDetails.billing_verification && (
                            <div className="mt-2">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold ${
                                verificationDetails.billing_verification.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {verificationDetails.billing_verification.is_approved ? 'Billing Verified' : 'Billing Issues Detected'}
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {/* Billing verification notes */}
                          {verificationDetails && verificationDetails.billing_verification && !verificationDetails.billing_verification.is_approved && (
                            <div className="mb-4 p-3 rounded-md border border-red-200 bg-red-50">
                              <p className="text-xs text-red-700">{verificationDetails.billing_verification.notes}</p>
                              <div className="mt-2 flex items-center">
                                <span className="text-xs font-medium text-red-800">Confidence:</span>
                                <div className="ml-2 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                  <div className="h-full bg-red-500" style={{ width: `${verificationDetails.billing_verification.confidence_score * 100}%` }}></div>
                                </div>
                                <span className="ml-2 text-xs text-red-800">{(verificationDetails.billing_verification.confidence_score * 100).toFixed(0)}%</span>
                              </div>
                            </div>
                          )}
                        
                          <div className="bg-white p-4 rounded-md border border-gray-200">
                            <div className="grid grid-cols-2 gap-4">
                              {/* Claim Amount with hover verification */}
                              <div className="relative group">
                                <div className="flex items-center">
                                  <span className="block text-xs text-gray-500">Claim Amount</span>
                                  {verificationDetails && verificationDetails.billing_verification && (
                                    <span className={`ml-2 h-3 w-3 rounded-full ${
                                      verificationDetails.billing_verification.verification_result.charges_reasonable ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                  )}
                                </div>
                                <span className="block font-medium">${verificationResult.data.claim_amount || '0.00'}</span>
                                {verificationDetails && verificationDetails.billing_verification && (
                                  <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                    <p className="text-xs text-gray-700">
                                      {verificationDetails.billing_verification.verification_result.charges_reasonable ? 
                                        'Charges appear reasonable for the services provided.' : 
                                        'Charges appear unreasonable or excessive for the services provided.'}
                                    </p>
                                    {verificationDetails.billing_verification.verification_result.total_matches_itemized && (
                                      <p className="text-xs text-green-700 mt-1">Total matches itemized charges.</p>
                                    )}
                                  </div>
                                )}
                              </div>
                              
                              {/* Room Rent */}
                              <div>
                                <span className="block text-xs text-gray-500">Room Rent (per day)</span>
                                <span className="block font-medium">${verificationResult.data.room_rent_per_day || '0.00'}</span>
                              </div>
                              
                              {/* Professional Fees with hover verification */}
                              <div className="relative group">
                                <div className="flex items-center">
                                  <span className="block text-xs text-gray-500">Professional Fees</span>
                                  {verificationDetails && verificationDetails.billing_verification && (
                                    <span className={`ml-2 h-3 w-3 rounded-full ${
                                      verificationDetails.billing_verification.verification_result.services_medically_necessary ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                  )}
                                </div>
                                <span className="block font-medium">${verificationResult.data.professional_fees || '0.00'}</span>
                                {verificationDetails && verificationDetails.billing_verification && (
                                  <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                    <p className="text-xs text-gray-700">
                                      {verificationDetails.billing_verification.verification_result.services_medically_necessary ? 
                                        'Professional services appear medically necessary.' : 
                                        'Professional services may not be medically necessary based on diagnosis and treatment plan.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                              
                              {/* Approved Amount with verification */}
                              <div className="relative group">
                                <div className="flex items-center">
                                  <span className="block text-xs text-gray-500">Approved Amount</span>
                                  {verificationDetails && (
                                    <span className={`ml-2 h-3 w-3 rounded-full ${
                                      verificationDetails.is_approved ? 'bg-green-500' : 'bg-red-500'
                                    }`}></span>
                                  )}
                                </div>
                                <span className={`block font-medium ${verificationDetails && !verificationDetails.is_approved ? 'text-red-600' : ''}`}>
                                  {verificationDetails && !verificationDetails.is_approved ? 'Rejected' : 
                                   (verificationResult.data.approved_amount ? `$${verificationResult.data.approved_amount}` : 'Pending')}
                                </span>
                                {verificationDetails && (
                                  <div className="absolute z-10 invisible group-hover:visible bg-white border border-gray-200 p-3 rounded shadow-lg w-64 mt-1">
                                    <p className="text-xs text-gray-700">
                                      {verificationDetails.is_approved ? 
                                        'Claim has been approved for payment.' : 
                                        'Claim has been rejected. See summary for details.'}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* AI Verification Status */}
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <div className="text-sm font-medium text-gray-500">
                          AI Verification Status
                          {verificationDetails && (
                            <div className="mt-1 text-xs text-gray-500">
                              {verificationDetails.completed_at ? 
                                `Completed on ${new Date(verificationDetails.completed_at).toLocaleDateString()} at ${new Date(verificationDetails.completed_at).toLocaleTimeString()}` : 
                                'In progress'
                              }
                            </div>
                          )}
                        </div>
                        <div className="mt-1 text-sm text-gray-900 sm:col-span-2">
                          {!verificationDetails ? (
                            <>
                              <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                verificationResult.data.is_ai_approved ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {verificationResult.data.is_ai_approved ? 'Approved by AI' : 'Pending AI Verification'}
                              </div>
                              {verificationResult.data.ai_confidence_score && (
                                <div className="mt-2">
                                  <span className="text-xs text-gray-500">Confidence Score: </span>
                                  <span>{verificationResult.data.ai_confidence_score}%</span>
                                </div>
                              )}
                              {verificationResult.data.ai_analysis && (
                                <div className="mt-2">
                                  <span className="block text-xs text-gray-500">AI Analysis</span>
                                  <span className="block mt-1 text-sm">{verificationResult.data.ai_analysis}</span>
                                </div>
                              )}
                            </>
                          ) : (
                            <>
                              <div className="mb-4">
                                <div className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                  verificationDetails.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                }`}>
                                  {verificationDetails.is_approved ? 'Approved' : 'Rejected'}
                                </div>
                                <div className="mt-3 flex items-center">
                                  <span className="text-xs font-medium text-gray-700">Overall Confidence:</span>
                                  <div className="ml-2 h-2 w-24 bg-gray-200 rounded-full overflow-hidden">
                                    <div className={`h-full ${verificationDetails.is_approved ? 'bg-green-500' : 'bg-red-500'}`} 
                                      style={{ width: `${verificationDetails.confidence_score * 100}%` }}></div>
                                  </div>
                                  <span className="ml-2 text-xs text-gray-700">{(verificationDetails.confidence_score * 100).toFixed(0)}%</span>
                                </div>
                              </div>
                              
                              <div className="space-y-4">
                                {/* Eligibility Check */}
                                <div className="p-3 rounded-md border border-gray-200 bg-gray-50">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-sm font-semibold">Eligibility Check</h5>
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      verificationDetails.eligibility_verification.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {verificationDetails.eligibility_verification.is_approved ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>
                                  <ul className="mt-2 space-y-1">
                                    <li className="flex items-center text-xs">
                                      <span className={`h-2 w-2 rounded-full mr-2 ${verificationDetails.eligibility_verification.verification_result.policy_active ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      Policy Active
                                    </li>
                                    <li className="flex items-center text-xs">
                                      <span className={`h-2 w-2 rounded-full mr-2 ${verificationDetails.eligibility_verification.verification_result.waiting_period_satisfied ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      Waiting Period Satisfied
                                    </li>
                                    <li className="flex items-center text-xs">
                                      <span className={`h-2 w-2 rounded-full mr-2 ${verificationDetails.eligibility_verification.verification_result.preauth_requirements_met ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      Pre-authorization Requirements
                                    </li>
                                  </ul>
                                </div>
                                
                                {/* Diagnostic Check */}
                                <div className="p-3 rounded-md border border-gray-200 bg-gray-50">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-sm font-semibold">Diagnostic Check</h5>
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      verificationDetails.diagnostic_verification.is_approved ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                    }`}>
                                      {verificationDetails.diagnostic_verification.is_approved ? 'Passed' : 'Failed'}
                                    </span>
                                  </div>
                                  <ul className="mt-2 space-y-1">
                                    <li className="flex items-center text-xs">
                                      <span className={`h-2 w-2 rounded-full mr-2 ${verificationDetails.diagnostic_verification.verification_result.icd_code_appropriate ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      ICD Code Appropriate
                                    </li>
                                    <li className="flex items-center text-xs">
                                      <span className={`h-2 w-2 rounded-full mr-2 ${verificationDetails.diagnostic_verification.verification_result.sufficient_medical_evidence ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      Sufficient Medical Evidence
                                    </li>
                                  </ul>
                                </div>
                                
                                {/* Fraud Risk */}
                                <div className="p-3 rounded-md border border-gray-200 bg-gray-50">
                                  <div className="flex justify-between items-center">
                                    <h5 className="text-sm font-semibold">Fraud Detection</h5>
                                    <span className={`px-2 py-1 rounded-md text-xs font-medium ${
                                      verificationDetails.fraud_detection.verification_result.fraud_risk_level === 'low' ? 'bg-green-100 text-green-800' : 
                                      verificationDetails.fraud_detection.verification_result.fraud_risk_level === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                                      'bg-red-100 text-red-800'
                                    }`}>
                                      {verificationDetails.fraud_detection.verification_result.fraud_risk_level.charAt(0).toUpperCase() + 
                                       verificationDetails.fraud_detection.verification_result.fraud_risk_level.slice(1)} Risk
                                    </span>
                                  </div>
                                  <ul className="mt-2 space-y-1">
                                    <li className="flex items-center text-xs">
                                      <span className={`h-2 w-2 rounded-full mr-2 ${verificationDetails.fraud_detection.verification_result.no_inconsistencies_detected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      No Inconsistencies
                                    </li>
                                    <li className="flex items-center text-xs">
                                      <span className={`h-2 w-2 rounded-full mr-2 ${verificationDetails.fraud_detection.verification_result.no_suspicious_patterns ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                      No Suspicious Patterns
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="px-4 py-3 bg-gray-50 text-right sm:px-6 border-t border-gray-200">
                      {!verificationDetails ? (
                        <button
                          type="button"
                          onClick={verifyPolicy}
                          className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                          disabled={verifying}
                        >
                          {verifying ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Verifying...
                            </>
                          ) : (
                            'Start AI Verification'
                          )}
                        </button>
                      ) : (
                        <>
                          {/* <button
                            type="button"
                            className={`inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white mr-2 ${
                              verificationDetails.is_approved ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                            onClick={() => {
                              // In a real app, this would submit the claim for processing or rejection
                              alert(verificationDetails.is_approved ? 
                                'Claim approved and submitted for processing!' : 
                                'Claim rejected due to verification issues.');
                            }}
                          >
                            {verificationDetails.is_approved ? 'Process Approved' : 'Reject Claim'}
                          </button> */}
                          
                          <button
                            type="button"
                            onClick={() => {
                              // Clear the verification result to hide the form
                              setVerificationDetails(null);
                            }}
                            className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Back to Form
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Error message if verification failed */}
                {verificationResult && verificationResult.status === 'ERROR' && (
                  <div className="mt-4 bg-red-50 border-l-4 border-red-400 p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-700">
                          {verificationResult.message}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
                
              </div>
              </main>
              {/* Insurance Form Modal */}
      
    </div>
  );
}
