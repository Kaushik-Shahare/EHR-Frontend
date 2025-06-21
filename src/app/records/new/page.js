'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useRecords } from '@/context/RecordContext';

export default function NewRecordPage() {
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { createVisitRecord, createDiagnosisRecord, createLabResultRecord, createPrescriptionRecord, createVitalSignsRecord, loading, error } = useRecords();
  
  const [recordType, setRecordType] = useState('VISIT');
  const [patientId, setPatientId] = useState('');
  const [patients, setPatients] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  // Redirect if not authenticated or not a provider
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    } else if (
      !authLoading && 
      isAuthenticated && 
      user && 
      user.role !== 'DOCTOR' && 
      user.role !== 'NURSE' && 
      user.role !== 'ADMIN'
    ) {
      router.push('/dashboard');
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Function to create a new record based on type
  const onSubmit = async (data) => {
    try {
      setSubmitting(true);
      setSuccess(false);
      
      let response;
      
      switch(recordType) {
        case 'VISIT':
          response = await createVisitRecord(data);
          break;
        case 'DIAGNOSIS':
          response = await createDiagnosisRecord(data);
          break;
        case 'LAB_RESULT':
          response = await createLabResultRecord(data);
          break;
        case 'PRESCRIPTION':
          response = await createPrescriptionRecord(data);
          break;
        case 'VITAL_SIGNS':
          response = await createVitalSignsRecord(data);
          break;
        default:
          throw new Error('Invalid record type');
      }
      
      setSuccess(true);
      reset();
      
      // Navigate to the newly created record
      if (response && response.id) {
        setTimeout(() => {
          router.push(`/records/${response.id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('Error creating record:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (user && (user.role !== 'DOCTOR' && user.role !== 'NURSE' && user.role !== 'ADMIN'))) {
    return (
      <MainLayout title="New Medical Record">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="Create New Record">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">Create New Medical Record</h1>
          <Link href="/records">
            <button className="px-4 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50">
              Cancel
            </button>
          </Link>
        </div>
        
        {/* Record type selection */}
        <div className="bg-white shadow-sm rounded-md p-6 mb-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Select Record Type</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            <button
              type="button"
              onClick={() => setRecordType('VISIT')}
              className={`p-3 border rounded-md ${
                recordType === 'VISIT'
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Visit
            </button>
            <button
              type="button"
              onClick={() => setRecordType('DIAGNOSIS')}
              className={`p-3 border rounded-md ${
                recordType === 'DIAGNOSIS'
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Diagnosis
            </button>
            <button
              type="button"
              onClick={() => setRecordType('LAB_RESULT')}
              className={`p-3 border rounded-md ${
                recordType === 'LAB_RESULT'
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Lab Result
            </button>
            <button
              type="button"
              onClick={() => setRecordType('PRESCRIPTION')}
              className={`p-3 border rounded-md ${
                recordType === 'PRESCRIPTION'
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Prescription
            </button>
            <button
              type="button"
              onClick={() => setRecordType('VITAL_SIGNS')}
              className={`p-3 border rounded-md ${
                recordType === 'VITAL_SIGNS'
                  ? 'bg-blue-100 border-blue-500 text-blue-700'
                  : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              Vital Signs
            </button>
          </div>
        </div>

        {/* Error message */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        
        {/* Success message */}
        {success && (
          <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-6">
            <p className="text-green-700">Record created successfully! Redirecting...</p>
          </div>
        )}
        
        {/* Record form */}
        <div className="bg-white shadow-sm rounded-md p-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Common fields for all record types */}
            <div className="mb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">General Information</h3>
              
              {/* Patient ID */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="patientId">
                  Patient ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="patientId"
                  type="text"
                  className={`w-full p-2 border rounded-md ${errors.patientId ? 'border-red-500' : 'border-gray-300'}`}
                  {...register('patientId', { required: 'Patient ID is required' })}
                />
                {errors.patientId && (
                  <p className="mt-1 text-sm text-red-600">{errors.patientId.message}</p>
                )}
              </div>

              {/* Title */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="title">
                  Record Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="title"
                  type="text"
                  className={`w-full p-2 border rounded-md ${errors.title ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Brief summary of the record"
                  {...register('title', { required: 'Title is required' })}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                )}
              </div>
              
              {/* Description */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="description">
                  Description
                </label>
                <textarea
                  id="description"
                  rows="3"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Additional details about this record"
                  {...register('description')}
                ></textarea>
              </div>
              
              {/* Tags */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="tags">
                  Tags
                </label>
                <input
                  id="tags"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md"
                  placeholder="Comma-separated tags, e.g., urgent, follow-up"
                  {...register('tags')}
                />
                <p className="text-xs text-gray-500 mt-1">Separate tags with commas</p>
              </div>
            </div>
            
            {/* Visit fields */}
            {recordType === 'VISIT' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Visit Details</h3>
                
                {/* Visit Type */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="visitType">
                    Visit Type <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="visitType"
                    className={`w-full p-2 border rounded-md ${errors.visitType ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('visitType', { required: 'Visit type is required' })}
                  >
                    <option value="ROUTINE_CHECKUP">Routine Checkup</option>
                    <option value="SICK_VISIT">Sick Visit</option>
                    <option value="FOLLOW_UP">Follow-up</option>
                    <option value="EMERGENCY">Emergency</option>
                    <option value="SPECIALIST">Specialist Consultation</option>
                    <option value="TELEHEALTH">Telehealth Visit</option>
                  </select>
                  {errors.visitType && (
                    <p className="mt-1 text-sm text-red-600">{errors.visitType.message}</p>
                  )}
                </div>
                
                {/* Chief Complaint */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="chiefComplaint">
                    Chief Complaint <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="chiefComplaint"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.chiefComplaint ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('chiefComplaint', { required: 'Chief complaint is required' })}
                  />
                  {errors.chiefComplaint && (
                    <p className="mt-1 text-sm text-red-600">{errors.chiefComplaint.message}</p>
                  )}
                </div>
                
                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                    Clinical Notes <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    id="notes"
                    rows="6"
                    className={`w-full p-2 border rounded-md ${errors.notes ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('notes', { required: 'Notes are required' })}
                  ></textarea>
                  {errors.notes && (
                    <p className="mt-1 text-sm text-red-600">{errors.notes.message}</p>
                  )}
                </div>
                
                {/* Vital Signs */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="vitalSigns">
                    Vital Signs
                  </label>
                  <textarea
                    id="vitalSigns"
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Basic vitals taken during the visit"
                    {...register('vitalSigns')}
                  ></textarea>
                </div>
                
                {/* Recommendation */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="recommendation">
                    Recommendations
                  </label>
                  <textarea
                    id="recommendation"
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Follow-up recommendations"
                    {...register('recommendation')}
                  ></textarea>
                </div>
                
                {/* Location */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Where the visit took place"
                    {...register('location')}
                  />
                </div>
                
                {/* Visit Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="visitDate">
                    Visit Date
                  </label>
                  <input
                    id="visitDate"
                    type="datetime-local"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('visitDate')}
                  />
                </div>
              </div>
            )}
            
            {/* Diagnosis fields */}
            {recordType === 'DIAGNOSIS' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Diagnosis Details</h3>
                
                {/* Condition Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="conditionName">
                    Condition Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="conditionName"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.conditionName ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('conditionName', { required: 'Condition name is required' })}
                  />
                  {errors.conditionName && (
                    <p className="mt-1 text-sm text-red-600">{errors.conditionName.message}</p>
                  )}
                </div>
                
                {/* ICD Code */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="icdCode">
                    ICD Code
                  </label>
                  <input
                    id="icdCode"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="ICD-10 or ICD-11 code"
                    {...register('icdCode')}
                  />
                </div>
                
                {/* Diagnosis Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="diagnosisDate">
                    Diagnosis Date
                  </label>
                  <input
                    id="diagnosisDate"
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('diagnosisDate')}
                  />
                </div>
                
                {/* Severity */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="severity">
                    Severity
                  </label>
                  <select
                    id="severity"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('severity')}
                  >
                    <option value="MILD">Mild</option>
                    <option value="MODERATE">Moderate</option>
                    <option value="SEVERE">Severe</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                </div>
                
                {/* Status */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="status">
                    Diagnosis Status
                  </label>
                  <select
                    id="status"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('status')}
                  >
                    <option value="ACTIVE">Active</option>
                    <option value="RESOLVED">Resolved</option>
                    <option value="RECURRING">Recurring</option>
                    <option value="CHRONIC">Chronic</option>
                  </select>
                </div>
                
                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Additional notes about the diagnosis"
                    {...register('notes')}
                  ></textarea>
                </div>
                
                {/* Treatment Plan */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="treatmentPlan">
                    Treatment Plan
                  </label>
                  <textarea
                    id="treatmentPlan"
                    rows="4"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Planned treatment approach"
                    {...register('treatmentPlan')}
                  ></textarea>
                </div>
              </div>
            )}
            
            {/* Lab Result fields */}
            {recordType === 'LAB_RESULT' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Result Details</h3>
                
                {/* Test Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="testName">
                    Test Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="testName"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.testName ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('testName', { required: 'Test name is required' })}
                  />
                  {errors.testName && (
                    <p className="mt-1 text-sm text-red-600">{errors.testName.message}</p>
                  )}
                </div>
                
                {/* Test Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="testDate">
                    Test Date
                  </label>
                  <input
                    id="testDate"
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('testDate')}
                  />
                </div>
                
                {/* Result */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="result">
                    Result <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="result"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.result ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('result', { required: 'Result is required' })}
                  />
                  {errors.result && (
                    <p className="mt-1 text-sm text-red-600">{errors.result.message}</p>
                  )}
                </div>
                
                {/* Normal Range */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="normalRange">
                    Normal Range
                  </label>
                  <input
                    id="normalRange"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Reference range for the test"
                    {...register('normalRange')}
                  />
                </div>
                
                {/* Units */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="units">
                    Units
                  </label>
                  <input
                    id="units"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Units of measurement"
                    {...register('units')}
                  />
                </div>
                
                {/* Interpretation */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="interpretation">
                    Interpretation
                  </label>
                  <textarea
                    id="interpretation"
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Clinical interpretation of results"
                    {...register('interpretation')}
                  ></textarea>
                </div>
                
                {/* Performed By */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="performedBy">
                    Performed By
                  </label>
                  <input
                    id="performedBy"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Laboratory or technician"
                    {...register('performedBy')}
                  />
                </div>
              </div>
            )}
            
            {/* Prescription fields */}
            {recordType === 'PRESCRIPTION' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h3>
                
                {/* Medication Name */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="medicationName">
                    Medication Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="medicationName"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.medicationName ? 'border-red-500' : 'border-gray-300'}`}
                    {...register('medicationName', { required: 'Medication name is required' })}
                  />
                  {errors.medicationName && (
                    <p className="mt-1 text-sm text-red-600">{errors.medicationName.message}</p>
                  )}
                </div>
                
                {/* Dosage */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="dosage">
                    Dosage <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="dosage"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.dosage ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 500mg"
                    {...register('dosage', { required: 'Dosage is required' })}
                  />
                  {errors.dosage && (
                    <p className="mt-1 text-sm text-red-600">{errors.dosage.message}</p>
                  )}
                </div>
                
                {/* Frequency */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="frequency">
                    Frequency <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="frequency"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.frequency ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., Twice daily"
                    {...register('frequency', { required: 'Frequency is required' })}
                  />
                  {errors.frequency && (
                    <p className="mt-1 text-sm text-red-600">{errors.frequency.message}</p>
                  )}
                </div>
                
                {/* Duration */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="duration">
                    Duration <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="duration"
                    type="text"
                    className={`w-full p-2 border rounded-md ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="e.g., 7 days"
                    {...register('duration', { required: 'Duration is required' })}
                  />
                  {errors.duration && (
                    <p className="mt-1 text-sm text-red-600">{errors.duration.message}</p>
                  )}
                </div>
                
                {/* Start Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="startDate">
                    Start Date
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('startDate')}
                  />
                </div>
                
                {/* End Date */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="endDate">
                    End Date
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('endDate')}
                  />
                </div>
                
                {/* Pharmacy */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="pharmacy">
                    Pharmacy
                  </label>
                  <input
                    id="pharmacy"
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Pharmacy details"
                    {...register('pharmacy')}
                  />
                </div>
                
                {/* Instructions */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="instructions">
                    Instructions
                  </label>
                  <textarea
                    id="instructions"
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Special instructions for taking this medication"
                    {...register('instructions')}
                  ></textarea>
                </div>
                
                {/* Reason */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="reason">
                    Reason for Prescription
                  </label>
                  <textarea
                    id="reason"
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('reason')}
                  ></textarea>
                </div>
              </div>
            )}
            
            {/* Vital Signs fields */}
            {recordType === 'VITAL_SIGNS' && (
              <div className="mb-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Temperature */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="temperature">
                      Temperature
                    </label>
                    <div className="flex">
                      <input
                        id="temperature"
                        type="number"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        placeholder="36.6"
                        {...register('temperature')}
                      />
                      <select
                        id="temperatureUnit"
                        className="p-2 border-t border-b border-r border-gray-300 rounded-r-md"
                        {...register('temperatureUnit')}
                      >
                        <option value="°C">°C</option>
                        <option value="°F">°F</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Blood Pressure */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Blood Pressure
                    </label>
                    <div className="flex space-x-2">
                      <input
                        id="bloodPressureSystolic"
                        type="number"
                        className="w-1/2 p-2 border border-gray-300 rounded-md"
                        placeholder="Systolic"
                        {...register('bloodPressureSystolic')}
                      />
                      <span className="flex items-center">/</span>
                      <input
                        id="bloodPressureDiastolic"
                        type="number"
                        className="w-1/2 p-2 border border-gray-300 rounded-md"
                        placeholder="Diastolic"
                        {...register('bloodPressureDiastolic')}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">mmHg</p>
                  </div>
                  
                  {/* Heart Rate */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="heartRate">
                      Heart Rate
                    </label>
                    <input
                      id="heartRate"
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="BPM"
                      {...register('heartRate')}
                    />
                    <p className="text-xs text-gray-500 mt-1">Beats Per Minute</p>
                  </div>
                  
                  {/* Respiratory Rate */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="respiratoryRate">
                      Respiratory Rate
                    </label>
                    <input
                      id="respiratoryRate"
                      type="number"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      placeholder="Breaths Per Minute"
                      {...register('respiratoryRate')}
                    />
                    <p className="text-xs text-gray-500 mt-1">Breaths Per Minute</p>
                  </div>
                  
                  {/* Oxygen Saturation */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="oxygenSaturation">
                      Oxygen Saturation
                    </label>
                    <div className="flex">
                      <input
                        id="oxygenSaturation"
                        type="number"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        placeholder="98"
                        {...register('oxygenSaturation')}
                      />
                      <span className="p-2 border-t border-b border-r border-gray-300 rounded-r-md">%</span>
                    </div>
                  </div>
                  
                  {/* Height */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="height">
                      Height
                    </label>
                    <div className="flex">
                      <input
                        id="height"
                        type="number"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        {...register('height')}
                      />
                      <select
                        id="heightUnit"
                        className="p-2 border-t border-b border-r border-gray-300 rounded-r-md"
                        {...register('heightUnit')}
                      >
                        <option value="cm">cm</option>
                        <option value="in">in</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* Weight */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="weight">
                      Weight
                    </label>
                    <div className="flex">
                      <input
                        id="weight"
                        type="number"
                        step="0.1"
                        className="w-full p-2 border border-gray-300 rounded-l-md"
                        {...register('weight')}
                      />
                      <select
                        id="weightUnit"
                        className="p-2 border-t border-b border-r border-gray-300 rounded-r-md"
                        {...register('weightUnit')}
                      >
                        <option value="kg">kg</option>
                        <option value="lbs">lbs</option>
                      </select>
                    </div>
                  </div>
                  
                  {/* BMI */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="bmi">
                      BMI
                    </label>
                    <input
                      id="bmi"
                      type="number"
                      step="0.1"
                      className="w-full p-2 border border-gray-300 rounded-md"
                      {...register('bmi')}
                    />
                  </div>
                </div>
                
                {/* Notes */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="notes">
                    Notes
                  </label>
                  <textarea
                    id="notes"
                    rows="3"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    placeholder="Additional notes about vital signs"
                    {...register('notes')}
                  ></textarea>
                </div>
                
                {/* Recorded At */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="recordedAt">
                    Recorded At
                  </label>
                  <input
                    id="recordedAt"
                    type="datetime-local"
                    className="w-full p-2 border border-gray-300 rounded-md"
                    {...register('recordedAt')}
                  />
                </div>
              </div>
            )}
            
            {/* Submit button */}
            <div className="flex justify-end space-x-3">
              <Link href="/records">
                <button 
                  type="button" 
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className={`px-4 py-2 rounded-md text-white ${
                  submitting ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {submitting ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </span>
                ) : (
                  'Create Record'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
}
