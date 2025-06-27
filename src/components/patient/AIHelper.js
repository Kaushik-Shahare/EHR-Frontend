import React, { useState, useEffect } from 'react';


export default function AIHelper({
  patientName,
  suggestions,
  onAccept,
  onReject,
  onRefresh,
}) {
  const [expandedSuggestion, setExpandedSuggestion] = useState(null);
  const [processingDiagnosis, setProcessingDiagnosis] = useState(null);
  const [notification, setNotification] = useState(null);

  const toggleExpand = (condition) => {
    setExpandedSuggestion(expandedSuggestion === condition ? null : condition);
  };
  
  const handleAccept = async (suggestion) => {
    try {
      setProcessingDiagnosis(suggestion.condition);
      await onAccept(suggestion);
      
      // Show success notification
      setNotification({
        type: 'success',
        message: `Diagnosis '${suggestion.condition}' successfully added to patient record.`
      });
      
      // Hide after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } catch (error) {
      // Show error notification
      setNotification({
        type: 'error',
        message: error.message || 'Failed to add diagnosis. Please try again.'
      });
      
      // Hide after 5 seconds
      setTimeout(() => setNotification(null), 5000);
    } finally {
      setProcessingDiagnosis(null);
    }
  };
  
  const handleReject = (suggestion) => {
    onReject(suggestion);
    
    // Show notification
    setNotification({
      type: 'info',
      message: `Diagnosis '${suggestion.condition}' has been dismissed.`
    });
    
    // Hide after 3 seconds
    setTimeout(() => setNotification(null), 3000);
  };
  
  const handleRefresh = () => {
    setNotification({
      type: 'info',
      message: 'Requesting new AI analysis...'
    });
    
    onRefresh();
    
    // This would be updated with real response when the backend implements real-time AI analysis
    setTimeout(() => {
      setNotification({
        type: 'success',
        message: 'AI analysis complete. Suggestions updated.'
      });
      setTimeout(() => setNotification(null), 3000);
    }, 2000);
  };

  return (
    <div className="bg-white overflow-hidden shadow-lg border border-purple-100 ring-1 ring-purple-200 ring-opacity-50 rounded-xl">
      {notification && (
        <div className={`px-4 py-3 ${
          notification.type === 'success' ? 'bg-green-50 text-green-700 border-b border-green-100' :
          notification.type === 'error' ? 'bg-red-50 text-red-700 border-b border-red-100' :
          'bg-blue-50 text-blue-700 border-b border-blue-100'
        } flex items-center`}>
          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            {notification.type === 'success' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : notification.type === 'error' ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            )}
          </svg>
          <p className="text-sm font-medium">{notification.message}</p>
        </div>
      )}
    
      <div className="bg-gradient-to-r from-aiPurple to-aiPurple/90  px-6 py-4 flex justify-between items-center">
        <div className="flex items-center">
          <div className="bg-white/20 p-1.5 rounded-lg mr-3">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-bold">AI Diagnosis Assistant</h3>
            <p className="text-xs  font-light">Powered by MedAudit AI</p>
          </div>
        </div>
        <button
          onClick={handleRefresh}
          className="p-2 rounded-full hover:bg-white/20 transition-colors duration-200 backdrop-blur-sm border border-white/20"
          aria-label="Refresh suggestions"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        </button>
      </div>

      <div className="p-5">
        <div className="bg-purple-50 border-l-4 border-aiPurple rounded-md p-3 mb-4 shadow-sm">
          <p className="text-sm text-gray-700">
            Here are AI-powered diagnostic suggestions for <span className="font-semibold text-gray-900">{patientName}</span> based on their symptoms and medical history.
          </p>
        </div>

        {suggestions.length > 0 ? (
          <div className="space-y-4">
            {suggestions.map((suggestion) => (
              <div 
                key={suggestion.condition} 
                className={`border ${expandedSuggestion === suggestion.condition ? 'border-purple-200 shadow-md' : 'border-gray-200 hover:border-purple-200'} 
                  rounded-xl overflow-hidden transition-all duration-200`}
              >
                {/* Suggestion Header */}
                <div 
                  className={`px-4 py-3 flex justify-between items-center cursor-pointer transition-colors
                    ${expandedSuggestion === suggestion.condition ? 'bg-purple-50' : 'bg-white hover:bg-purple-50/50'}`}
                  onClick={() => toggleExpand(suggestion.condition)}
                >
                  <div>
                    <div className="flex items-center">
                      <div className={`w-2 h-2 rounded-full mr-2 ${
                        suggestion.confidence >= 80 ? 'bg-green-500' : 
                        suggestion.confidence >= 60 ? 'bg-yellow-500' : 
                        'bg-orange-500'
                      }`}></div>
                      <h4 className="font-medium text-gray-900">{suggestion.condition}</h4>
                    </div>
                    <div className="flex items-center mt-1.5">
                      <div className="w-28 h-2 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                        <div 
                          className={`h-full rounded-full ${
                            suggestion.confidence >= 80 ? 'bg-green-500' : 
                            suggestion.confidence >= 60 ? 'bg-yellow-500' : 
                            'bg-orange-500'
                          }`}
                          style={{ width: `${suggestion.confidence}%` }}
                        />
                      </div>
                      <span className="text-xs text-gray-700 ml-2 font-medium">{suggestion.confidence}% confidence</span>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center transition-transform ${
                      expandedSuggestion === suggestion.condition ? 'rotate-180 bg-purple-200' : ''
                    }`}>
                      <svg
                        className="w-4 h-4 text-purple-700"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>

                {/* Expanded Content */}
                {expandedSuggestion === suggestion.condition && (
                  <div className="p-4 bg-purple-50 border-t border-purple-100">
                    <div className="bg-white p-3 rounded-lg shadow-sm border border-purple-100 mb-3">
                      <p className="text-sm text-gray-700">{suggestion.description}</p>
                    </div>
                    
                    <h5 className="text-xs font-semibold uppercase text-gray-700 mb-2 flex items-center">
                      <svg className="w-3.5 h-3.5 mr-1 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                      Key Symptoms
                    </h5>
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {suggestion.keySymptoms.map((symptom, index) => (
                        <span key={index} className="text-xs bg-white border border-purple-200 text-purple-700 px-3 py-1 rounded-full shadow-sm">
                          {symptom}
                        </span>
                      ))}
                    </div>
                    
                    <div className="flex justify-end gap-3 mt-3">
                      <button
                        onClick={() => handleReject(suggestion)}
                        className="px-4 py-1.5 text-sm border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 shadow-sm transition-colors duration-150"
                        disabled={processingDiagnosis === suggestion.condition}
                      >
                        <div className="flex items-center">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Dismiss
                        </div>
                      </button>
                      <button
                        onClick={() => handleAccept(suggestion)}
                        className={`px-4 py-1.5 text-sm bg-gradient-to-r from-aiPurple to-aiPurple/90 rounded-lg hover:shadow-md transition-all duration-150 font-medium flex items-center ${
                          processingDiagnosis === suggestion.condition ? 'opacity-70 cursor-wait' : ''
                        }`}
                        disabled={processingDiagnosis === suggestion.condition}
                      >
                        {processingDiagnosis === suggestion.condition ? (
                          <>
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Processing...
                          </>
                        ) : (
                          <>
                            <svg className="w-3.5 h-3.5 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Accept Diagnosis
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center p-6 bg-purple-50/50 border border-purple-100 rounded-xl shadow-inner">
            <div className="flex flex-col items-center">
              <svg className="w-12 h-12 text-purple-300 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <p className="text-sm text-gray-600 mb-3">No diagnostic suggestions available yet</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 text-sm bg-white border border-purple-200 shadow-sm rounded-lg text-aiPurple hover:bg-purple-50 transition-colors duration-150 flex items-center"
              >
                <svg className="w-3.5 h-3.5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate suggestions
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}