import React, { useEffect, useState } from 'react';
import ehrService from '../../services/ehrService';

// Helper functions for document formatting
const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date) 
        ? date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
        : dateString;
};

const formatFileSize = (sizeInBytes) => {
    if (!sizeInBytes) return '';
    const kb = sizeInBytes / 1024;
    if (kb < 1024) return `${Math.round(kb * 10) / 10} KB`;
    const mb = kb / 1024;
    return `${Math.round(mb * 10) / 10} MB`;
};

const getDocTypeFromUrl = (url) => {
    if (!url) return 'document';
    const extension = url.split('.').pop().toLowerCase();
    
    switch (extension) {
        case 'pdf': return 'PDF';
        case 'doc':
        case 'docx': return 'DOC';
        case 'xls':
        case 'xlsx': return 'EXCEL';
        case 'jpg':
        case 'jpeg':
        case 'png': return 'IMAGE';
        default: return 'document';
    }
};

const getTypeColorClass = (type) => {
    if (!type) return 'bg-gray-100 text-gray-800';
    
    const lowerType = type.toLowerCase();
    if (lowerType.includes('pdf')) return 'bg-red-100 text-red-800';
    if (lowerType.includes('doc')) return 'bg-blue-100 text-blue-800';
    if (lowerType.includes('excel') || lowerType.includes('xls')) return 'bg-green-100 text-green-800';
    if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) return 'bg-purple-100 text-purple-800';
    if (lowerType.includes('lab') || lowerType.includes('result')) return 'bg-yellow-100 text-yellow-800';
    if (lowerType.includes('prescription')) return 'bg-indigo-100 text-indigo-800';
    
    return 'bg-gray-100 text-gray-800';
};

const getDocumentIcon = (type) => {
    let icon;
    const lowerType = (type || '').toLowerCase();
    
    if (lowerType.includes('pdf')) {
        icon = (
            <svg className="h-5 w-5 text-red-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7 18H17V16H7V18M17 14H7V12H17V14M7 10H11V8H7V10M22 4V20C22 21.1 21.1 22 20 22H4C2.9 22 2 21.1 2 20V4C2 2.9 2.9 2 4 2H20C21.1 2 22 2.9 22 4M20 4H4V20H20V4Z" />
            </svg>
        );
    } else if (lowerType.includes('doc')) {
        icon = (
            <svg className="h-5 w-5 text-blue-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M9,13H15V15H9V13M9,9H13V11H9V9M9,17H15V19H9V17Z" />
            </svg>
        );
    } else if (lowerType.includes('excel') || lowerType.includes('xls')) {
        icon = (
            <svg className="h-5 w-5 text-green-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20M10,13H8V11H10V13M14,13H16V11H14V13M14,16H16V18H14V16M10,16H8V18H10V16Z" />
            </svg>
        );
    } else if (lowerType.includes('image') || lowerType.includes('jpg') || lowerType.includes('png')) {
        icon = (
            <svg className="h-5 w-5 text-purple-500" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 5V19H5V5H19M21 3H3V21H21V3M8.5 14L10 16.5L12.5 12L16 17H8L8.5 14Z" />
            </svg>
        );
    } else {
        icon = (
            <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
        );
    }
    
    return icon;
};

const PatientDocuments = ({ documentsUrl, sessionToken }) => {
    // console.log('PatientDocuments component initialized with documentsUrl:', documentsUrl);
    const [documents, setDocuments] = useState([]);
    const [patientInfo, setPatientInfo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    
    // Function to handle document download
    const handleDownload = async (doc) => {
        const url = doc.fileUrl || doc.url;
        if (!url) return;
        
        try {
            // Create a temporary link element
            const link = document.createElement('a');
            link.href = url;
            
            // Get filename from URL or use document title
            let filename = doc.title || doc.name || 'document';
            if (url.includes('/')) {
                const urlParts = url.split('/');
                const urlFilename = urlParts[urlParts.length - 1];
                if (urlFilename.includes('.')) {
                    filename = urlFilename;
                } else {
                    // Add extension based on type if not in URL
                    const docType = doc.type?.toLowerCase() || '';
                    if (docType.includes('pdf')) filename += '.pdf';
                    else if (docType.includes('doc')) filename += '.docx';
                    else if (docType.includes('excel')) filename += '.xlsx';
                    else if (docType.includes('image')) filename += '.jpg';
                }
            }
            
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Error downloading document:", error);
            // Fallback - open in new tab
            window.open(url, '_blank');
        }
    };

    const fetchDocuments = async () => {
        if (!documentsUrl) return;
        
        setLoading(true);
        setError(null);
        try {
            console.log('Fetching documents from API');
                
            const response = await ehrService.getPatientDocuments(documentsUrl);
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
        } catch (err) {
            console.error("Error fetching documents:", err);
            setError(err.message || "Failed to load documents");
            setDocuments([]);
        } finally {
            setLoading(false);
        }
    };

    // No filtering logic needed

    // Fetch documents when URL changes
    useEffect(() => {
        if (documentsUrl) {
            fetchDocuments();
        }
    }, [documentsUrl]);

    return (
        <div className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-200">
            <div className="bg-gradient-to-r from-doctorTeal to-doctorTeal/90 px-4 py-3 flex justify-between items-center">
                <h3 className="text-lg font-bold text-black">Documents</h3>
                <span className="text-sm bg-white/60 px-2 py-0.5 rounded text-black">
                    {documents.length} {documents.length === 1 ? 'document' : 'documents'}
                </span>
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
                                {getDocumentIcon(doc.type || getDocTypeFromUrl(doc.fileUrl || doc.url))}
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-sm font-medium text-gray-900">{doc.title || doc.description || doc.name || "Untitled Document"}</h4>
                                <div className="flex flex-wrap text-xs text-gray-500 mt-0.5">
                                    <span>{formatDate(doc.date || doc.created_at)}</span>
                                    {doc.type && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span className={`px-1.5 py-0.5 rounded ${getTypeColorClass(doc.type)}`}>
                                                {doc.type}
                                            </span>
                                        </>
                                    )}
                                    {doc.size && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <span>{formatFileSize(doc.size)}</span>
                                        </>
                                    )}
                                </div>
                                <div className="text-xs text-gray-500">
                                    {doc.provider || doc.uploaded_by || "Unknown source"}
                                    {doc.description && (
                                        <p className="mt-1 text-gray-600 italic">{doc.description}</p>
                                    )}
                                </div>
                            </div>
                            <div className="flex-shrink-0 flex space-x-2">
                                <button 
                                    className="text-blue-600 hover:text-blue-800 p-1 rounded hover:bg-blue-50" 
                                    onClick={() => window.open(doc.fileUrl || doc.url, '_blank')}
                                    disabled={!doc.fileUrl && !doc.url}
                                    title="Open document">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                    </svg>
                                </button>
                                <button 
                                    className="text-gray-600 hover:text-gray-800 p-1 rounded hover:bg-gray-50" 
                                    onClick={() => handleDownload(doc)}
                                    disabled={!doc.fileUrl && !doc.url}
                                    title="Download document">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                    </svg>
                                </button>
                            </div>
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
