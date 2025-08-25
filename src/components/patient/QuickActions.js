import React, { useState } from 'react';
import { format } from 'date-fns';
import api from '../../services/apiService';

export default function QuickActions({ patientId, sessionToken, visitId }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    start_date: format(new Date(), 'yyyy-MM-dd'),
    end_date: '',
    pharmacy: '',
    instructions: '',
    reason: '',
    visit: visitId || ''
  });
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [prescriptionData, setPrescriptionData] = useState({
    medication_name: '',
    dosage: '',
    frequency: '',
    duration: '',
    start_date: new Date().toISOString().split('T')[0], // Default to today
    end_date: '',
    pharmacy: '',
    instructions: '',
    reason: '',
    visit: visitId
  });
  
  // Diagnosis state
  const [isDiagnosisModalOpen, setIsDiagnosisModalOpen] = useState(false);
  const [diagnosisLoading, setDiagnosisLoading] = useState(false);
  const [diagnosisData, setDiagnosisData] = useState({
    condition_name: '',
    icd_code: '',
    diagnosis_date: new Date().toISOString().split('T')[0], // Default to today
    severity: 'moderate', // Default severity
    status: 'active', // Default status
    notes: '',
    treatment_plan: '',
    visit: visitId
  });
  
  // Lab Result state
  const [isLabResultModalOpen, setIsLabResultModalOpen] = useState(false);
  const [labResultLoading, setLabResultLoading] = useState(false);
  const [labResultData, setLabResultData] = useState({
    test_name: '',
    test_date: new Date().toISOString().split('T')[0], // Default to today
    result: '',
    normal_range: '',
    units: '',
    interpretation: '',
    performed_by: '',
    visit: visitId
  });
  
  // Vital Signs state
  const [isVitalSignsModalOpen, setIsVitalSignsModalOpen] = useState(false);
  const [vitalSignsLoading, setVitalSignsLoading] = useState(false);
  const [vitalSignsData, setVitalSignsData] = useState({
    recorded_by_name: '',
    temperature: '',
    temperature_unit: 'celsius',
    blood_pressure_systolic: '',
    blood_pressure_diastolic: '',
    heart_rate: '',
    respiratory_rate: '',
    oxygen_saturation: '',
    height: '',
    height_unit: 'cm',
    weight: '',
    weight_unit: 'kg',
    bmi: '',
    notes: '',
    visit: visitId
  });

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePrescriptionInputChange = (e) => {
    const { name, value } = e.target;
    setPrescriptionData({
      ...prescriptionData,
      [name]: value
    });
  };

  // Handle diagnosis input changes
  const handleDiagnosisInputChange = (e) => {
    const { name, value } = e.target;
    setDiagnosisData({
      ...diagnosisData,
      [name]: value
    });
  };

  // Handle lab result input changes
  const handleLabResultInputChange = (e) => {
    const { name, value } = e.target;
    setLabResultData({
      ...labResultData,
      [name]: value
    });
  };
  
  // Handle vital signs input changes
  const handleVitalSignsInputChange = (e) => {
    const { name, value } = e.target;
    setVitalSignsData({
      ...vitalSignsData,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setFormError('');
    setFormSuccess('');
    
    try {
      const response = await api.post(`/api/ehr/prescriptions/?session_token=${sessionToken}`, formData);
      
      const data = response.data;
      setFormSuccess('Prescription added successfully');
      setFormData({
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        start_date: format(new Date(), 'yyyy-MM-dd'),
        end_date: '',
        pharmacy: '',
        instructions: '',
        reason: '',
        visit: visitId || ''
      });
      
      // Close modal after successful submission
      setTimeout(() => {
        setIsModalOpen(false);
        setFormSuccess('');
      }, 2000);
      
    } catch (error) {
      console.error('Prescription API error:', error);
      setFormError(error.response?.data?.detail || error.message || 'Failed to add prescription');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmitPrescription = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!prescriptionData.medication_name || !prescriptionData.dosage || 
        !prescriptionData.frequency || !prescriptionData.duration || 
        !prescriptionData.start_date) {
      return;
    }

    try {
      setLoading(true);
      
      const response = await api.post(`/api/ehr/prescriptions/?session_token=${sessionToken}`, {
        ...prescriptionData,
        visit: visitId
      });
      
      const data = response.data;
      setIsPrescriptionModalOpen(false);
      
      // Reset form data
      setPrescriptionData({
        medication_name: '',
        dosage: '',
        frequency: '',
        duration: '',
        start_date: new Date().toISOString().split('T')[0],
        end_date: '',
        pharmacy: '',
        instructions: '',
        reason: '',
        visit: visitId
      });
    } catch (error) {
      console.error('Error adding prescription:', error);
      // You might want to show an error message to the user
      alert(error.response?.data?.detail || error.message || 'Failed to add prescription');
    } finally {
      setLoading(false);
    }
  };

  // Handle diagnosis form submission
  const handleDiagnosisSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!diagnosisData.condition_name || !diagnosisData.diagnosis_date || 
        !diagnosisData.severity || !diagnosisData.status) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setDiagnosisLoading(true);
      
      const response = await api.post(`/api/ehr/diagnoses/?session_token=${sessionToken}`, {
        ...diagnosisData,
        visit: visitId
      });
      
      const data = response.data;
      setIsDiagnosisModalOpen(false);
      
      // Reset form data
      setDiagnosisData({
        condition_name: '',
        icd_code: '',
        diagnosis_date: new Date().toISOString().split('T')[0],
        severity: 'moderate',
        status: 'active',
        notes: '',
        treatment_plan: '',
        visit: visitId
      });
      
      // Show success message
      alert('Diagnosis added successfully');
      
    } catch (error) {
      console.error('Error adding diagnosis:', error);
      alert(error.response?.data?.detail || error.message || 'Failed to add diagnosis');
    } finally {
      setDiagnosisLoading(false);
    }
  };

  // Handle lab result form submission
  const handleLabResultSubmit = async (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!labResultData.test_name || !labResultData.result || 
        !labResultData.test_date) {
      alert('Please fill all required fields');
      return;
    }

    try {
      setLabResultLoading(true);
      
      const response = await api.post(`/api/ehr/lab-results/?session_token=${sessionToken}`, {
        ...labResultData,
        visit: visitId
      });
      
      const data = response.data;
      setIsLabResultModalOpen(false);
      
      // Reset form data
      setLabResultData({
        test_name: '',
        test_date: new Date().toISOString().split('T')[0],
        result: '',
        normal_range: '',
        units: '',
        interpretation: '',
        performed_by: '',
        visit: visitId
      });
      
      // Show success message
      alert('Lab Result added successfully');
      
    } catch (error) {
      console.error('Error adding lab result:', error);
      alert(error.response?.data?.detail || error.message || 'Failed to add lab result');
    } finally {
      setLabResultLoading(false);
    }
  };
  
  // Handle vital signs form submission
  const handleVitalSignsSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setVitalSignsLoading(true);
      
      // Convert empty string values to null for numeric fields
      const processedData = {...vitalSignsData};
      
      // Fields that should be null if empty
      const numericFields = [
        'temperature', 'blood_pressure_systolic', 'blood_pressure_diastolic',
        'heart_rate', 'respiratory_rate', 'oxygen_saturation',
        'height', 'weight', 'bmi'
      ];
      
      // Convert empty strings to null for all numeric fields
      numericFields.forEach(field => {
        if (processedData[field] === '') {
          processedData[field] = null;
        } else if (processedData[field]) {
          // Convert to number if not empty
          processedData[field] = parseFloat(processedData[field]);
        }
      });
      
      // Handle notes and recorded_by_name fields (convert empty string to null)
      if (processedData.notes === '') processedData.notes = null;
      
      const response = await api.post(`/api/ehr/vital-signs/?session_token=${sessionToken}`, {
        ...processedData,
        visit: visitId
      });
      
      const data = response.data;
      setIsVitalSignsModalOpen(false);
      
      // Reset form data
      setVitalSignsData({
        recorded_by_name: '',
        temperature: '',
        temperature_unit: 'celsius',
        blood_pressure_systolic: '',
        blood_pressure_diastolic: '',
        heart_rate: '',
        respiratory_rate: '',
        oxygen_saturation: '',
        height: '',
        height_unit: 'cm',
        weight: '',
        weight_unit: 'kg',
        bmi: '',
        notes: '',
        visit: visitId
      });
      
      // Show success message
      alert('Vital Signs added successfully');
      
    } catch (error) {
      console.error('Error adding vital signs:', error);
      alert(error.response?.data?.detail || error.message || 'Failed to add vital signs');
    } finally {
      setVitalSignsLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3">
            <h3 className="text-lg font-bold">Quick Actions</h3>
        </div>
        <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button 
                  onClick={() => setIsDiagnosisModalOpen(true)}
                  className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                >
                    <svg className="w-6 h-6 text-red-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">Diagnosis</span>
                </button>
                <button 
                  onClick={() => setIsPrescriptionModalOpen(true)}
                  className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                >
                    <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Prescription</span>
                </button>
                <button 
                  onClick={() => setIsLabResultModalOpen(true)}
                  className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                >
                    <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    <span className="text-sm font-medium">Lab Result</span>
                </button>
                <button 
                  onClick={() => setIsVitalSignsModalOpen(true)}
                  className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors"
                >
                    <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 8v8m-4-5v5m-4-2v2m-2 4h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Vital Signs</span>
                </button>
            </div>
        </div>

        {/* Prescription Modal */}
        {isPrescriptionModalOpen && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-lg mx-4">
              <div className="flex justify-between items-center border-b px-6 py-3">
                <h3 className="font-bold text-lg">Add Prescription</h3>
                <button 
                  onClick={() => setIsPrescriptionModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmitPrescription} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Medication Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Medication Name *
                    </label>
                    <input
                      type="text"
                      name="medication_name"
                      value={prescriptionData.medication_name}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* Dosage */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Dosage *
                    </label>
                    <input
                      type="text"
                      name="dosage"
                      value={prescriptionData.dosage}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                      placeholder="e.g., 10mg"
                    />
                  </div>

                  {/* Frequency */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Frequency *
                    </label>
                    <input
                      type="text"
                      name="frequency"
                      value={prescriptionData.frequency}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                      placeholder="e.g., twice daily"
                    />
                  </div>

                  {/* Duration */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Duration (days) *
                    </label>
                    <input
                      type="number"
                      name="duration"
                      value={prescriptionData.duration}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* Start Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Start Date *
                    </label>
                    <input
                      type="date"
                      name="start_date"
                      value={prescriptionData.start_date}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* End Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      End Date
                    </label>
                    <input
                      type="date"
                      name="end_date"
                      value={prescriptionData.end_date}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                    />
                  </div>

                  {/* Pharmacy */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Pharmacy
                    </label>
                    <input
                      type="text"
                      name="pharmacy"
                      value={prescriptionData.pharmacy}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                    />
                  </div>

                  {/* Reason */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Reason
                    </label>
                    <input
                      type="text"
                      name="reason"
                      value={prescriptionData.reason}
                      onChange={handlePrescriptionInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                    />
                  </div>

                  {/* Instructions */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Instructions
                    </label>
                    <textarea
                      name="instructions"
                      value={prescriptionData.instructions}
                      onChange={handlePrescriptionInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="Special instructions for patient"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsPrescriptionModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-doctorTeal text-white rounded-md hover:bg-doctorTeal/90"
                    disabled={loading}
                  >
                    {loading ? 'Adding...' : 'Add Prescription'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Diagnosis Modal */}
        {isDiagnosisModalOpen && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-lg mx-4">
              <div className="flex justify-between items-center border-b px-6 py-3">
                <h3 className="font-bold text-lg">Add Diagnosis</h3>
                <button 
                  onClick={() => setIsDiagnosisModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleDiagnosisSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Condition Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Condition Name *
                    </label>
                    <input
                      type="text"
                      name="condition_name"
                      value={diagnosisData.condition_name}
                      onChange={handleDiagnosisInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* ICD Code */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      ICD Code
                    </label>
                    <input
                      type="text"
                      name="icd_code"
                      value={diagnosisData.icd_code}
                      onChange={handleDiagnosisInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., J11.1"
                    />
                  </div>

                  {/* Diagnosis Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diagnosis Date *
                    </label>
                    <input
                      type="date"
                      name="diagnosis_date"
                      value={diagnosisData.diagnosis_date}
                      onChange={handleDiagnosisInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* Severity */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Severity *
                    </label>
                    <select
                      name="severity"
                      value={diagnosisData.severity}
                      onChange={handleDiagnosisInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    >
                      <option value="mild">Mild</option>
                      <option value="moderate">Moderate</option>
                      <option value="severe">Severe</option>
                    </select>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status *
                    </label>
                    <select
                      name="status"
                      value={diagnosisData.status}
                      onChange={handleDiagnosisInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    >
                      <option value="active">Active</option>
                      <option value="resolved">Resolved</option>
                      <option value="recurrent">Recurrent</option>
                    </select>
                  </div>

                  {/* Notes */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={diagnosisData.notes}
                      onChange={handleDiagnosisInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="Additional notes about the diagnosis"
                    ></textarea>
                  </div>

                  {/* Treatment Plan */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Treatment Plan
                    </label>
                    <textarea
                      name="treatment_plan"
                      value={diagnosisData.treatment_plan}
                      onChange={handleDiagnosisInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="Treatment plan for this diagnosis"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsDiagnosisModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-doctorTeal text-white rounded-md hover:bg-doctorTeal/90"
                    disabled={diagnosisLoading}
                  >
                    {diagnosisLoading ? 'Adding...' : 'Add Diagnosis'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Lab Result Modal */}
        {isLabResultModalOpen && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-lg mx-4">
              <div className="flex justify-between items-center border-b px-6 py-3">
                <h3 className="font-bold text-lg">Add Lab Result</h3>
                <button 
                  onClick={() => setIsLabResultModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleLabResultSubmit} className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Test Name */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Name *
                    </label>
                    <input
                      type="text"
                      name="test_name"
                      value={labResultData.test_name}
                      onChange={handleLabResultInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* Test Date */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Test Date *
                    </label>
                    <input
                      type="date"
                      name="test_date"
                      value={labResultData.test_date}
                      onChange={handleLabResultInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* Result */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Result *
                    </label>
                    <input
                      type="text"
                      name="result"
                      value={labResultData.result}
                      onChange={handleLabResultInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      required
                    />
                  </div>

                  {/* Normal Range */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Normal Range
                    </label>
                    <input
                      type="text"
                      name="normal_range"
                      value={labResultData.normal_range}
                      onChange={handleLabResultInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 4.5-6.0"
                    />
                  </div>

                  {/* Units */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Units
                    </label>
                    <input
                      type="text"
                      name="units"
                      value={labResultData.units}
                      onChange={handleLabResultInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., mg/dL"
                    />
                  </div>

                  {/* Interpretation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Interpretation
                    </label>
                    <input
                      type="text"
                      name="interpretation"
                      value={labResultData.interpretation}
                      onChange={handleLabResultInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., Normal, Abnormal"
                    />
                  </div>

                  {/* Performed By */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Performed By
                    </label>
                    <input
                      type="text"
                      name="performed_by"
                      value={labResultData.performed_by}
                      onChange={handleLabResultInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="Name of the person who performed the test"
                    />
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsLabResultModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-doctorTeal text-white rounded-md hover:bg-doctorTeal/90"
                    disabled={labResultLoading}
                  >
                    {labResultLoading ? 'Adding...' : 'Add Lab Result'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        
        {/* Vital Signs Modal */}
        {isVitalSignsModalOpen && (
          <div className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg w-full max-w-lg mx-4">
              <div className="flex justify-between items-center border-b px-6 py-3">
                <h3 className="font-bold text-lg">Add Vital Signs</h3>
                <button 
                  onClick={() => setIsVitalSignsModalOpen(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleVitalSignsSubmit} className="p-6 max-h-[80vh] overflow-y-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Recorded By */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Recorded By
                    </label>
                    <input
                      type="text"
                      name="recorded_by_name"
                      value={vitalSignsData.recorded_by_name}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="Name of the person who recorded these vitals"
                    />
                  </div>

                  <div className="col-span-2">
                    <h4 className="font-medium text-gray-700 border-b pb-1 mb-3">Temperature</h4>
                  </div>
                  
                  {/* Temperature */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="temperature"
                      value={vitalSignsData.temperature}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 37.0"
                    />
                  </div>
                  
                  {/* Temperature Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Temperature Unit
                    </label>
                    <select
                      name="temperature_unit"
                      value={vitalSignsData.temperature_unit}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                    >
                      <option value="celsius">Celsius</option>
                      <option value="fahrenheit">Fahrenheit</option>
                    </select>
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="font-medium text-gray-700 border-b pb-1 mb-3">Blood Pressure</h4>
                  </div>
                  
                  {/* Blood Pressure (Systolic) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Systolic (mmHg)
                    </label>
                    <input
                      type="number"
                      name="blood_pressure_systolic"
                      value={vitalSignsData.blood_pressure_systolic}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 120"
                    />
                  </div>
                  
                  {/* Blood Pressure (Diastolic) */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Diastolic (mmHg)
                    </label>
                    <input
                      type="number"
                      name="blood_pressure_diastolic"
                      value={vitalSignsData.blood_pressure_diastolic}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 80"
                    />
                  </div>

                  <div className="col-span-2">
                    <h4 className="font-medium text-gray-700 border-b pb-1 mb-3">Other Measurements</h4>
                  </div>
                  
                  {/* Heart Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Heart Rate (bpm)
                    </label>
                    <input
                      type="number"
                      name="heart_rate"
                      value={vitalSignsData.heart_rate}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 72"
                    />
                  </div>
                  
                  {/* Respiratory Rate */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Respiratory Rate (breaths/min)
                    </label>
                    <input
                      type="number"
                      name="respiratory_rate"
                      value={vitalSignsData.respiratory_rate}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 16"
                    />
                  </div>
                  
                  {/* Oxygen Saturation */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      O₂ Saturation (%)
                    </label>
                    <input
                      type="number"
                      name="oxygen_saturation"
                      value={vitalSignsData.oxygen_saturation}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 98"
                      min="0"
                      max="100"
                    />
                  </div>
                  
                  <div className="col-span-2">
                    <h4 className="font-medium text-gray-700 border-b pb-1 mb-3">Body Measurements</h4>
                  </div>
                  
                  {/* Height */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="height"
                      value={vitalSignsData.height}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 175"
                    />
                  </div>
                  
                  {/* Height Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Height Unit
                    </label>
                    <select
                      name="height_unit"
                      value={vitalSignsData.height_unit}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                    >
                      <option value="cm">Centimeters (cm)</option>
                      <option value="in">Inches (in)</option>
                    </select>
                  </div>
                  
                  {/* Weight */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="weight"
                      value={vitalSignsData.weight}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 70"
                    />
                  </div>
                  
                  {/* Weight Unit */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Weight Unit
                    </label>
                    <select
                      name="weight_unit"
                      value={vitalSignsData.weight_unit}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                    >
                      <option value="kg">Kilograms (kg)</option>
                      <option value="lb">Pounds (lb)</option>
                    </select>
                  </div>
                  
                  {/* BMI */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      BMI
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="bmi"
                      value={vitalSignsData.bmi}
                      onChange={handleVitalSignsInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="e.g., 22.9"
                    />
                  </div>
                  
                  {/* Notes */}
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      name="notes"
                      value={vitalSignsData.notes}
                      onChange={handleVitalSignsInputChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-doctorTeal"
                      placeholder="Any additional notes about the vital signs"
                    ></textarea>
                  </div>
                </div>

                <div className="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsVitalSignsModalOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-doctorTeal text-white rounded-md hover:bg-doctorTeal/90"
                    disabled={vitalSignsLoading}
                  >
                    {vitalSignsLoading ? 'Adding...' : 'Add Vital Signs'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
    </div>
  )
}
