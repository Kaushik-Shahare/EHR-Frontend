'use client';

import { useState } from 'react';

const FilterControls = ({ filters, onFilterChange }) => {
  const [localFilters, setLocalFilters] = useState(filters);
  
  const handleFilterChange = (field, value) => {
    const updatedFilters = { ...localFilters, [field]: value };
    setLocalFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0 sm:space-x-4">
        <div className="flex-1">
          <label htmlFor="recordType" className="block text-sm font-medium text-gray-700 mb-1">
            Record Type
          </label>
          <select
            id="recordType"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={localFilters.recordType}
            onChange={(e) => handleFilterChange('recordType', e.target.value)}
          >
            <option value="">All Types</option>
            <option value="VISIT">Visits</option>
            <option value="DIAGNOSIS">Diagnoses</option>
            <option value="LAB_RESULT">Lab Results</option>
            <option value="PRESCRIPTION">Prescriptions</option>
            <option value="VITAL_SIGNS">Vital Signs</option>
          </select>
        </div>
        
        <div className="flex-1">
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            Status
          </label>
          <select
            id="status"
            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
            value={localFilters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="PENDING">Pending</option>
            <option value="ARCHIVED">Archived</option>
          </select>
        </div>
        
        <div className="flex-1 sm:text-right">
          <label className="invisible block text-sm font-medium text-gray-700 mb-1">
            Actions
          </label>
          <button
            type="button"
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            onClick={() => {
              const resetFilters = { recordType: '', status: 'ACTIVE' };
              setLocalFilters(resetFilters);
              onFilterChange(resetFilters);
            }}
          >
            Reset Filters
          </button>
        </div>
      </div>
    </div>
  );
};

export default FilterControls;
