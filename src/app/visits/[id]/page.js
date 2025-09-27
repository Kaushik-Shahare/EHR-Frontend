'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ehrService from '@/services/ehrService';
import documentService from '@/services/documentService';

export default function VisitDetail() {
  const { id } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [visit, setVisit] = useState(null);
  const [documents, setDocuments] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [diagnoses, setDiagnoses] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchVisitDetails();
    }
  }, [id, isAuthenticated, router]);

  const fetchVisitDetails = async () => {
    try {
      setLoading(true);
      setError('');

      // Fetch complete visit data with all nested information
      const visitData = await ehrService.getVisitDetails(id);
      console.log('Complete visit data:', visitData);
      
      // Extract nested data from the comprehensive response
      setVisit(visitData);
      setDocuments(visitData.documents || []);
      setVitals(visitData.vitals || []);
      setDiagnoses(visitData.diagnoses || []);
      setPrescriptions(visitData.prescriptions || []);

    } catch (error) {
      console.error('Failed to fetch visit details:', error);
      setError('Failed to load visit details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount) => {
    if (!amount) return 'N/A';
    return `$${parseFloat(amount).toFixed(2)}`;
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'checked_in':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-yellow-100 text-yellow-800';
      case 'ready_for_checkout':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-gray-100 text-gray-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <MainLayout title="Visit Details">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading visit details...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout title="Visit Details">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
          <div className="mt-6 text-center">
            <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
              Back to Dashboard
            </Link>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (!visit) {
    return (
      <MainLayout title="Visit Details">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center">
            <div className="bg-gray-50 p-8 rounded-lg">
              <h2 className="text-xl font-semibold text-gray-800 mb-2">Visit Not Found</h2>
              <p className="text-gray-600 mb-4">The requested visit could not be found.</p>
              <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Back to Dashboard
              </Link>
            </div>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title={`Visit Details - ${visit.visit_number || id}`}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                <span>/</span>
                <span>Visit Details</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">Visit Details</h1>
              <p className="text-gray-600 mt-1">Complete information about your medical visit</p>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-500">Visit ID</div>
              <div className="font-mono text-lg font-semibold">{visit.visit_number || id}</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Visit Overview */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                <h2 className="text-xl font-bold text-blue-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                  Visit Overview
                </h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Basic Information</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Patient Name</span>
                        <p className="font-medium">{visit.patient_name || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Visit Type</span>
                        <p className="font-medium capitalize">{visit.visit_type?.replace('_', ' ') || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Doctor</span>
                        <p className="font-medium">{visit.doctor_name || 'N/A'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">Visit Status & Timing</h3>
                    <div className="space-y-3">
                      <div>
                        <span className="text-sm text-gray-500">Status</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                            {visit.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Check-in Time</span>
                        <p className="font-medium">{formatDate(visit.check_in_time)}</p>
                      </div>
                      <div>
                        <span className="text-sm text-gray-500">Check-out Time</span>
                        <p className="font-medium">{formatDate(visit.check_out_time) || 'Not checked out'}</p>
                      </div>
                      {visit.duration && (
                        <div>
                          <span className="text-sm text-gray-500">Duration</span>
                          <p className="font-medium">{visit.duration}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Vital Signs */}
            {vitals.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                  <h2 className="text-xl font-bold text-green-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    Vital Signs
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {vitals.map((vital, index) => (
                      <div key={index} className="text-center p-4 bg-gray-50 rounded-lg">
                        <div className="text-2xl font-bold text-gray-900">{vital.value}</div>
                        <div className="text-sm text-gray-500">{vital.type}</div>
                        {vital.unit && <div className="text-xs text-gray-400">{vital.unit}</div>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Diagnoses */}
            {diagnoses.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-red-50 to-pink-50 p-6 border-b border-red-100">
                  <h2 className="text-xl font-bold text-red-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Diagnoses
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {diagnoses.map((diagnosis, index) => (
                      <div key={index} className="border-l-4 border-red-200 pl-4 py-2">
                        <h4 className="font-semibold text-gray-900">{diagnosis.condition || diagnosis.name}</h4>
                        {diagnosis.description && (
                          <p className="text-gray-600 mt-1">{diagnosis.description}</p>
                        )}
                        {diagnosis.icd_code && (
                          <span className="inline-block mt-2 px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                            ICD: {diagnosis.icd_code}
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Prescriptions */}
            {prescriptions.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-100">
                  <h2 className="text-xl font-bold text-purple-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                    </svg>
                    Prescriptions
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {prescriptions.map((prescription, index) => (
                      <div key={index} className="border border-gray-200 rounded-lg p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h4 className="font-semibold text-gray-900">{prescription.medication || prescription.name}</h4>
                            {prescription.dosage && (
                              <p className="text-gray-600 mt-1">Dosage: {prescription.dosage}</p>
                            )}
                            {prescription.frequency && (
                              <p className="text-gray-600">Frequency: {prescription.frequency}</p>
                            )}
                            {prescription.duration && (
                              <p className="text-gray-600">Duration: {prescription.duration}</p>
                            )}
                            {prescription.instructions && (
                              <p className="text-gray-600 mt-2 text-sm">{prescription.instructions}</p>
                            )}
                          </div>
                          {prescription.status && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              {prescription.status}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Visit Documents */}
            {documents.length > 0 && (
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 p-6 border-b border-yellow-100">
                  <h2 className="text-xl font-bold text-yellow-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Visit Documents ({documents.length})
                  </h2>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {documents.map((doc) => (
                      <div key={doc.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start space-x-3">
                          <div className="h-12 w-12 bg-yellow-100 rounded-lg flex items-center justify-center flex-shrink-0">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </div>
                          <div className="flex-grow min-w-0">
                            <div className="flex items-center justify-between">
                              <h4 className="font-semibold text-gray-900 truncate">
                                {doc.document_type?.replace('_', ' ').toUpperCase() || 'Document'}
                              </h4>
                              <a 
                                href={doc.file} 
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-yellow-50 text-yellow-600 hover:bg-yellow-600 hover:text-white p-2 rounded-md transition-colors duration-200 flex-shrink-0 ml-2"
                                title="Open document"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                  <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                  <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                </svg>
                              </a>
                            </div>
                            <p className="text-sm text-gray-600 mt-1 line-clamp-2">{doc.description || 'No description available'}</p>
                            <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                              <span>{formatDate(doc.uploaded_at || doc.created_at)}</span>
                              {doc.is_approved && (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded">Approved</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Payment Information */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                <h3 className="text-lg font-bold text-green-900 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  Payment Details
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-500">Total Amount</span>
                    <p className="text-2xl font-bold text-gray-900">{formatCurrency(visit.total_amount)}</p>
                  </div>
                  <div>
                    <span className="text-sm text-gray-500">Payment Status</span>
                    <div className="mt-1">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(visit.payment_status)}`}>
                        {visit.payment_status?.toUpperCase() || 'UNKNOWN'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                <h3 className="text-lg font-bold text-blue-900">Quick Actions</h3>
              </div>
              <div className="p-6 space-y-3">
                <Link 
                  href="/dashboard"
                  className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors text-center block"
                >
                  Back to Dashboard
                </Link>
                {visit.status === 'ready_for_checkout' && (
                  <button className="w-full bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors">
                    Complete Checkout
                  </button>
                )}
                <button 
                  onClick={() => window.print()}
                  className="w-full bg-gray-600 text-white py-2 px-4 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Print Visit Summary
                </button>
              </div>
            </div>

            {/* Visit Summary Stats */}
            <div className="bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-100">
                <h3 className="text-lg font-bold text-purple-900">Visit Summary</h3>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <div className="text-xl font-bold text-blue-600">{documents.length}</div>
                    <div className="text-xs text-gray-500">Documents</div>
                  </div>
                  <div className="p-3 bg-green-50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">{vitals.length}</div>
                    <div className="text-xs text-gray-500">Vital Signs</div>
                  </div>
                  <div className="p-3 bg-red-50 rounded-lg">
                    <div className="text-xl font-bold text-red-600">{diagnoses.length}</div>
                    <div className="text-xs text-gray-500">Diagnoses</div>
                  </div>
                  <div className="p-3 bg-purple-50 rounded-lg">
                    <div className="text-xl font-bold text-purple-600">{prescriptions.length}</div>
                    <div className="text-xs text-gray-500">Prescriptions</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}