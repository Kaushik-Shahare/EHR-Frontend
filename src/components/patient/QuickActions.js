import React from 'react'

export default function QuickActions() {
  return (
    <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3">
            <h3 className="text-lg font-bold">Quick Actions</h3>
        </div>
        <div className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors">
                    <svg className="w-6 h-6 text-blue-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <span className="text-sm font-medium">New Note</span>
                </button>
                <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors">
                    <svg className="w-6 h-6 text-green-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-sm font-medium">Prescribe</span>
                </button>
                <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors">
                    <svg className="w-6 h-6 text-purple-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-sm font-medium">Upload</span>
                </button>
                <button className="flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 rounded-lg p-3 transition-colors">
                    <svg className="w-6 h-6 text-orange-600 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm font-medium">Schedule</span>
                </button>
            </div>
        </div>
    </div>
  )
}
