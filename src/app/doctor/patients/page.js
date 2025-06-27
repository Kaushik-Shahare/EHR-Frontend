"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import patientService from '@/services/patientService';

export default function PatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { user, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPatients();
    }
  }, [isAuthenticated, user]);

  const fetchPatients = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log("Fetching patients for patients page...");
      
      // Use getMyPatients() to get patients assigned to this doctor
      const patientsData = await patientService.getMyPatients();
      console.log("Fetched patients:", patientsData);
      
      setPatients(Array.isArray(patientsData) ? patientsData : []);
    } catch (err) {
      console.error('Error fetching patients:', err);
      setError('Failed to load patients. Please try again. ' + (err.message || ''));
    }
    setLoading(false);
  };

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient => {
    const searchString = searchTerm.toLowerCase();
    const name = (patient.name || '').toLowerCase();
    const email = (patient.email || '').toLowerCase();
    
    return name.includes(searchString) || email.includes(searchString);
  });

  return (
    <div className="p-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <h1 className="text-2xl font-bold">My Patients</h1>
        <div className="mt-4 md:mt-0 w-full md:w-auto">
          <input
            type="text"
            placeholder="Search patients..."
            className="px-4 py-2 w-full md:w-80 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center p-20">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      ) : filteredPatients.length === 0 ? (
        <div className="text-center p-10 bg-white rounded-lg shadow">
          {searchTerm ? (
            <p className="text-gray-600">No patients found matching "{searchTerm}"</p>
          ) : (
            <p className="text-gray-600">No patients have been assigned to you yet.</p>
          )}
        </div>
      ) : (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Details
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPatients.map(patient => (
                <tr key={patient.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold">
                        {patient.name ? patient.name.charAt(0) : patient.email.charAt(0)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{patient.name || 'N/A'}</div>
                        <div className="text-sm text-gray-500">ID: {patient.id}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{patient.email}</div>
                    <div className="text-sm text-gray-500">{patient.profile?.phone || 'No phone'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">Age: {patient.profile?.age || 'N/A'}</div>
                    <div className="text-sm text-gray-500">Gender: {patient.profile?.gender || 'N/A'}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button
                      onClick={() => router.push(`/patient/${patient.id}`)}
                      className="text-blue-600 hover:text-blue-900 mr-4"
                    >
                      View Records
                    </button>
                    <button
                      onClick={() => {
                        // You could implement starting a new visit/consultation here
                        router.push(`/records/new?patientId=${patient.id}`);
                      }}
                      className="text-green-600 hover:text-green-900"
                    >
                      New Record
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
