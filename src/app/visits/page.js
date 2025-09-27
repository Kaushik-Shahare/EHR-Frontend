'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import ehrService from '@/services/ehrService';

export default function VisitsList() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    fetchVisits();
  }, [isAuthenticated, router]);

  const fetchVisits = async () => {
    try {
      setLoading(true);
      setError('');

      const visitsData = await ehrService.getPatientVisits();
      console.log('Visits data loaded:', visitsData);

      // Handle pagination structure
      const visitsList = visitsData?.results || visitsData || [];
      setVisits(visitsList);

    } catch (error) {
      console.error('Failed to fetch visits:', error);
      setError('Failed to load visits. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not specified';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
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
      <MainLayout title="My Visits">
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-700">Loading your visits...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout title="My Visits">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                <Link href="/dashboard" className="hover:text-blue-600">Dashboard</Link>
                <span>/</span>
                <span>My Visits</span>
              </nav>
              <h1 className="text-3xl font-bold text-gray-900">My Medical Visits</h1>
              <p className="text-gray-600 mt-1">View all your medical visit history and details</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-blue-600">{visits.length}</div>
              <div className="text-sm text-gray-500">Total Visits</div>
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r shadow-sm">
            <div className="flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <span>{error}</span>
            </div>
          </div>
        )}

        {visits.length === 0 ? (
          <div className="text-center py-12">
            <div className="bg-gray-50 p-8 rounded-xl">
              <div className="bg-blue-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2-2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No Visits Found</h3>
              <p className="text-gray-600 mb-4">You haven't had any medical visits yet.</p>
              <Link href="/dashboard" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
                Back to Dashboard
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {visits.map((visit) => (
              <div key={visit.id} className="bg-white rounded-xl shadow-lg border border-gray-100 hover:shadow-xl transition-shadow duration-200">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-grow">
                      <div className="flex items-center space-x-4 mb-4">
                        <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-gray-900">
                            {visit.visit_type?.replace('_', ' ').toUpperCase() || 'Medical Visit'}
                          </h3>
                          <p className="text-gray-600">Dr. {visit.doctor_name || 'Unknown'}</p>
                        </div>
                        <div className="flex space-x-2">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(visit.status)}`}>
                            {visit.status?.replace('_', ' ').toUpperCase() || 'UNKNOWN'}
                          </span>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPaymentStatusColor(visit.payment_status)}`}>
                            {visit.payment_status?.toUpperCase() || 'UNKNOWN'}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                        <div>
                          <span className="text-sm text-gray-500">Visit Date</span>
                          <p className="font-medium">{formatDate(visit.check_in_time)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Check-in Time</span>
                          <p className="font-medium">
                            {visit.check_in_time ? new Date(visit.check_in_time).toLocaleTimeString('en-US', { 
                              hour: '2-digit', 
                              minute: '2-digit' 
                            }) : 'N/A'}
                          </p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Total Amount</span>
                          <p className="font-medium text-green-600">{formatCurrency(visit.total_amount)}</p>
                        </div>
                        <div>
                          <span className="text-sm text-gray-500">Visit ID</span>
                          <p className="font-mono text-sm">{visit.visit_number || visit.id}</p>
                        </div>
                      </div>

                      {visit.check_out_time && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Check-out Time</span>
                          <p className="font-medium">
                            {new Date(visit.check_out_time).toLocaleString('en-US', {
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </p>
                        </div>
                      )}

                      {visit.duration && (
                        <div className="mb-4">
                          <span className="text-sm text-gray-500">Duration</span>
                          <p className="font-medium">{visit.duration}</p>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col space-y-2 ml-6">
                      <Link 
                        href={`/visits/${visit.id}`}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-center text-sm"
                      >
                        View Details
                      </Link>
                      {visit.status === 'ready_for_checkout' && (
                        <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm">
                          Complete Checkout
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Back to Dashboard */}
        <div className="mt-12 text-center">
          <Link 
            href="/dashboard"
            className="inline-flex items-center px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    </MainLayout>
  );
}