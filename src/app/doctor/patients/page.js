'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import patientService from '@/services/patientService';

export default function DoctorPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  // Authentication check
  useEffect(() => {
    if (!isAuthenticated || (user && user.user_type !== 'Doctor')) {
      router.push('/login');
      return;
    }
  }, [isAuthenticated, user, router]);

  // Fetch patient visits
  useEffect(() => {
    const fetchPatients = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching patient visits...');
        
        const response = await patientService.getMyPatients();
        console.log('Patient visits response:', response);
        
        // The response should contain the patient visits data
        if (response && response.results) {
          setPatients(response.results);
        } else if (Array.isArray(response)) {
          setPatients(response);
        } else {
          console.warn('Unexpected response format:', response);
          setPatients([]);
        }
      } catch (err) {
        console.error('Error fetching patient visits:', err);
        setError('Failed to load patient visits. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated && user && user.user_type === 'Doctor') {
      fetchPatients();
    }
  }, [isAuthenticated, user]);

  // Filter patients based on search and status
  const filteredPatients = patients.filter(visit => {
    const matchesSearch = searchTerm === '' || 
      visit.patient_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.visit_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      visit.visit_type?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || visit.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Helper functions
  const getStatusBadge = (status) => {
    const statusConfig = {
      'checked_in': { color: 'bg-blue-100 text-blue-800', label: 'Checked In' },
      'in_consultation': { color: 'bg-yellow-100 text-yellow-800', label: 'In Consultation' },
      'ready_for_checkout': { color: 'bg-green-100 text-green-800', label: 'Ready for Checkout' },
      'completed': { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const getVisitTypeBadge = (visitType) => {
    const typeConfig = {
      'emergency': { color: 'bg-red-100 text-red-800', label: 'Emergency' },
      'specialist_consultation': { color: 'bg-purple-100 text-purple-800', label: 'Specialist' },
      'followup': { color: 'bg-green-100 text-green-800', label: 'Follow-up' },
      'routine_checkup': { color: 'bg-blue-100 text-blue-800', label: 'Routine' },
      'inpatient': { color: 'bg-orange-100 text-orange-800', label: 'Inpatient' }
    };
    
    const config = typeConfig[visitType] || { color: 'bg-gray-100 text-gray-800', label: visitType };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handlePatientClick = (visit) => {
    // Navigate to patient details or consultation page
    router.push(`/doctor/patients/${visit.patient}?visit=${visit.id}`);
  };

  const handleStartConsultation = (visit) => {
    // Navigate to consultation interface
    router.push(`/doctor/consultation/${visit.id}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading patient visits...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Patients</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">My Patients</h1>
              <div className="ml-4 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                {filteredPatients.length} visits
              </div>
            </div>
            <div className="text-sm text-gray-600">
              Dr. {user?.profile?.first_name} {user?.profile?.last_name}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search and Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Patients
              </label>
              <input
                type="text"
                placeholder="Search by name, visit number, or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                <option value="checked_in">Checked In</option>
                <option value="in_consultation">In Consultation</option>
                <option value="ready_for_checkout">Ready for Checkout</option>
                <option value="completed">Completed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Patient Visits List */}
        {filteredPatients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <svg className="w-12 h-12 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No patient visits found</h3>
            <p className="text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filter criteria.' 
                : 'No patient visits are currently assigned to you.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Details
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredPatients.map((visit) => (
                    <tr key={visit.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center">
                              <span className="text-sm font-medium text-gray-700">
                                {visit.patient_name?.charAt(0) || 'P'}
                              </span>
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {visit.patient_name || 'Unknown Patient'}
                            </div>
                            <div className="text-sm text-gray-500">
                              ID: {visit.patient}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          Visit #{visit.visit_number?.substring(0, 8)}...
                        </div>
                        <div className="text-sm text-gray-500">
                          {getVisitTypeBadge(visit.visit_type)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(visit.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDateTime(visit.check_in_time)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          ${visit.total_amount}
                        </div>
                        <div className="text-sm text-gray-500">
                          {visit.payment_status === 'pending' ? 'Pending' : 'Paid'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handlePatientClick(visit)}
                            className="text-blue-600 hover:text-blue-900 transition-colors"
                          >
                            View
                          </button>
                          {(visit.status === 'checked_in' || visit.status === 'in_consultation') && (
                            <button
                              onClick={() => handleStartConsultation(visit)}
                              className="text-green-600 hover:text-green-900 transition-colors"
                            >
                              Consult
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}