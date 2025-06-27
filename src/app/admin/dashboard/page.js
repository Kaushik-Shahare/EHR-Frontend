'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getPatientVisits, updatePatientVisit } from '@/services/apiService';
import EditVisitModal from '@/components/admin/EditVisitModal';

export default function AdminDashboard() {
  const router = useRouter();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentVisit, setCurrentVisit] = useState(null);
  const [updateLoading, setUpdateLoading] = useState(false);

  // Fetching patient data from API
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const response = await getPatientVisits();
        
        // Transform the API data to fit our component's needs
        if (response && response.results) {
          const formattedPatients = response.results.map(visit => ({
            id: visit.id,
            patientId: visit.patient,
            name: visit.patient_name || "Unknown",
            admissionDate: new Date(visit.check_in_time).toISOString().split('T')[0],
            department: mapVisitTypeToSpecialty(visit.visit_type),
            doctor: visit.doctor_name || "Unassigned",
            status: mapStatusToDisplayStatus(visit.status),
            room: `R-${visit.id}`, // Placeholder for room number
            // Adding additional fields that might be useful
            visitNumber: visit.visit_number,
            visitType: visit.visit_type,
            checkInTime: visit.check_in_time,
            checkOutTime: visit.check_out_time,
            payment: {
              amount: visit.total_amount,
              status: visit.payment_status
            }
          }));
          
          setPatients(formattedPatients);
        }
      } catch (error) {
        console.error('Error fetching patient visits:', error);
        // Could add error state handling here
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, []);

  // Helper functions to map API data to display values
  const mapVisitTypeToSpecialty = (visitType) => {
    const specialtyMap = {
      'specialist_consultation': 'Specialty Care',
      'followup': 'Follow-up Care',
      'routine_checkup': 'General Medicine',
      'emergency': 'Emergency',
      'pediatric': 'Pediatrics',
      'orthopedic': 'Orthopedics',
      'cardiology': 'Cardiology',
      'neurology': 'Neurology'
    };
    
    return specialtyMap[visitType] || 'General Medicine';
  };
  
  const mapStatusToDisplayStatus = (status) => {
    const statusMap = {
      'checked_in': 'Admitted',
      'in_progress': 'In Treatment',
      'ready_for_checkout': 'Ready for Checkout',
      'completed': 'Completed',
      'cancelled': 'Cancelled'
    };
    
    return statusMap[status] || 'Admitted';
  };

  const handleAddPatient = () => {
    router.push('/admin/dashboard/register');
  };

  const handleLogout = () => {
    // Implement logout logic
    router.push('/login');
  };

  // Handle closing the edit modal
  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
    setCurrentVisit(null);
  };

  // Handle saving edited visit data
  const handleSaveVisit = async (editedData) => {
    if (!currentVisit || !editedData || Object.keys(editedData).length === 0) {
      handleCloseEditModal();
      return;
    }

    try {
      setUpdateLoading(true);
      // Call API to update visit
      await updatePatientVisit(currentVisit.id, editedData);
      
      // Refresh data after successful update
      const response = await getPatientVisits();
      
      // Transform the API data to fit our component's needs
      if (response && response.results) {
        const formattedPatients = response.results.map(visit => ({
          id: visit.id,
          patientId: visit.patient,
          name: visit.patient_name || "Unknown",
          admissionDate: new Date(visit.check_in_time).toISOString().split('T')[0],
          department: mapVisitTypeToSpecialty(visit.visit_type),
          doctor: visit.doctor_name || "Unassigned",
          status: mapStatusToDisplayStatus(visit.status),
          room: `R-${visit.id}`, // Placeholder for room number
          // Adding additional fields that might be useful
          visitNumber: visit.visit_number,
          visitType: visit.visit_type,
          checkInTime: visit.check_in_time,
          checkOutTime: visit.check_out_time,
          payment: {
            amount: visit.total_amount,
            status: visit.payment_status
          }
        }));
        
        setPatients(formattedPatients);
      }
      
      // Show success message (could add toast notification here)
      console.log('Visit updated successfully');
      
    } catch (error) {
      // Handle error (could add toast notification here)
      console.error('Failed to update visit:', error);
    } finally {
      setUpdateLoading(false);
      handleCloseEditModal();
    }
  };

  const getStatusBadge = (status) => {
    const statusColors = {
      'Admitted': 'bg-green-100 text-green-800',
      'In Treatment': 'bg-blue-100 text-blue-800',
      'Ready for Checkout': 'bg-purple-100 text-purple-800',
      'Completed': 'bg-teal-100 text-teal-800',
      'Cancelled': 'bg-red-100 text-red-800'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleEditVisit = (visit) => {
    setCurrentVisit(visit);
    setIsEditModalOpen(true);
  };

  const handleUpdateVisit = async (editedData) => {
    if (!currentVisit || !editedData || Object.keys(editedData).length === 0) {
      setIsEditModalOpen(false);
      return;
    }

    try {
      setUpdateLoading(true);
      console.log('Updating visit ID:', currentVisit.id, 'with data:', editedData);
      
      // Call API to update visit
      const updatedVisit = await updatePatientVisit(currentVisit.id, editedData);
      console.log('API response:', updatedVisit);
      
      // Refresh data after successful update
      const response = await getPatientVisits();
      
      // Transform the API data to fit our component's needs
      if (response && response.results) {
        const formattedPatients = response.results.map(visit => ({
          id: visit.id,
          patientId: visit.patient,
          name: visit.patient_name || "Unknown",
          admissionDate: new Date(visit.check_in_time).toISOString().split('T')[0],
          department: mapVisitTypeToSpecialty(visit.visit_type),
          doctor: visit.doctor_name || "Unassigned",
          status: mapStatusToDisplayStatus(visit.status),
          room: `R-${visit.id}`, // Placeholder for room number
          // Adding additional fields that might be useful
          visitNumber: visit.visit_number,
          visitType: visit.visit_type,
          checkInTime: visit.check_in_time,
          checkOutTime: visit.check_out_time,
          payment: {
            amount: visit.total_amount,
            status: visit.payment_status
          }
        }));
        
        setPatients(formattedPatients);
        
        // Show success message (could add toast notification here)
        alert('Visit updated successfully');
      }
    } catch (error) {
      // Handle error (could add toast notification here)
      console.error('Failed to update visit:', error);
      alert('Failed to update visit. Please try again.');
    } finally {
      setUpdateLoading(false);
      setIsEditModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-teal-600 text-white shadow-lg">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-white rounded flex items-center justify-center">
                  <span className="text-teal-600 font-bold text-lg">H</span>
                </div>
                <span className="text-xl font-semibold">MediCare Hospital</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-sm">Admin Dashboard</span>
              <div className="w-8 h-8 bg-teal-700 rounded-full flex items-center justify-center">
                <span className="text-sm font-medium">A</span>
              </div>
              <button 
                onClick={handleLogout}
                className="text-sm hover:text-teal-200 transition-colors"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="p-6">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Patient Visits</h1>
              <p className="text-gray-600 mt-1">Manage and view patient visits and admissions</p>
            </div>
            <button
              onClick={handleAddPatient}
              className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span>Add Patient</span>
            </button>
          </div>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-teal-100 rounded-lg">
                <svg className="w-6 h-6 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total Visits</p>
                <p className="text-2xl font-semibold text-gray-900">{patients.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 rounded-lg">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Admitted Today</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {patients.filter(p => {
                    const checkInDate = new Date(p.checkInTime).toDateString();
                    const today = new Date().toDateString();
                    return checkInDate === today;
                  }).length}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 rounded-lg">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Departments</p>
                <p className="text-2xl font-semibold text-gray-900">{new Set(patients.map(p => p.department)).size}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center">
              <div className="p-2 bg-orange-100 rounded-lg">
                <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Pending Payments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  ${patients.reduce((total, patient) => {
                    if (patient.payment.status === 'pending') {
                      return total + parseFloat(patient.payment.amount);
                    }
                    return total;
                  }, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Patients Table */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Patient Visit List</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
              <p className="mt-2 text-gray-600">Loading patient visits...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Patient Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Visit Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Doctor
                    </th>
                    {/* <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Room
                    </th> */}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Check-in Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {patients.map((patient) => (
                    <tr key={patient.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {patient.visitNumber.substring(0, 8)}...
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {patient.visitType.replace(/_/g, ' ')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.department}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.doctor}
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {patient.room}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(patient.checkInTime).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getStatusBadge(patient.status)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.payment.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          ${patient.payment.amount}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button className="text-teal-600 hover:text-teal-900 mr-3">
                          View
                        </button>
                        <button 
                          onClick={() => handleEditVisit(patient)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          Edit
                        </button>
                        <button className="text-red-600 hover:text-red-900">
                          Discharge
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {!loading && patients.length === 0 && (
            <div className="p-8 text-center">
              <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No patient visits</h3>
              <p className="mt-1 text-sm text-gray-500">Get started by checking in a new patient visit.</p>
              <div className="mt-6">
                <button
                  onClick={handleAddPatient}
                  className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700"
                >
                  <svg className="-ml-1 mr-2 h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Add Patient Visit
                </button>
              </div>
            </div>
          )}
        </div>
         {/* Edit Visit Modal */}
      {isEditModalOpen && (
        <EditVisitModal
          visit={currentVisit}
          isOpen={isEditModalOpen}
          onClose={handleCloseEditModal}
          onSave={handleUpdateVisit}
          isLoading={updateLoading}
        />
      )}
      </div>
    </div>
  );
}