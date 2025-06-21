'use client';

import Link from 'next/link';
import RecordTypeIcon from './RecordTypeIcon';

const RecordList = ({ records, isLoading }) => {
  // Helper function to format date
  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };
  
  // Helper function to get specific record details based on type
  const getRecordDetails = (record) => {
    switch (record.recordType) {
      case 'VISIT':
        return record.visit 
          ? `${record.visit.visitType.replace(/_/g, ' ')} - ${record.visit.chiefComplaint}`
          : '';
      case 'DIAGNOSIS':
        return record.diagnosis 
          ? `${record.diagnosis.conditionName} (${record.diagnosis.status})`
          : '';
      case 'LAB_RESULT':
        return record.labResult 
          ? `${record.labResult.testName}: ${record.labResult.result}`
          : '';
      case 'PRESCRIPTION':
        return record.prescription 
          ? `${record.prescription.medicationName} ${record.prescription.dosage}`
          : '';
      case 'VITAL_SIGNS':
        const vs = record.vitalSigns;
        if (!vs) return '';
        
        let details = [];
        if (vs.bloodPressureSystolic && vs.bloodPressureDiastolic) {
          details.push(`BP: ${vs.bloodPressureSystolic}/${vs.bloodPressureDiastolic}`);
        }
        if (vs.heartRate) details.push(`HR: ${vs.heartRate}`);
        if (vs.temperature) details.push(`Temp: ${vs.temperature}${vs.temperatureUnit || '°C'}`);
        
        return details.join(', ');
      default:
        return '';
    }
  };
  
  // Helper function to get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-100 text-green-800';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800';
      case 'ARCHIVED':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        {[...Array(5)].map((_, index) => (
          <div key={index} className="bg-white shadow overflow-hidden sm:rounded-md mb-3">
            <div className="px-4 py-5 sm:px-6">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      <ul className="bg-white shadow overflow-hidden sm:rounded-md">
        {records.length > 0 ? (
          records.map((record) => (
            <li key={record.id} className={`border-b last:border-b-0 border-gray-200`}>
              <Link href={`/records/${record.id}`} className="block hover:bg-gray-50">
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center flex-1 min-w-0">
                      <div className="flex-shrink-0">
                        <RecordTypeIcon type={record.recordType} />
                      </div>
                      <div className="min-w-0 flex-1 px-4">
                        <p className="text-sm font-medium text-blue-600 truncate">
                          {record.title}
                        </p>
                        <p className="mt-1 text-sm text-gray-600 truncate">
                          {getRecordDetails(record)}
                        </p>
                      </div>
                    </div>
                    <div className="flex-shrink-0 flex flex-col items-end">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(record.status)}`}>
                        {record.status}
                      </span>
                      <p className="mt-2 text-xs text-gray-500">
                        {formatDate(record.createdAt)}
                      </p>
                    </div>
                  </div>
                  {record.tags && (
                    <div className="mt-2">
                      {record.tags.split(',').map((tag, index) => (
                        <span key={index} className="mr-2 my-1 inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded">
                          {tag.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </Link>
            </li>
          ))
        ) : (
          <li className="px-4 py-5 sm:px-6 text-center text-gray-500">
            No records found
          </li>
        )}
      </ul>
    </div>
  );
};

export default RecordList;
