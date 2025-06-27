"use client";

import { useEffect } from "react";

export default function SuccessModal({ isOpen, onClose, title, message, patientData }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          {/* Success Icon */}
          <div className="flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
          </div>

          {/* Title */}
          <h3 className="text-xl font-semibold text-gray-900 text-center mb-2">
            {title || "Registration Successful!"}
          </h3>

          {/* Message */}
          <p className="text-gray-600 text-center mb-6">
            {message || "Patient has been successfully registered in the system."}
          </p>

          {/* Patient Details Summary */}
          {patientData && (
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <h4 className="text-sm font-medium text-gray-700 mb-3">Patient Details:</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-medium text-gray-900">{patientData.name}</span>
                </div>
                {patientData.email && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Email:</span>
                    <span className="font-medium text-gray-900">{patientData.email}</span>
                  </div>
                )}
                {patientData.phone && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Phone:</span>
                    <span className="font-medium text-gray-900">{patientData.phone}</span>
                  </div>
                )}
                {patientData.appointmentDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Appointment:</span>
                    <span className="font-medium text-gray-900">
                      {new Date(patientData.appointmentDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {patientData.reason && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Visit Type:</span>
                    <span className="font-medium text-gray-900 capitalize">
                      {patientData.reason.replace('_', ' ')}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              Close
            </button>
            <button
              onClick={() => {
                // You can add additional actions here like printing or viewing patient details
                onClose();
              }}
              className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
            >
              View Records
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
