import axios from 'axios';
import React, { useEffect, useState } from 'react';

const PatientDocuments = ({ documentsUrl, documentsData }) => {
    console.log('PatientDocuments component initialized with documentsUrl:', documentsUrl);
    const [documents, setDocuments] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchDocuments = async () => {
        if (!documentsUrl) return;
        
        setLoading(true);
        setError(null);
        // Make sure we have the full URL with the backend base URL
        const fullUrl = `${process.env.NEXT_PUBLIC_BACKEND_URL}${documentsUrl}`;
        console.log('Fetching documents from:', fullUrl);
            
        const response = await axios.get(fullUrl);
        console.log('Documents fetched successfully:', response);
        
        // Extract documents from the nested structure in the API response
        if (response.data && response.data.data) {
            // Get documents array from the response
            const documentsList = response.data.data.documents || [];
            // Also track document count if available
            const documentCount = response.data.data.document_count || 0;
            console.log(`Retrieved ${documentCount} documents`);
            
            // Check if there's a documents_url in the response to fetch additional documents
            const responseDocumentsUrl = response.data.data.documents_url;
            if (responseDocumentsUrl && responseDocumentsUrl !== documentsUrl) {
                console.log('Found documents_url in response:', responseDocumentsUrl);
                // We could use this URL for pagination or additional document types
                // For now, we'll just log it
            }
            
            setDocuments(documentsList);
        } else {
            console.warn('Unexpected response format:', response.data);
            setDocuments([]);
        }
        setLoading(false);
    };

    useEffect(() => {
        if (documentsUrl) {
            fetchDocuments();
        }
    }, [documentsUrl]);

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">Documents</h3>
                <button className="text-sm text-black hover:underline">View All</button>
            </div>
            <div className="p-4">
                {loading ? (
                    <div className="flex justify-center py-4">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                    </div>
                ) : error ? (
                    <p className="text-red-500 py-4">{error}</p>
                ) : documents?.length > 0 ? (
                    documents.map((doc, index) => (
                        <div key={index} className={`flex items-start space-x-3 py-3 ${
                            index !== documents.length - 1 ? "border-b border-gray-200" : ""
                        }`}>
                            <div className="flex-shrink-0">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-sm font-medium text-gray-900">{doc.title || doc.name}</h4>
                                <div className="flex flex-wrap text-xs text-gray-500 mt-0.5">
                                    <span>{doc.date || doc.created_at}</span>
                                    {doc.type && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span>{doc.type}</span>
                                        </>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">{doc.provider || doc.uploaded_by}</div>
                            </div>
                            <button className="flex-shrink-0 text-blue-600 hover:text-blue-800" 
                                    onClick={() => window.open(doc.fileUrl || doc.url, '_blank')}
                                    disabled={!doc.fileUrl && !doc.url}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                            </button>
                        </div>
                    ))
                ) : (
                    <div className="py-4">
                        <p className="text-gray-600">No documents available</p>
                        {documents && documents.patient && (
                            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                <p className="font-medium text-sm">Patient: {documents.patient?.profile?.name}</p>
                                <p className="text-xs text-gray-500 mt-1">
                                    Access granted with {documents.session?.access_level || 'Limited Access'}
                                </p>
                                <p className="text-xs text-gray-500">
                                    Expires: {new Date(documents.session?.expires_at).toLocaleTimeString()}
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PatientDocuments;
