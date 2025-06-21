"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

// Sample appointment data
const appointments = [
  {
    id: '1',
    name: 'Emily Johnson',
    time: '9:00 AM',
    complaint: 'Persistent cough and mild fever for 3 days',
    status: 'in-progress',
  },
  {
    id: '2',
    name: 'Michael Roberts',
    time: '10:30 AM',
    complaint: 'Follow-up on hypertension medication',
    status: 'scheduled',
  },
  {
    id: '3',
    name: 'Sarah Davis',
    time: '11:45 AM',
    complaint: 'Headache and dizziness',
    status: 'scheduled',
  },
  {
    id: '4',
    name: 'David Wilson',
    time: '2:15 PM',
    complaint: 'Annual physical examination',
    status: 'completed',
  },
];

const notifications = [
  {
    id: 'n1',
    type: 'info',
    message: 'Lab results are ready for Emily Johnson',
    timestamp: new Date(),
    patientId: '1',
    patientName: 'Emily Johnson',
  },
  {
    id: 'n2',
    type: 'warning',
    message: 'Potential medication interaction detected',
    timestamp: new Date(Date.now() - 15 * 60000), // 15 minutes ago
    patientId: '1',
    patientName: 'Emily Johnson',
  },
];

export default function DoctorDashboard() {
  const router = useRouter();
  const [activeNotifications, setActiveNotifications] = useState(notifications);

  const handleStartConsultation = (id) => {
    console.log(`Starting consultation for patient ${id}`);
    // In a real app, this would navigate to the consultation page or open a modal
  };

  const handleViewEHR = (id) => {
    console.log(`Viewing EHR for patient ${id}`);
    // Navigate to the patient page with the correct ID
    router.push(`/patient/${id}`);
  };

  return (
    <>
      <main className="p-4 md:p-6 max-w-screen-2xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content Column */}
          <div className="lg:col-span-2 space-y-6">
          <h1 className='text-4xl font-bold'>Welcome Dr. Jay Valiya</h1>
            {/* Today's Appointments Section */}
            <section className="bg-white border border-gray-200 shadow-md rounded-xl overflow-hidden ring-1 ring-gray-100 ring-opacity-80">
              <div className="flex justify-between items-center p-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-800">Today's Appointments</h2>
                <span className="text-sm bg-blue-50 text-blue-700 py-1 px-3 rounded-full font-medium">
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
                </span>
              </div>
              
              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                        Patient
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                        Time
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                        Complaint
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium  uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium  uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {appointments.map((appointment) => (
                      <tr key={appointment.id} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                              <span className="text-sm font-bold ">
                                {appointment.name.split(' ').map(n => n[0]).join('')}
                              </span>
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium ">{appointment.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm ">{appointment.time}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm  max-w-xs truncate">{appointment.complaint}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${appointment.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 
                              appointment.status === 'in-progress' ? 'bg-yellow-100 text-yellow-800' :
                              appointment.status === 'completed' ? 'bg-green-100 text-green-800' :
                              'bg-red-100 text-red-800'}`}
                          >
                            {appointment.status === 'scheduled' ? 'Scheduled' :
                             appointment.status === 'in-progress' ? 'In Progress' :
                             appointment.status === 'completed' ? 'Completed' : 'Cancelled'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex justify-end space-x-2">
                            <button
                              onClick={() => handleViewEHR(appointment.id)}
                              className=" hover: px-2 py-1 rounded hover:bg-gray-100"
                            >
                              View EHR
                            </button>
                            <button
                              onClick={() => handleStartConsultation(appointment.id)}
                              className=" bg-doctorTeal hover:bg-doctorTeal/90 px-2 py-1 rounded"
                            >
                              Start
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
        </div>
        </div>
      </main>
    </>
  );
}
