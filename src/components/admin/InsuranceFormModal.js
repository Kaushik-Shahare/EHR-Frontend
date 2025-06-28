'use client';

import React, { useState, useEffect } from 'react';
import { insuranceService } from '@/services/insuranceService';

export default function InsuranceFormModal({ isOpen, onClose, visitId, patientId, onSuccess }) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    visit: visitId || '',
    policy: '',
    diagnosis: '',
    treatment_description: '',
    claim_amount: '',
    status: 'draft',
    is_cashless_claim: false,
    icd_code: '',
    treatment_type: 'planned',
    hospitalization_type: 'shared_room',
    expected_days_of_stay: '',
    treating_doctor: '',
  });
  
  const [policies, setPolicies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && patientId) {
      fetchPatientPolicies();
    }
  }, [isOpen, patientId]);

  const fetchPatientPolicies = async () => {
    try {
      setLoading(true);
      const response = await insuranceService.getPatientPolicies(patientId);
      setPolicies(response.data);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching patient policies:', err);
      setError('Failed to fetch patient policies. Please try again.');
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handlePolicyChange = (e) => {
    const policyId = e.target.value;
    setFormData({
      ...formData,
      policy: policyId,
      is_cashless_claim: policies.find(p => p.id.toString() === policyId)?.insurance_type?.is_cashless || false
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      let response;
      
      if (visitId) {
        // Use the auto-create endpoint if we have a visit ID
        response = await insuranceService.createFormFromVisit(
          visitId,
          formData.policy,
          formData.is_cashless_claim
        );
      } else {
        // Use the regular create endpoint
        response = await insuranceService.createInsuranceForm(formData);
      }
      
      setSuccess(true);
      setLoading(false);
      
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Close modal after a delay
      setTimeout(() => {
        onClose();
      }, 2000);
      
    } catch (err) {
      console.error('Error creating insurance form:', err);
      setError('Failed to create insurance form. Please check your inputs and try again.');
      setLoading(false);
    }
  };

  const nextStep = () => {
    setStep(step + 1);
  };

  const prevStep = () => {
    setStep(step - 1);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">
              {visitId ? 'Create Insurance Claim for Visit' : 'New Insurance Claim'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 p-4 rounded-md">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {success ? (
            <div className="mb-4 bg-green-50 p-4 rounded-md text-center">
              <svg className="mx-auto h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <p className="mt-2 text-sm text-green-800">Insurance claim created successfully!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              <div className="mb-6">
                <div className="flex mb-4">
                  {[1, 2, 3].map((stepNum) => (
                    <div key={stepNum} className="flex-1">
                      <div
                        className={`h-2 ${
                          stepNum <= step ? 'bg-indigo-500' : 'bg-gray-200'
                        } ${stepNum === 1 ? 'rounded-l-full' : ''} ${
                          stepNum === 3 ? 'rounded-r-full' : ''
                        }`}
                      ></div>
                      <p
                        className={`text-xs mt-1 text-center ${
                          stepNum <= step ? 'text-indigo-500' : 'text-gray-500'
                        }`}
                      >
                        {stepNum === 1
                          ? 'Policy Selection'
                          : stepNum === 2
                          ? 'Claim Details'
                          : 'Review & Submit'}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step 1: Policy Selection */}
              {step === 1 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Select Insurance Policy</h3>
                  
                  {loading ? (
                    <div className="flex justify-center my-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                    </div>
                  ) : (
                    <>
                      {policies.length === 0 ? (
                        <div className="bg-yellow-50 p-4 rounded-md mb-4">
                          <p className="text-yellow-700">No active insurance policies found for this patient.</p>
                        </div>
                      ) : (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700">Insurance Policy</label>
                          <select
                            name="policy"
                            value={formData.policy}
                            onChange={handlePolicyChange}
                            required
                            className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="">Select a policy</option>
                            {policies.map((policy) => (
                              <option key={policy.id} value={policy.id}>
                                {policy.policy_number} - {policy.provider} ({policy.insurance_type?.name})
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {formData.policy && (
                        <div className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Claim Type
                          </label>
                          <div className="flex items-center">
                            <input
                              id="cashless"
                              name="is_cashless_claim"
                              type="checkbox"
                              checked={formData.is_cashless_claim}
                              onChange={handleChange}
                              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            />
                            <label htmlFor="cashless" className="ml-2 text-sm text-gray-700">
                              Cashless Claim
                            </label>
                          </div>
                          
                          {formData.is_cashless_claim && (
                            <p className="mt-2 text-xs text-gray-500">
                              Cashless claims require pre-authorization from the insurance provider.
                            </p>
                          )}
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-6 flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!formData.policy || loading}
                      className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        !formData.policy || loading
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 2: Claim Details */}
              {step === 2 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Claim Details</h3>

                  {visitId ? (
                    <p className="mb-4 text-sm text-gray-600">
                      This claim will use diagnosis, treatment, and billing information from the selected visit.
                    </p>
                  ) : (
                    <>
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Diagnosis <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          name="diagnosis"
                          value={formData.diagnosis}
                          onChange={handleChange}
                          required
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">ICD Code</label>
                        <input
                          type="text"
                          name="icd_code"
                          value={formData.icd_code}
                          onChange={handleChange}
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        />
                        <p className="mt-1 text-xs text-gray-500">
                          International Classification of Diseases code (if available)
                        </p>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Treatment Description <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          name="treatment_description"
                          value={formData.treatment_description}
                          onChange={handleChange}
                          rows="3"
                          required
                          className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                        ></textarea>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700">
                          Claim Amount <span className="text-red-500">*</span>
                        </label>
                        <div className="mt-1 relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <span className="text-gray-500 sm:text-sm">$</span>
                          </div>
                          <input
                            type="number"
                            name="claim_amount"
                            value={formData.claim_amount}
                            onChange={handleChange}
                            required
                            min="0"
                            step="0.01"
                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 sm:text-sm border-gray-300 rounded-md"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Treatment Type</label>
                      <select
                        name="treatment_type"
                        value={formData.treatment_type}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="emergency">Emergency</option>
                        <option value="planned">Planned Procedure</option>
                        <option value="maternity">Maternity</option>
                        <option value="day_care">Day Care</option>
                        <option value="outpatient">Outpatient</option>
                        <option value="post_hosp">Post-Hospitalization</option>
                        <option value="domiciliary">Domiciliary</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Hospitalization Type</label>
                      <select
                        name="hospitalization_type"
                        value={formData.hospitalization_type}
                        onChange={handleChange}
                        className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      >
                        <option value="shared_room">Shared Room</option>
                        <option value="single_room">Single Room</option>
                        <option value="icu">ICU</option>
                        <option value="iccu">ICCU</option>
                        <option value="day_care">Day Care</option>
                        <option value="outpatient">Outpatient</option>
                        <option value="na">Not Applicable</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Expected Days of Stay</label>
                      <input
                        type="number"
                        name="expected_days_of_stay"
                        value={formData.expected_days_of_stay}
                        onChange={handleChange}
                        min="1"
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Treating Doctor</label>
                      <input
                        type="text"
                        name="treating_doctor"
                        value={formData.treating_doctor}
                        onChange={handleChange}
                        className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                      />
                    </div>
                  </div>

                  {formData.is_cashless_claim && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-yellow-800">Cashless Claim Information</h3>
                          <div className="mt-2 text-sm text-yellow-700">
                            <p>
                              This claim will be submitted for pre-authorization. The claim status will be updated to "Pre-Authorization Pending" upon submission.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Review & Submit */}
              {step === 3 && (
                <div>
                  <h3 className="text-lg font-medium text-gray-800 mb-4">Review & Submit</h3>

                  <div className="bg-gray-50 rounded-md p-4 mb-6">
                    <dl>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2">
                        <div className="mb-2">
                          <dt className="text-sm font-medium text-gray-500">Insurance Policy</dt>
                          <dd className="text-sm text-gray-900">
                            {policies.find(p => p.id.toString() === formData.policy)?.policy_number || 'Unknown'}
                          </dd>
                        </div>
                        
                        <div className="mb-2">
                          <dt className="text-sm font-medium text-gray-500">Provider</dt>
                          <dd className="text-sm text-gray-900">
                            {policies.find(p => p.id.toString() === formData.policy)?.provider || 'Unknown'}
                          </dd>
                        </div>
                        
                        <div className="mb-2">
                          <dt className="text-sm font-medium text-gray-500">Claim Type</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.is_cashless_claim ? 'Cashless Claim' : 'Reimbursement Claim'}
                          </dd>
                        </div>
                        
                        {!visitId && (
                          <>
                            <div className="mb-2">
                              <dt className="text-sm font-medium text-gray-500">Diagnosis</dt>
                              <dd className="text-sm text-gray-900">{formData.diagnosis}</dd>
                            </div>
                            
                            {formData.icd_code && (
                              <div className="mb-2">
                                <dt className="text-sm font-medium text-gray-500">ICD Code</dt>
                                <dd className="text-sm text-gray-900">{formData.icd_code}</dd>
                              </div>
                            )}
                            
                            <div className="mb-2">
                              <dt className="text-sm font-medium text-gray-500">Treatment Description</dt>
                              <dd className="text-sm text-gray-900">{formData.treatment_description}</dd>
                            </div>
                            
                            <div className="mb-2">
                              <dt className="text-sm font-medium text-gray-500">Claim Amount</dt>
                              <dd className="text-sm text-gray-900">${parseFloat(formData.claim_amount).toFixed(2)}</dd>
                            </div>
                          </>
                        )}
                        
                        <div className="mb-2">
                          <dt className="text-sm font-medium text-gray-500">Treatment Type</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.treatment_type.replace('_', ' ')}
                          </dd>
                        </div>
                        
                        <div className="mb-2">
                          <dt className="text-sm font-medium text-gray-500">Hospitalization Type</dt>
                          <dd className="text-sm text-gray-900">
                            {formData.hospitalization_type.replace('_', ' ')}
                          </dd>
                        </div>
                        
                        {formData.expected_days_of_stay && (
                          <div className="mb-2">
                            <dt className="text-sm font-medium text-gray-500">Expected Days of Stay</dt>
                            <dd className="text-sm text-gray-900">{formData.expected_days_of_stay}</dd>
                          </div>
                        )}
                        
                        {formData.treating_doctor && (
                          <div className="mb-2">
                            <dt className="text-sm font-medium text-gray-500">Treating Doctor</dt>
                            <dd className="text-sm text-gray-900">{formData.treating_doctor}</dd>
                          </div>
                        )}
                      </div>
                    </dl>
                  </div>

                  {visitId ? (
                    <div className="bg-green-50 border border-green-100 rounded-md p-4 mb-4">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm text-green-700">
                            Additional information will be automatically populated from the visit data.
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <div className="mt-6 flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      Back
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className={`ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
                        loading
                          ? 'bg-gray-300 cursor-not-allowed'
                          : 'bg-indigo-600 hover:bg-indigo-700'
                      } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Processing...
                        </>
                      ) : (
                        'Create Claim'
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
