'use client';

import React, { useState, useEffect } from 'react';

export default function NFCInterface({ 
  isOpen, 
  onClose, 
  onSessionCreated, 
  onVisitSelected,
  currentPatient,
  existingSession,
  existingVisits = []
}) {
  const [step, setStep] = useState('nfc'); // 'nfc', 'visit-selection', 'visit-creation'
  const [nfcCardId, setNfcCardId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sessionData, setSessionData] = useState(null);
  const [selectedVisit, setSelectedVisit] = useState(null);
  const [newVisitData, setNewVisitData] = useState({
    visit_type: 'consultation',
    reason_for_visit: ''
  });

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      if (existingSession) {
        setStep('visit-selection');
        setSessionData(existingSession);
      } else {
        setStep('nfc');
        setError('');
        setNfcCardId('');
      }
    }
  }, [isOpen, existingSession]);

  const handleNfcTap = async () => {
    if (!nfcCardId.trim()) {
      setError('Please enter NFC Card ID');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/ehr/nfc/tap/${nfcCardId}/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.status && data.data?.session) {
        const session = data.data.session;
        setSessionData(session);
        
        // Store session for future use
        if (onSessionCreated) {
          onSessionCreated(session);
        }
        
        // Move to visit selection step
        setStep('visit-selection');
      } else {
        setError(data.message || 'Failed to tap NFC card');
      }
    } catch (error) {
      console.error('NFC Tap Error:', error);
      setError('Failed to tap NFC card. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVisitSelect = (visit) => {
    setSelectedVisit(visit);
    if (onVisitSelected) {
      onVisitSelected(visit);
    }
    onClose();
  };

  const handleCreateNewVisit = async () => {
    if (!newVisitData.reason_for_visit.trim()) {
      setError('Please enter reason for visit');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:8000/api/ehr/patient-visits/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          patient: currentPatient?.id,
          visit_type: newVisitData.visit_type,
          reason_for_visit: newVisitData.reason_for_visit,
          session_token: sessionData?.session_token
        })
      });

      const data = await response.json();
      
      if (data.status && data.data) {
        const newVisit = data.data;
        if (onVisitSelected) {
          onVisitSelected(newVisit);
        }
        onClose();
      } else {
        setError(data.message || 'Failed to create visit');
      }
    } catch (error) {
      console.error('Create Visit Error:', error);
      setError('Failed to create visit. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">
            {step === 'nfc' && 'NFC Authentication'}
            {step === 'visit-selection' && 'Select or Create Visit'}
            {step === 'visit-creation' && 'Create New Visit'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {step === 'nfc' && (
          <div className="space-y-4">
            <div>
              <p className="text-gray-600 mb-4">
                Enter your NFC Card ID to access patient visit information and medical actions.
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                NFC Card ID
              </label>
              <input
                type="text"
                value={nfcCardId}
                onChange={(e) => setNfcCardId(e.target.value)}
                placeholder="e.g., be135026-0295-448c-85de-39a64c83d067"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNfcTap}
                disabled={loading || !nfcCardId.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Authenticating...
                  </>
                ) : (
                  'Tap NFC Card'
                )}
              </button>
            </div>
          </div>
        )}

        {step === 'visit-selection' && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-green-600">NFC session authenticated successfully</p>
              </div>
            </div>

            <div>
              <p className="text-gray-600 mb-4">
                Select an existing visit or create a new one to associate medical documents.
              </p>
              
              {existingVisits.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Recent Visits:</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {existingVisits.map((visit) => (
                      <button
                        key={visit.id}
                        onClick={() => handleVisitSelect(visit)}
                        className="w-full text-left p-3 border border-gray-200 hover:border-blue-300 hover:bg-blue-50 rounded-md transition-colors"
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium text-gray-900">Visit #{visit.visit_number}</p>
                            <p className="text-sm text-gray-600">{visit.reason_for_visit}</p>
                            <p className="text-xs text-gray-500">{new Date(visit.visit_date).toLocaleDateString()}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            visit.status === 'active' ? 'bg-green-100 text-green-800' :
                            visit.status === 'completed' ? 'bg-gray-100 text-gray-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {visit.status}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
              
              <button
                onClick={() => setStep('visit-creation')}
                className="w-full p-3 border-2 border-dashed border-blue-300 hover:border-blue-400 hover:bg-blue-50 rounded-md transition-colors flex items-center justify-center text-blue-600"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Visit
              </button>
            </div>
          </div>
        )}

        {step === 'visit-creation' && (
          <div className="space-y-4">
            <button
              onClick={() => setStep('visit-selection')}
              className="flex items-center text-blue-600 hover:text-blue-700 text-sm mb-2"
            >
              <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to visit selection
            </button>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Visit Type
              </label>
              <select
                value={newVisitData.visit_type}
                onChange={(e) => setNewVisitData({...newVisitData, visit_type: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="consultation">Consultation</option>
                <option value="follow_up">Follow-up</option>
                <option value="emergency">Emergency</option>
                <option value="routine_check">Routine Check</option>
                <option value="procedure">Procedure</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for Visit *
              </label>
              <textarea
                value={newVisitData.reason_for_visit}
                onChange={(e) => setNewVisitData({...newVisitData, reason_for_visit: e.target.value})}
                placeholder="Enter the reason for this visit..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setStep('visit-selection')}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateNewVisit}
                disabled={loading || !newVisitData.reason_for_visit.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors flex items-center justify-center"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creating...
                  </>
                ) : (
                  'Create Visit'
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}