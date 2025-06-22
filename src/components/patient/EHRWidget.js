import React, { useState } from 'react';

export default function EHRWidget({
  patientName,
  patientId,
  lastUpdated,
  records = [],
}) {
  const [activeFilter, setActiveFilter] = useState('all');
  const [expandedRecord, setExpandedRecord] = useState(null);
  
  // Sample records if none provided
  const patientRecords = records.length > 0 ? records : [
    {
      id: '1',
      date: 'May 15, 2025',
      type: 'visit',
      title: 'Annual Physical Examination',
      provider: 'Dr. Sarah Reynolds',
      description: 'Routine annual checkup with standard labs',
      details: 'Patient is in good overall health. Blood tests show normal values. Recommended to continue current medications.',
      status: 'completed',
      documents: [
        {name: 'Physical Examination Report', type: 'PDF'},
        {name: 'Lab Results', type: 'PDF'}
      ]
    },
    {
      id: '2',
      date: 'March 3, 2025',
      type: 'visit',
      title: 'Acute Bronchitis',
      provider: 'Dr. Michael Wong',
      description: 'Evaluation and treatment for respiratory infection',
      details: 'Patient presented with cough, low-grade fever, and chest discomfort. Diagnosed with acute bronchitis. Prescribed antibiotics and cough suppressant.',
      status: 'completed'
    },
    {
      id: '3',
      date: 'Nov 12, 2024',
      type: 'surgery',
      title: 'Arthroscopic Knee Surgery',
      provider: 'Dr. James Martinez',
      description: 'Arthroscopic repair of torn meniscus',
      details: 'Patient underwent successful arthroscopic surgery to repair medial meniscus tear. Post-operative course uncomplicated. Physical therapy recommended for 8 weeks.',
      status: 'completed',
      documents: [
        {name: 'Surgical Report', type: 'PDF'},
        {name: 'Post-op Instructions', type: 'PDF'},
        {name: 'MRI Images', type: 'DICOM'}
      ]
    },
    {
      id: '4',
      date: 'Oct 5, 2024',
      type: 'imaging',
      title: 'MRI Right Knee',
      provider: 'Radiology Associates',
      description: 'MRI scan to evaluate knee pain and instability',
      details: 'MRI revealed medial meniscus tear with mild degenerative changes. No ligament tears identified.',
      status: 'completed',
      documents: [
        {name: 'MRI Report', type: 'PDF'},
        {name: 'MRI Images', type: 'DICOM'}
      ]
    },
    {
      id: '5',
      date: 'July 22, 2024',
      type: 'lab',
      title: 'Complete Blood Panel',
      provider: 'MedLabs Diagnostics',
      description: 'Routine blood work including CBC, lipid panel, and metabolic panel',
      details: 'All values within normal range except slightly elevated LDL cholesterol (135 mg/dL). Recommended dietary changes.',
      status: 'completed',
      documents: [
        {name: 'Lab Results', type: 'PDF'}
      ]
    },
    {
      id: '6',
      date: 'July 15, 2024',
      type: 'prescription',
      title: 'Albuterol Inhaler Renewal',
      provider: 'Dr. Sarah Reynolds',
      description: 'Renewal of asthma medication',
      details: 'Prescription for Albuterol Inhaler (90mcg) - 200 doses. Use as needed for asthma symptoms.',
      status: 'completed'
    },
    {
      id: '7',
      date: 'Aug 10, 2025',
      type: 'visit',
      title: 'Follow-up Appointment',
      provider: 'Dr. Sarah Reynolds',
      description: 'Follow-up to discuss lab results and medication efficacy',
      status: 'scheduled'
    }
  ];
  
  const getTypeIcon = (type) => {
    switch (type) {
      case 'visit':
        return (
          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        );
      case 'surgery':
        return (
          <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'lab':
        return (
          <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
          </svg>
        );
      case 'imaging':
        return (
          <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        );
      case 'prescription':
        return (
          <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
        );
    }
  };
  
  const getStatusBadge = (status) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">Completed</span>;
      case 'scheduled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">Scheduled</span>;
      case 'cancelled':
        return <span className="px-2 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800">Cancelled</span>;
      default:
        return null;
    }
  };

  const filteredRecords = activeFilter === 'all' 
    ? patientRecords 
    : patientRecords.filter(record => record.type === activeFilter);

  const sortedRecords = [...filteredRecords].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  const toggleRecordDetails = (id) => {
    setExpandedRecord(expandedRecord === id ? null : id);
  };
  
  return (
    <div className="bg-white shadow ring-1 ring-gray-200 ring-opacity-5 rounded-lg overflow-hidden">
      <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-bold">Patient Medical Records</h3>
          <p className="text-sm opacity-90">Last updated: {lastUpdated}</p>
        </div>
        <div className="text-right">
          <p className="font-medium">{patientName}</p>
          <p className="text-xs opacity-90">ID: {patientId}</p>
        </div>
      </div>

      <div className="p-4">
        {/* Filter tabs */}
        <div className="flex overflow-x-auto space-x-2 pb-2 mb-4 border-b border-gray-100">
          <button 
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'all' 
                ? 'bg-doctorTeal text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            All Records
          </button>
          <button 
            onClick={() => setActiveFilter('visit')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'visit' 
                ? 'bg-blue-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              {getTypeIcon('visit')}
              <span className="ml-1">Visits</span>
            </span>
          </button>
          <button 
            onClick={() => setActiveFilter('surgery')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'surgery' 
                ? 'bg-red-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              {getTypeIcon('surgery')}
              <span className="ml-1">Surgeries</span>
            </span>
          </button>
          <button 
            onClick={() => setActiveFilter('lab')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'lab' 
                ? 'bg-purple-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              {getTypeIcon('lab')}
              <span className="ml-1">Labs</span>
            </span>
          </button>
          <button 
            onClick={() => setActiveFilter('imaging')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'imaging' 
                ? 'bg-indigo-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              {getTypeIcon('imaging')}
              <span className="ml-1">Imaging</span>
            </span>
          </button>
          <button 
            onClick={() => setActiveFilter('prescription')}
            className={`px-3 py-1.5 text-sm font-medium rounded-md whitespace-nowrap transition-colors ${
              activeFilter === 'prescription' 
                ? 'bg-green-600 text-white' 
                : 'text-gray-600 hover:bg-gray-100'
            }`}
          >
            <span className="flex items-center">
              {getTypeIcon('prescription')}
              <span className="ml-1">Prescriptions</span>
            </span>
          </button>
        </div>

        {/* Records table */}
        <div className="overflow-x-auto">
          {sortedRecords.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200 border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    Date
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    Type
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    Title
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    Provider
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    Status
                  </th>
                  <th scope="col" className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    Description
                    <span className="text-gray-400 ml-1 font-normal normal-case">(click row for details)</span>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center text-xs font-medium uppercase tracking-wider text-gray-500 border-b border-gray-200">
                    Docs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {sortedRecords.map(record => (
                  <React.Fragment key={record.id}>
                    <tr 
                      className={`hover:bg-gray-50 transition-colors cursor-pointer ${expandedRecord === record.id ? 'bg-blue-50/30' : ''}`}
                      onClick={() => toggleRecordDetails(record.id)}
                    >
                      <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {record.date}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 mr-2">
                            {getTypeIcon(record.type)}
                          </div>
                          <span className="text-sm text-gray-700 capitalize">{record.type}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm font-medium text-gray-900">
                        {record.title}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        {record.provider}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        {getStatusBadge(record.status)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-700">
                        <div className="flex justify-between items-center">
                          <div className="truncate max-w-[260px]">
                            {record.description}
                          </div>
                          <svg 
                            className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ml-2 ${expandedRecord === record.id ? 'transform rotate-180' : ''}`}
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24" 
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-center">
                        {record.documents && record.documents.length > 0 ? (
                          <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-gray-100 text-xs font-medium text-gray-800">
                            {record.documents.length}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">-</span>
                        )}
                      </td>
                    </tr>
                    
                    {/* Expanded details row */}
                    {expandedRecord === record.id && (
                      <tr className="bg-gray-50">
                        <td colSpan={7} className="px-6 py-4 border-b border-gray-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-4">
                              <div>
                                <h5 className="text-xs font-medium uppercase text-gray-500 mb-1">Description</h5>
                                <p className="text-sm text-gray-700">{record.description}</p>
                              </div>
                              
                              {record.details && (
                                <div>
                                  <h5 className="text-xs font-medium uppercase text-gray-500 mb-1">Details</h5>
                                  <p className="text-sm text-gray-700 bg-white p-3 rounded border border-gray-200">
                                    {record.details}
                                  </p>
                                </div>
                              )}
                            </div>
                            
                            {record.documents && record.documents.length > 0 && (
                              <div>
                                <h5 className="text-xs font-medium uppercase text-gray-500 mb-2">Documents</h5>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                  {record.documents.map((doc, idx) => (
                                    <button 
                                      key={idx} 
                                      className="flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                                    >
                                      <svg className="w-4 h-4 mr-2 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                      </svg>
                                      {doc.name}
                                    </button>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-8">
              <svg className="w-12 h-12 text-gray-300 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-gray-500">No records found</p>
            </div>
          )}
        </div>

        <div className="mt-4 flex justify-end">
          <button className="text-doctorTeal hover:text-doctorTeal/80 text-sm font-medium flex items-center">
            <span>View Full Record History</span>
            <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}