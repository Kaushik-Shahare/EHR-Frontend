'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import { useRecords } from '@/context/RecordContext';
import RecordTypeIcon from '@/components/records/RecordTypeIcon';

export default function RecordDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const { 
    currentRecord, 
    loading, 
    error, 
    fetchRecordById,
    updateRecordStatus,
    deleteRecord 
  } = useRecords();
  
  const [isActionMenuOpen, setIsActionMenuOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated && id) {
      fetchRecordById(id);
    }
  }, [isAuthenticated, id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const handleStatusUpdate = async (status) => {
    try {
      await updateRecordStatus(id, status);
      setIsActionMenuOpen(false);
    } catch (error) {
      console.error('Error updating record status:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to archive this record? This action cannot be undone.')) {
      try {
        await deleteRecord(id);
        router.push('/records');
      } catch (error) {
        console.error('Error deleting record:', error);
      }
    }
  };

  const canModifyRecord = () => {
    if (!user || !currentRecord) return false;
    
    return (
      user.role === 'ADMIN' || 
      user.id === currentRecord.createdById ||
      (user.role === 'DOCTOR' || user.role === 'NURSE')
    );
  };

  if (authLoading || loading) {
    return (
      <MainLayout title="Record Details">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Record Details">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 p-4">
            <p className="text-red-700">{error}</p>
          </div>
          <div className="mt-4">
            <Link href="/records" className="text-blue-600 hover:text-blue-800">
              ← Back to Records
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!currentRecord) {
    return (
      <MainLayout title="Record Details">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-gray-700">Record not found.</p>
          <div className="mt-4">
            <Link href="/records" className="text-blue-600 hover:text-blue-800">
              ← Back to Records
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Extract record details based on type
  let recordDetails;
  switch (currentRecord.recordType) {
    case 'VISIT':
      recordDetails = currentRecord.visit;
      break;
    case 'DIAGNOSIS':
      recordDetails = currentRecord.diagnosis;
      break;
    case 'LAB_RESULT':
      recordDetails = currentRecord.labResult;
      break;
    case 'PRESCRIPTION':
      recordDetails = currentRecord.prescription;
      break;
    case 'VITAL_SIGNS':
      recordDetails = currentRecord.vitalSigns;
      break;
    default:
      recordDetails = null;
  }

  return (
    <MainLayout title={`Record: ${currentRecord.title}`}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/records" className="text-blue-600 hover:text-blue-800 mr-2">
              ← Records
            </Link>
            <h1 className="text-2xl font-semibold text-gray-900">
              Record Details
            </h1>
          </div>

          {/* Action menu for authorized users */}
          {canModifyRecord() && (
            <div className="relative">
              <button
                onClick={() => setIsActionMenuOpen(!isActionMenuOpen)}
                className="px-3 py-2 border border-gray-300 rounded-md bg-white text-gray-700 hover:bg-gray-50"
              >
                Actions
                <svg className="w-4 h-4 ml-1 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>

              {isActionMenuOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-10">
                  <div className="py-1" role="menu" aria-orientation="vertical">
                    {currentRecord.status !== 'ACTIVE' && (
                      <button
                        onClick={() => handleStatusUpdate('ACTIVE')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Mark as Active
                      </button>
                    )}
                    {currentRecord.status !== 'PENDING' && (
                      <button
                        onClick={() => handleStatusUpdate('PENDING')}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                      >
                        Mark as Pending
                      </button>
                    )}
                    {currentRecord.status !== 'ARCHIVED' && (
                      <button
                        onClick={handleDelete}
                        className="block px-4 py-2 text-sm text-red-600 hover:bg-gray-100 w-full text-left"
                      >
                        Archive Record
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Record header */}
        <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
            <div className="flex items-center">
              <div className="mr-2">
                <RecordTypeIcon type={currentRecord.recordType} className="h-8 w-8" />
              </div>
              <div>
                <h3 className="text-lg leading-6 font-medium text-gray-900">{currentRecord.title}</h3>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {new Date(currentRecord.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div>
              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                ${currentRecord.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 
                  currentRecord.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 
                  'bg-gray-100 text-gray-800'}`}
              >
                {currentRecord.status}
              </span>
            </div>
          </div>
          
          <div className="border-t border-gray-200">
            <dl>
              {/* General record information */}
              {currentRecord.description && (
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Description</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{currentRecord.description}</dd>
                </div>
              )}

              {/* Tags */}
              {currentRecord.tags && (
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Tags</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {currentRecord.tags.split(',').map((tag, index) => (
                      <span key={index} className="mr-2 mb-2 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                        {tag.trim()}
                      </span>
                    ))}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        {/* Record type-specific details */}
        {recordDetails && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                {currentRecord.recordType === 'VISIT' ? 'Visit Details' :
                  currentRecord.recordType === 'DIAGNOSIS' ? 'Diagnosis Details' :
                  currentRecord.recordType === 'LAB_RESULT' ? 'Lab Result Details' :
                  currentRecord.recordType === 'PRESCRIPTION' ? 'Prescription Details' :
                  'Vital Signs Details'}
              </h3>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                {/* Visit details */}
                {currentRecord.recordType === 'VISIT' && (
                  <>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Visit Type</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.visitType.replace('_', ' ')}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Chief Complaint</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.chiefComplaint}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Visit Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(recordDetails.visitDate).toLocaleString()}
                      </dd>
                    </div>
                    {recordDetails.vitalSigns && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Vital Signs</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.vitalSigns}
                        </dd>
                      </div>
                    )}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Notes</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                        {recordDetails.notes}
                      </dd>
                    </div>
                    {recordDetails.recommendation && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Recommendations</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.recommendation}
                        </dd>
                      </div>
                    )}
                    {recordDetails.location && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Location</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.location}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {/* Diagnosis details */}
                {currentRecord.recordType === 'DIAGNOSIS' && (
                  <>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Condition Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.conditionName}
                      </dd>
                    </div>
                    {recordDetails.icdCode && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">ICD Code</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.icdCode}
                        </dd>
                      </div>
                    )}
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Diagnosis Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(recordDetails.diagnosisDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Severity</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.severity}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.status}
                      </dd>
                    </div>
                    {recordDetails.notes && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                          {recordDetails.notes}
                        </dd>
                      </div>
                    )}
                    {recordDetails.treatmentPlan && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Treatment Plan</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.treatmentPlan}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {/* Lab Result details */}
                {currentRecord.recordType === 'LAB_RESULT' && (
                  <>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Test Name</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.testName}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Test Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(recordDetails.testDate).toLocaleDateString()}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Result</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.result}
                        {recordDetails.units && ` ${recordDetails.units}`}
                      </dd>
                    </div>
                    {recordDetails.normalRange && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Normal Range</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.normalRange}
                        </dd>
                      </div>
                    )}
                    {recordDetails.interpretation && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Interpretation</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.interpretation}
                        </dd>
                      </div>
                    )}
                    {recordDetails.performedBy && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Performed By</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.performedBy}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {/* Prescription details */}
                {currentRecord.recordType === 'PRESCRIPTION' && (
                  <>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Medication</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.medicationName}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Dosage</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.dosage}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Frequency</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.frequency}
                      </dd>
                    </div>
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Duration</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {recordDetails.duration}
                      </dd>
                    </div>
                    <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Start Date</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(recordDetails.startDate).toLocaleDateString()}
                      </dd>
                    </div>
                    {recordDetails.endDate && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">End Date</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {new Date(recordDetails.endDate).toLocaleDateString()}
                        </dd>
                      </div>
                    )}
                    {recordDetails.instructions && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Instructions</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.instructions}
                        </dd>
                      </div>
                    )}
                    {recordDetails.reason && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Reason</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.reason}
                        </dd>
                      </div>
                    )}
                    {recordDetails.pharmacy && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Pharmacy</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.pharmacy}
                        </dd>
                      </div>
                    )}
                  </>
                )}

                {/* Vital Signs details */}
                {currentRecord.recordType === 'VITAL_SIGNS' && (
                  <>
                    {recordDetails.temperature && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Temperature</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.temperature} {recordDetails.temperatureUnit || '°C'}
                        </dd>
                      </div>
                    )}
                    {(recordDetails.bloodPressureSystolic || recordDetails.bloodPressureDiastolic) && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Blood Pressure</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.bloodPressureSystolic}/{recordDetails.bloodPressureDiastolic} mmHg
                        </dd>
                      </div>
                    )}
                    {recordDetails.heartRate && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Heart Rate</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.heartRate} BPM
                        </dd>
                      </div>
                    )}
                    {recordDetails.respiratoryRate && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Respiratory Rate</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.respiratoryRate} breaths/min
                        </dd>
                      </div>
                    )}
                    {recordDetails.oxygenSaturation && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Oxygen Saturation</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.oxygenSaturation}%
                        </dd>
                      </div>
                    )}
                    {recordDetails.height && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Height</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.height} {recordDetails.heightUnit || 'cm'}
                        </dd>
                      </div>
                    )}
                    {recordDetails.weight && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Weight</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.weight} {recordDetails.weightUnit || 'kg'}
                        </dd>
                      </div>
                    )}
                    {recordDetails.bmi && (
                      <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">BMI</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.bmi}
                        </dd>
                      </div>
                    )}
                    {recordDetails.notes && (
                      <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                        <dt className="text-sm font-medium text-gray-500">Notes</dt>
                        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                          {recordDetails.notes}
                        </dd>
                      </div>
                    )}
                    <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                      <dt className="text-sm font-medium text-gray-500">Recorded At</dt>
                      <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                        {new Date(recordDetails.recordedAt).toLocaleString()}
                      </dd>
                    </div>
                  </>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
