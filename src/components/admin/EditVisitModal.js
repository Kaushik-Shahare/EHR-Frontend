'use client';

import { useState, useEffect } from 'react';

export default function EditVisitModal({ visit, isOpen, onClose, onSave, isLoading = false }) {
  const [formData, setFormData] = useState({
    status: '',
    visit_type: '',
    attending_doctor: '',
    payment_status: '',
    total_amount: ''
  });

  // Status options from the API
  const statusOptions = [
    { value: 'checked_in', label: 'Checked In' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'ready_for_checkout', label: 'Ready for Checkout' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  // Visit type options
  const visitTypeOptions = [
    { value: 'routine_checkup', label: 'Routine Checkup' },
    { value: 'specialist_consultation', label: 'Specialist Consultation' },
    { value: 'followup', label: 'Follow-up' },
    { value: 'emergency', label: 'Emergency' },
    { value: 'pediatric', label: 'Pediatric' },
    { value: 'orthopedic', label: 'Orthopedic' },
    { value: 'cardiology', label: 'Cardiology' },
    { value: 'neurology', label: 'Neurology' }
  ];

  // Payment status options
  const paymentStatusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' }
  ];

  useEffect(() => {
    if (visit) {
      // Initialize form with current visit data
      setFormData({
        status: visit.status || '',
        visit_type: visit.visitType || '',
        attending_doctor: visit.doctor || '',
        payment_status: visit.payment?.status || 'pending',
        total_amount: visit.payment?.amount || '0.00'
      });
    }
  }, [visit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Prepare data for API
    const apiData = {};
    
    // Only include changed fields
    if (formData.status && formData.status !== visit.status) {
      apiData.status = formData.status;
    }
    
    if (formData.visit_type && formData.visit_type !== visit.visitType) {
      apiData.visit_type = formData.visit_type;
    }
    
    if (formData.payment_status && formData.payment_status !== visit.payment.status) {
      apiData.payment_status = formData.payment_status;
    }
    
    if (formData.total_amount && formData.total_amount !== visit.payment.amount) {
      apiData.total_amount = formData.total_amount;
    }
    
    // Pass data to parent component
    onSave(apiData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center border border-gray-500 shadow-2xl backdrop:blur-2xl">
      <div className="relative bg-white rounded-lg shadow-xl mx-4 w-full max-w-md md:mx-0">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-semibold text-gray-900">
            Edit Visit Details
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6">
          {/* Visit ID and Patient Name - Non-editable */}
          <div className="mb-6">
            <div className="mb-2">
              <span className="block text-sm font-medium text-gray-700">Visit ID:</span>
              <span className="block text-sm text-gray-900">{visit?.visitNumber}</span>
            </div>
            <div>
              <span className="block text-sm font-medium text-gray-700">Patient:</span>
              <span className="block text-sm text-gray-900">{visit?.name}</span>
            </div>
          </div>

          {/* Status */}
          <div className="mb-4">
            <label htmlFor="status" className="block text-sm font-medium text-gray-700">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            >
              <option value="">Select Status</option>
              {statusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Visit Type */}
          <div className="mb-4">
            <label htmlFor="visit_type" className="block text-sm font-medium text-gray-700">
              Visit Type
            </label>
            <select
              id="visit_type"
              name="visit_type"
              value={formData.visit_type}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            >
              <option value="">Select Visit Type</option>
              {visitTypeOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status */}
          <div className="mb-4">
            <label htmlFor="payment_status" className="block text-sm font-medium text-gray-700">
              Payment Status
            </label>
            <select
              id="payment_status"
              name="payment_status"
              value={formData.payment_status}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            >
              <option value="">Select Payment Status</option>
              {paymentStatusOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Total Amount */}
          <div className="mb-6">
            <label htmlFor="total_amount" className="block text-sm font-medium text-gray-700">
              Total Amount ($)
            </label>
            <input
              type="number"
              step="0.01"
              id="total_amount"
              name="total_amount"
              value={formData.total_amount}
              onChange={handleChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-teal-500 focus:ring-teal-500 sm:text-sm"
            />
          </div>

          <div className="mt-5 sm:mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className={`inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 ${
                isLoading ? 'bg-teal-400' : 'bg-teal-600 hover:bg-teal-700'
              } text-base font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 sm:text-sm`}
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </>
              ) : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
