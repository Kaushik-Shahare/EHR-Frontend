'use client';

import React from 'react';

export default function AIVerificationDetails({ verification, onClose }) {
  if (!verification) return null;
  
  const getConfidenceBarColor = (score) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };
  
  const formatAnalysisKey = (key) => {
    return key
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">AI Verification Results</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className={`p-4 mb-6 rounded-md ${verification.approved ? 'bg-green-50' : 'bg-red-50'}`}>
            <div className="flex items-center">
              {verification.approved ? (
                <svg className="h-8 w-8 text-green-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="h-8 w-8 text-red-500 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <div>
                <h3 className={`text-lg font-medium ${verification.approved ? 'text-green-800' : 'text-red-800'}`}>
                  {verification.approved ? 'Verification Approved' : 'Verification Failed'}
                </h3>
                <p className={`text-sm ${verification.approved ? 'text-green-600' : 'text-red-600'}`}>
                  Confidence: {verification.confidence}%
                </p>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div 
                  className={`${getConfidenceBarColor(verification.confidence)} h-2.5 rounded-full`} 
                  style={{ width: `${verification.confidence}%` }}
                ></div>
              </div>
            </div>
          </div>
          
          {verification.analysis && Object.keys(verification.analysis).length > 0 && (
            <div>
              <h3 className="text-lg font-medium text-gray-800 mb-3">Analysis Breakdown</h3>
              
              <div className="space-y-4">
                {Object.entries(verification.analysis).map(([key, value], idx) => (
                  <div key={idx} className="border border-gray-200 rounded-md p-4">
                    <h4 className="font-medium text-gray-700 mb-2">{formatAnalysisKey(key)}</h4>
                    
                    {typeof value === 'object' ? (
                      <div className="space-y-2">
                        {Object.entries(value).map(([subKey, subValue], subIdx) => (
                          <div key={subIdx} className="grid grid-cols-3 gap-2">
                            <div className="col-span-1 text-gray-600">{formatAnalysisKey(subKey)}:</div>
                            <div className="col-span-2 text-gray-900">{
                              typeof subValue === 'boolean' 
                                ? (subValue ? 'Yes' : 'No')
                                : String(subValue)
                            }</div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-900">
                        {typeof value === 'boolean' 
                          ? (value ? 'Yes' : 'No')
                          : String(value)
                        }
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          <div className="mt-6 border-t border-gray-200 pt-4">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Recommendation</h3>
            <p className="text-gray-700">
              {verification.approved
                ? 'Based on the AI analysis, this claim meets the eligibility criteria and policy guidelines. The claim information appears to be consistent with the policy terms and patient records.'
                : 'Based on the AI analysis, this claim needs manual review. Some aspects of the claim may not align with policy guidelines or require additional verification.'}
            </p>
            
            <div className="mt-4 flex justify-end">
              <button
                onClick={onClose}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
