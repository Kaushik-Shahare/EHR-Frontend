'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import { useAuth } from '@/context/AuthContext';
import api from '@/services/apiService';

export default function RecordDetailsPage({ params }) {
  const { id } = params;
  const router = useRouter();
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  
  const [loading, setLoading] = useState(true);
  const [visitData, setVisitData] = useState(null);
  const [error, setError] = useState(null);

  // Fetch specific patient visit data using the ID from the URL
  const fetchPatientVisit = async (visitId) => {
    if (!isAuthenticated || !visitId) return;
    
    try {
      setLoading(true);
      // Make API call to get patient visit with the current ID
      const response = await api.get(`/api/ehr/patient-visits/${visitId}/`);
      const data = response.data;
      
      // Enhanced console logging with structured information
      console.group('Patient Visit Data');
      console.log('Full response:', data);
      
      if (data.patient && data.patient.profile) {
        console.log('Patient name:', data.patient.profile.name);
        console.log('Patient demographics:', {
          gender: data.patient.profile.gender,
          age: data.patient.profile.age,
          dob: data.patient.profile.date_of_birth
        });
        console.log('Medical information:', {
          bloodGroup: data.patient.profile.blood_group,
          height: data.patient.profile.height_cm,
          weight: data.patient.profile.weight_kg
        });
      }
      console.groupEnd();
      
      setVisitData(data);
      setError(null);
    } catch (error) {
      console.error('Error fetching patient visit:', error);
      setError(error.response?.data?.detail || error.message || 'Failed to fetch patient visit data');
    } finally {
      setLoading(false);
    }
  };

  // Load visit data when component mounts
  useEffect(() => {
    if (isAuthenticated && id) {
      fetchPatientVisit(id);
    }
  }, [isAuthenticated, id]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || loading) {
    return (
      <MainLayout title="Record Details">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Record: ${id}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Link href="/records" className="text-blue-600 hover:text-blue-800 mr-2">
              ← Back to Records
            </Link>
          </div>
        </div>
        
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
            <p className="text-red-700">{error}</p>
            <button 
              onClick={() => fetchPatientVisit(id)} 
              className="mt-2 bg-white hover:bg-gray-100 text-gray-800 font-semibold py-1 px-3 border border-gray-400 rounded shadow text-sm"
            >
              Try Again
            </button>
          </div>
        )}
        
        {visitData && (
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900">
                Patient Visit Details
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Visit #{visitData.id || visitData.visit_number} | Patient ID: {visitData?.patient?.id || 'N/A'}
              </p>
              <div className="mt-2 text-sm italic text-gray-600">
                API response data has been logged to console
              </div>
            </div>
            
            <div className="border-t border-gray-200">
              <dl>
                {/* Patient Information */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Patient</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {visitData?.patient?.profile?.name || visitData.patient_name || 'N/A'}
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Patient Email</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {visitData?.patient?.email || 'N/A'}
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Patient Demographics</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {visitData?.patient?.profile?.gender || 'N/A'}, {visitData?.patient?.profile?.age || 'N/A'} years old
                    {visitData?.patient?.profile?.date_of_birth && ` (DOB: ${new Date(visitData.patient.profile.date_of_birth).toLocaleDateString()})`}
                  </dd>
                </div>

                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Contact Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    Phone: {visitData?.patient?.profile?.phone_number || 'N/A'}
                    {visitData?.patient?.profile?.location && <>, Location: {visitData.patient.profile.location}</>}
                  </dd>
                </div>

                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Medical Information</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <div><strong>Blood Group:</strong> {visitData?.patient?.profile?.blood_group || 'N/A'}</div>
                    <div><strong>Height:</strong> {visitData?.patient?.profile?.height_cm ? `${visitData.patient.profile.height_cm} cm` : 'N/A'}</div>
                    <div><strong>Weight:</strong> {visitData?.patient?.profile?.weight_kg ? `${visitData.patient.profile.weight_kg} kg` : 'N/A'}</div>
                    <div><strong>Marital Status:</strong> {visitData?.patient?.profile?.marital_status || 'N/A'}</div>
                  </dd>
                </div>

                {visitData?.patient?.profile?.allergies && visitData.patient.profile.allergies.length > 0 && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Allergies</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="list-disc pl-5">
                        {visitData.patient.profile.allergies.map((allergy, index) => (
                          <li key={index}>{allergy}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                {visitData?.patient?.profile?.chronic_conditions && visitData.patient.profile.chronic_conditions.length > 0 && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Chronic Conditions</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="list-disc pl-5">
                        {visitData.patient.profile.chronic_conditions.map((condition, index) => (
                          <li key={index}>{condition}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                {visitData?.patient?.profile?.current_medications && visitData.patient.profile.current_medications.length > 0 && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Current Medications</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <ul className="list-disc pl-5">
                        {visitData.patient.profile.current_medications.map((medication, index) => (
                          <li key={index}>{medication}</li>
                        ))}
                      </ul>
                    </dd>
                  </div>
                )}

                {visitData?.patient?.profile?.address && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {visitData.patient.profile.address.street}, {visitData.patient.profile.address.area}<br />
                      {visitData.patient.profile.address.city}, {visitData.patient.profile.address.state} - {visitData.patient.profile.address.pincode}<br />
                      {visitData.patient.profile.address.country}
                      {visitData.patient.profile.address.is_primary && <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Primary</span>}
                    </dd>
                  </div>
                )}

                {visitData?.patient?.profile?.emergency_contact && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Emergency Contact</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {visitData.patient.profile.emergency_contact.name} ({visitData.patient.profile.emergency_contact.relation})<br />
                      Phone: {visitData.patient.profile.emergency_contact.phone_number}
                    </dd>
                  </div>
                )}

                {visitData?.patient?.profile?.insurance && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Insurance</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div><strong>Provider:</strong> {visitData.patient.profile.insurance.provider}</div>
                      <div><strong>Policy Number:</strong> {visitData.patient.profile.insurance.policy_number}</div>
                      <div><strong>Valid Until:</strong> {new Date(visitData.patient.profile.insurance.valid_till).toLocaleDateString()}</div>
                    </dd>
                  </div>
                )}

                {visitData?.patient?.profile?.primary_physician && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Primary Physician</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div>{visitData.patient.profile.primary_physician.name}</div>
                      <div>{visitData.patient.profile.primary_physician.department}</div>
                      <div>{visitData.patient.profile.primary_physician.hospital}</div>
                    </dd>
                  </div>
                )}
                
                {visitData?.patient?.profile?.vaccination_status && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Vaccination Status</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {Object.entries(visitData.patient.profile.vaccination_status).map(([vaccine, status], index) => (
                          <div key={index} className="flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${status === 'Completed' ? 'bg-green-500' : 'bg-yellow-500'}`}></span>
                            <span className="capitalize">{vaccine.replace(/_/g, ' ')}: </span>
                            <span className={`ml-1 ${status === 'Completed' ? 'text-green-700' : 'text-yellow-700'}`}>
                              {status}
                            </span>
                          </div>
                        ))}
                      </div>
                    </dd>
                  </div>
                )}

                {/* Visit Information */}
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6 border-t border-gray-200">
                  <dt className="text-sm font-medium text-gray-500">Doctor</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {visitData.doctor_name || 'N/A'}
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Visit Type</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {visitData.visit_type?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Check-in Time</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    {visitData.check_in_time && new Date(visitData.check_in_time).toLocaleString()}
                  </dd>
                </div>
                
                {visitData.check_out_time && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Check-out Time</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {new Date(visitData.check_out_time).toLocaleString()}
                    </dd>
                  </div>
                )}
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${visitData.status === 'checked_in' ? 'bg-green-100 text-green-800' : 
                        visitData.status === 'checked_out' ? 'bg-gray-100 text-gray-800' : 'bg-blue-100 text-blue-800'}`}
                    >
                      {visitData.status?.replace(/_/g, ' ').replace(/\b\w/g, char => char.toUpperCase())}
                    </span>
                  </dd>
                </div>
                
                <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Payment Status</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${visitData.payment_status === 'paid' ? 'bg-green-100 text-green-800' : 
                        visitData.payment_status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}
                    >
                      {visitData.payment_status?.replace(/\b\w/g, char => char.toUpperCase())}
                    </span>
                  </dd>
                </div>
                
                <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                  <dt className="text-sm font-medium text-gray-500">Total Amount</dt>
                  <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                    ${visitData.total_amount}
                  </dd>
                </div>
                
                {visitData.duration && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Visit Duration</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {visitData.duration} minutes
                    </dd>
                  </div>
                )}

                {visitData.notes && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Notes</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2 whitespace-pre-line">
                      {visitData.notes}
                    </dd>
                  </div>
                )}

                {/* Display any additional fields from the response */}
                {visitData.chief_complaint && (
                  <div className="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Chief Complaint</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {visitData.chief_complaint}
                    </dd>
                  </div>
                )}

                {visitData.location && (
                  <div className="bg-white px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                    <dt className="text-sm font-medium text-gray-500">Location</dt>
                    <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                      {visitData.location}
                    </dd>
                  </div>
                )}
              </dl>
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}
