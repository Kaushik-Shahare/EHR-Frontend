'use client';

import React, { use, useState, useEffect } from 'react';
import MainLayout from '../../../components/MainLayout';
import QuickActions from '../../../components/patient/QuickActions';
import NFCInterface from '../../../components/patient/NFCInterface';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import patientService from '@/services/patientService';
import { uploadDocument, uploadDocumentToVisit, addPrescription, addLabResult, addDiagnosis, addVitalSigns, getPatientDocuments, getVisitPrescriptions, getVisitLabResults, getVisitDocuments, getVisitDiagnoses, getVisitVitalSigns } from '@/services/apiService';

export default function PatientDetailPage({ params }) {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  
  // Unwrap params using React.use() for Next.js 15 compatibility
  const resolvedParams = use(params);
  const patientId = resolvedParams?.id;
  
  // State management
  const [patientData, setPatientData] = useState(null);
  const [visits, setVisits] = useState([]);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current-visit');
  const [visitDetails, setVisitDetails] = useState({}); // Store details for each visit
  const [allVisits, setAllVisits] = useState([]); // Complete visit history
  const [allPrescriptions, setAllPrescriptions] = useState([]); // All prescriptions
  const [allLabResults, setAllLabResults] = useState([]); // All lab results
  
  // Visit management 
  const [currentVisit, setCurrentVisit] = useState(null);
  
  // NFC Session management
  const [nfcSessionId, setNfcSessionId] = useState(null);
  const [sessionExpiry, setSessionExpiry] = useState(null);
  const [showNfcInterface, setShowNfcInterface] = useState(false);
  const [sessionData, setSessionData] = useState(null);
  
  // Legacy NFC states (keeping for compatibility)
  const [showNfcPrompt, setShowNfcPrompt] = useState(false);
  const [nfcCardId, setNfcCardId] = useState('');
  const [nfcLoading, setNfcLoading] = useState(false);

  // Authentication check
  useEffect(() => {
    // Don't redirect if auth is still loading
    if (authLoading) {
      return;
    }
    
    if (!isAuthenticated) {
      // Store the current URL so we can redirect back after login
      if (typeof window !== 'undefined') {
        const currentPath = window.location.pathname;
        localStorage.setItem('redirectAfterLogin', currentPath);
      }
      router.push('/login');
      return;
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch patient data
  useEffect(() => {
    const fetchPatientData = async () => {
      console.log('fetchPatientData called:', { patientId, isAuthenticated, authLoading });
      
      if (authLoading || !patientId || !isAuthenticated) {
        console.log('Skipping data fetch:', { patientId, isAuthenticated, authLoading });
        return;
      }
      
      try {
        setLoading(true);
        setError(null);
        console.log('Fetching patient data for ID:', patientId);

        // Fetch patient details using our new comprehensive API
        const response = await patientService.getPatientById(patientId);
        console.log('Patient data received:', response);
        
        // The API now returns directly: { patient, recent_visits, document_count }
        setPatientData(response.patient);
        
        // Check for stored NFC session for this patient
        if (response.patient?.email) {
          const hasValidSession = checkStoredSession(response.patient.email);
          if (hasValidSession) {
            console.log('Valid NFC session found, will show visit details');
          }
        }
        
        // Always set basic visit data (limited without NFC session)
        setVisits(response.recent_visits || []);
        
        console.log('Current user:', user);
        console.log('Patient response:', response);
        
        // Fetch actual documents instead of just count (for doctors)
        if (user?.user_type === 'Doctor' && response.patient?.id) {
          console.log('Doctor detected, fetching documents for patient:', response.patient.id);
          console.log('Using session token:', nfcSessionId);
          try {
            const documentsResponse = await getPatientDocuments(response.patient.id, nfcSessionId);
            console.log('Documents API response:', documentsResponse);
            const docs = documentsResponse.results || documentsResponse || [];
            console.log('Processed documents:', docs);
            console.log('Setting documents as array:', Array.isArray(docs));
            setDocuments(docs);
          } catch (docError) {
            console.error('Error fetching patient documents:', docError);
            // Fallback to count if available
            setDocuments(response.document_count ? [{ count: response.document_count }] : []);
          }
        } else {
          console.log('Non-doctor user or no patient ID, showing count only');
          console.log('User type:', user?.user_type);
          console.log('Patient ID:', response.patient?.id);
          // For non-doctors, just show count
          setDocuments(response.document_count ? [{ count: response.document_count }] : []);
        }

      } catch (err) {
        console.error('Error fetching patient data:', err);
        setError('Failed to load patient information. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPatientData();
  }, [patientId, isAuthenticated, authLoading, user]);

  // Separate function to fetch patient data (can be called after NFC tap)
  const fetchPatientData = async (sessionToken = null) => {
    if (!patientId || !isAuthenticated) return;
    
    // Use provided session token or the current state
    const currentSession = sessionToken || nfcSessionId;
    
    try {
      setLoading(true);
      const response = await patientService.getPatientById(patientId);
      setPatientData(response.patient);
      setVisits(response.recent_visits || []);
      
      // Auto-select the most recent visit if we have an NFC session and no current visit selected
      if (currentSession && !currentVisit && response.recent_visits?.length > 0) {
        console.log('Auto-selecting most recent visit:', response.recent_visits[0]);
        setCurrentVisit(response.recent_visits[0]);
      }
      
      // Fetch actual documents for doctors
      if (user?.user_type === 'Doctor' && response.patient?.id) {
        console.log('Separate fetch: Doctor detected, fetching documents for patient:', response.patient.id);
        console.log('Separate fetch: Using session token:', currentSession);
        try {
          const documentsResponse = await getPatientDocuments(response.patient.id, currentSession);
          console.log('Separate fetch: Documents API response:', documentsResponse);
          const docs = documentsResponse.results || documentsResponse || [];
          console.log('Separate fetch: Processed documents:', docs);
          setDocuments(docs);
        } catch (docError) {
          console.error('Separate fetch: Error fetching patient documents:', docError);
          setDocuments(response.document_count ? [{ count: response.document_count }] : []);
        }
      } else {
        console.log('Separate fetch: Non-doctor user or no patient ID, showing count only');
        setDocuments(response.document_count ? [{ count: response.document_count }] : []);
      }
    } catch (err) {
      console.error('Error fetching patient data:', err);
      setError('Failed to load patient information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // NFC Session Management Functions
  const checkStoredSession = (patientEmail) => {
    const sessionKey = `patient-${patientEmail}-session`;
    const storedData = localStorage.getItem(sessionKey);
    
    if (storedData) {
      const { sessionId, expiresAt } = JSON.parse(storedData);
      const now = new Date();
      const expiry = new Date(expiresAt);
      
      if (now < expiry) {
        setNfcSessionId(sessionId);
        setSessionExpiry(expiry);
        return true;
      } else {
        // Session expired, remove it
        localStorage.removeItem(sessionKey);
      }
    }
    return false;
  };

  const storeSession = (patientEmail, sessionId, expiresAt) => {
    const sessionKey = `patient-${patientEmail}-session`;
    const sessionData = { sessionId, expiresAt };
    localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    setNfcSessionId(sessionId);
    setSessionExpiry(new Date(expiresAt));
  };

  const handleNfcTap = async () => {
    if (!nfcCardId.trim()) {
      alert('Please enter NFC Card ID');
      return;
    }

    setNfcLoading(true);
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
        const patientEmail = session.patient.email;
        
        // Store the session
        storeSession(patientEmail, session.session_token, session.expires_at);
        
        setShowNfcPrompt(false);
        setNfcCardId('');
        
        // Reload patient data with access to visits
        fetchPatientData();
        
      } else {
        alert(data.message || 'Failed to tap NFC card');
      }
    } catch (error) {
      console.error('NFC Tap Error:', error);
      alert('Failed to tap NFC card. Please try again.');
    } finally {
      setNfcLoading(false);
    }
  };

  const isSessionExpired = () => {
    if (!sessionExpiry) return true;
    return new Date() >= sessionExpiry;
  };

  const requestNfcAccess = () => {
    setShowNfcInterface(true);
  };

  // NFC Interface handlers
  const handleSessionCreated = (session) => {
    setSessionData(session);
    setNfcSessionId(session.session_token);
    setSessionExpiry(new Date(session.expires_at));
    
    // Store session for future use
    if (patientData?.email) {
      const sessionKey = `patient-${patientData.email}-session`;
      const sessionData = { sessionId: session.session_token, expiresAt: session.expires_at };
      localStorage.setItem(sessionKey, JSON.stringify(sessionData));
    }
    
    // Re-fetch patient data including documents with the new session
    fetchPatientData(session.session_token);
    
    // Auto-select the most recent visit if available
    if (visits.length > 0) {
      console.log('Auto-selecting most recent visit:', visits[0]);
      setCurrentVisit(visits[0]);
    }
  };

  const handleVisitSelected = (visit) => {
    setCurrentVisit(visit);
    // Refresh patient data to get updated visit information (using current session)
    fetchPatientData();
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      'checked_in': { color: 'bg-blue-100 text-blue-800', label: 'Checked In' },
      'in_consultation': { color: 'bg-yellow-100 text-yellow-800', label: 'In Consultation' },
      'ready_for_checkout': { color: 'bg-green-100 text-green-800', label: 'Ready for Checkout' },
      'completed': { color: 'bg-gray-100 text-gray-800', label: 'Completed' },
      'cancelled': { color: 'bg-red-100 text-red-800', label: 'Cancelled' }
    };
    
    const config = statusConfig[status] || { color: 'bg-gray-100 text-gray-800', label: status };
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.label}
      </span>
    );
  };

  // Handler functions for QuickActions
  const handleAddDocument = async (formData) => {
    try {
      console.log('=== Document Upload Debug ===');
      console.log('NFC Session ID:', nfcSessionId);
      console.log('Current Visit:', currentVisit);
      console.log('Current Visit ID:', currentVisit?.id);
      console.log('Available Visits:', visits);
      
      if (!nfcSessionId) {
        console.log('No NFC session - showing NFC interface');
        setShowNfcInterface(true);
        return false;
      }
      
      if (!currentVisit) {
        console.log('No current visit selected');
        if (visits.length === 0) {
          alert('No visits available. Please create a visit first or contact the administrator.');
          return false;
        } else {
          // Auto-select first visit
          console.log('Auto-selecting first available visit:', visits[0]);
          setCurrentVisit(visits[0]);
          alert('Visit auto-selected. Please try uploading the document again.');
          return false;
        }
      }

      // Use visit-specific upload endpoint
      // The session token is handled via Authorization header by the api service
      // No need to append visit_id since it's in the URL path
      // We might need to append session_token to form data based on backend requirements
      formData.append('session_token', nfcSessionId);

      console.log('Uploading document to visit:', currentVisit.id);
      console.log('Using session token:', nfcSessionId);
      
      await uploadDocumentToVisit(currentVisit.id, formData);
      
      alert('Document uploaded successfully');
      fetchPatientData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error adding document:', error);
      console.error('Full error details:', JSON.stringify(error, null, 2));
      
      // More specific error handling
      if (error.message?.includes('404') || error.message?.includes('No PatientVisit matches')) {
        alert('Visit not found. The selected visit may no longer exist. Please refresh the page and try again.');
      } else {
        alert(error.message || 'Failed to upload document');
      }
      return false;
    }
  };

  const handleAddPrescription = async (prescriptionData) => {
    try {
      if (!nfcSessionId || !currentVisit) {
        setShowNfcInterface(true);
        return false;
      }

      // Add session token and visit ID
      const prescriptionPayload = {
        ...prescriptionData,
        session_token: nfcSessionId,
        visit: currentVisit.id,
        medication: prescriptionData.medication_name, // Map field name
        dosage: prescriptionData.dosage,
        instructions: prescriptionData.instructions
      };

      await addPrescription(prescriptionPayload);
      
      alert('Prescription added successfully');
      fetchPatientData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error adding prescription:', error);
      alert(error.message || 'Failed to add prescription');
      return false;
    }
  };

  const handleAddLabResult = async (labData) => {
    try {
      if (!nfcSessionId || !currentVisit) {
        setShowNfcInterface(true);
        return false;
      }

      // Add session token and visit ID
      const labPayload = {
        ...labData,
        session_token: nfcSessionId,
        visit: currentVisit.id,
        test_name: labData.test_name,
        result: labData.result,
        reference_range: labData.normal_range || '', // Map field name
        units: labData.units || ''
      };

      await addLabResult(labPayload);
      
      alert('Lab result added successfully');
      fetchPatientData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error adding lab result:', error);
      alert(error.message || 'Failed to add lab result');
      return false;
    }
  };

  const handleAddNotes = async (noteData) => {
    try {
      if (!nfcSessionId || !currentVisit) {
        setShowNfcInterface(true);
        return false;
      }

      // For now, we'll add the note as a diagnosis entry since the backend supports this
      const notePayload = {
        session_token: nfcSessionId,
        visit: currentVisit.id,
        condition: noteData.title || 'Clinical Notes',
        diagnosis_code: 'Z51.89', // General counseling and medical advice code
        notes: noteData.content,
        severity: 'low'
      };

      await addDiagnosis(notePayload);
      
      alert('Notes added successfully');
      fetchPatientData(); // Reload data
      return true;
    } catch (error) {
      console.error('Error adding notes:', error);
      alert(error.message || 'Failed to add notes');
      return false;
    }
  };

  // Fetch details for a specific visit (documents, prescriptions, lab results)
  const fetchVisitDetails = async (visitId) => {
    if (visitDetails[visitId]) return; // Already loaded
    
    try {
      console.log('Fetching visit details for visit:', visitId, 'with session:', nfcSessionId);
      
      const [documents, prescriptions, labResults, diagnoses, vitalSigns] = await Promise.allSettled([
        getVisitDocuments(visitId, nfcSessionId),
        getVisitPrescriptions(visitId),
        getVisitLabResults(visitId),
        getVisitDiagnoses(visitId),
        getVisitVitalSigns(visitId)
      ]);

      console.log('Visit details fetched:', {
        documents: documents.status === 'fulfilled' ? documents.value : documents.reason,
        prescriptions: prescriptions.status === 'fulfilled' ? prescriptions.value : prescriptions.reason,
        labResults: labResults.status === 'fulfilled' ? labResults.value : labResults.reason,
        diagnoses: diagnoses.status === 'fulfilled' ? diagnoses.value : diagnoses.reason,
        vitalSigns: vitalSigns.status === 'fulfilled' ? vitalSigns.value : vitalSigns.reason
      });

      setVisitDetails(prev => ({
        ...prev,
        [visitId]: {
          documents: documents.status === 'fulfilled' ? (documents.value.data || documents.value.results || documents.value || []) : [],
          prescriptions: prescriptions.status === 'fulfilled' ? (prescriptions.value.data || prescriptions.value.results || prescriptions.value || []) : [],
          labResults: labResults.status === 'fulfilled' ? (labResults.value.data || labResults.value.results || labResults.value || []) : [],
          diagnoses: diagnoses.status === 'fulfilled' ? (diagnoses.value.data || diagnoses.value.results || diagnoses.value || []) : [],
          vitalSigns: vitalSigns.status === 'fulfilled' ? (vitalSigns.value.data || vitalSigns.value.results || vitalSigns.value || []) : []
        }
      }));
    } catch (error) {
      console.error('Error fetching visit details:', error);
      // Set empty data on error so the UI doesn't keep trying to load
      setVisitDetails(prev => ({
        ...prev,
        [visitId]: {
          documents: [],
          prescriptions: [],
          labResults: [],
          diagnoses: [],
          vitalSigns: []
        }
      }));
    }
  };

  // Fetch complete patient history (all visits, prescriptions, lab results)
  const fetchCompleteHistory = async () => {
    if (!user?.user_type === 'Doctor' && !user?.user_type === 'Admin') return;
    
    try {
      // Use the existing visits from the patient data since getMyPatients() doesn't return visits
      // We already have recent visits, let's use those for now
      const patientVisits = visits || [];
      console.log('Using existing visits for history:', patientVisits);
      setAllVisits(patientVisits);

      // If no visits available, we can't fetch historical data
      if (patientVisits.length === 0) {
        console.log('No visits available for history');
        setAllPrescriptions([]);
        setAllLabResults([]);
        return;
      }

      // Fetch all documents, prescriptions, and lab results for this patient
      if (patientData?.id) {
        console.log('Fetching complete history for patient:', patientData.id);
        
        // Fetch documents for the patient
        try {
          const documentsRes = await getPatientDocuments(patientData.id);
          console.log('History documents:', documentsRes);
          // Update documents with complete list
          setDocuments(documentsRes.results || documentsRes || []);
        } catch (docError) {
          console.error('Error fetching documents for history:', docError);
        }

        // Fetch prescriptions and lab results for each visit
        let allPrescriptions = [];
        let allLabResults = [];
        
        for (const visit of patientVisits) {
          try {
            console.log('Fetching data for visit:', visit.id);
            const [visitPrescriptions, visitLabResults] = await Promise.allSettled([
              getVisitPrescriptions(visit.id),
              getVisitLabResults(visit.id)
            ]);

            if (visitPrescriptions.status === 'fulfilled') {
              const prescriptions = visitPrescriptions.value.results || visitPrescriptions.value || [];
              allPrescriptions = [...allPrescriptions, ...prescriptions];
            }

            if (visitLabResults.status === 'fulfilled') {
              const labResults = visitLabResults.value.results || visitLabResults.value || [];
              allLabResults = [...allLabResults, ...labResults];
            }
          } catch (error) {
            console.error(`Error fetching data for visit ${visit.id}:`, error);
          }
        }

        console.log('Complete history - Prescriptions:', allPrescriptions);
        console.log('Complete history - Lab Results:', allLabResults);
        
        setAllPrescriptions(allPrescriptions);
        setAllLabResults(allLabResults);
      }
    } catch (error) {
      console.error('Error fetching complete history:', error);
    }
  };

  if (loading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading patient information...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  // Show loading screen while authentication is being checked
  if (authLoading) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Checking authentication...</p>
          </div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Patient</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => router.back()}
                  className="mr-4 p-2 rounded-md text-gray-400 hover:text-gray-500"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <h1 className="text-2xl font-bold text-gray-900">
                  {patientData?.profile?.name || `Patient ${patientId}`}
                </h1>
              </div>
              <div className="text-sm text-gray-500">
                Patient ID: {patientId}
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Patient Overview Card */}
          <div className="bg-white rounded-lg shadow-sm border mb-6">
            <div className="p-6">
              <div className="flex items-start space-x-6">
                <div className="h-20 w-20 bg-gray-300 rounded-full flex items-center justify-center">
                  <span className="text-2xl font-medium text-gray-700">
                    {patientData?.profile?.name?.charAt(0) || 'P'}
                  </span>
                </div>
                <div className="flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Full Name</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {patientData?.profile?.name || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {patientData?.email || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {patientData?.profile?.phone_number || 'Not provided'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Date of Birth</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {formatDate(patientData?.profile?.date_of_birth)}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Gender</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {patientData?.profile?.gender || 'Not specified'}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Blood Group</h3>
                      <p className="mt-1 text-sm text-gray-900">
                        {patientData?.profile?.blood_group || 'Not specified'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8 px-6">
                {['current-visit', 'visit-history'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-1 border-b-2 font-medium text-sm capitalize ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab === 'current-visit' ? 'Current Visit' : 'Visit History'}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {/* Current Visit Tab */}
              {activeTab === 'current-visit' && (
                <div>
                  {/* NFC Session Status */}
                  <div className="mb-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900">
                        {currentVisit ? `Visit #${currentVisit.visit_number?.substring(0, 8)}...` : 'No Visit Selected'}
                      </h3>
                      
                      <div className="flex items-center space-x-4">
                        {nfcSessionId && !isSessionExpired() ? (
                          <div className="flex items-center text-green-600 text-sm">
                            <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                            NFC Access Active (expires {formatDateTime(sessionExpiry)})
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowNfcInterface(true)}
                            className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                          >
                            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            Tap NFC for Visit Access
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {currentVisit ? (
                    <div className="space-y-6">
                      {/* Visit Overview */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                          <div>
                            <span className="text-sm text-gray-600">Date & Time</span>
                            <p className="font-medium text-gray-900">{formatDateTime(currentVisit.check_in_time)}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Visit Type</span>
                            <p className="font-medium text-gray-900 capitalize">{currentVisit.visit_type?.replace('_', ' ')}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Attending Doctor</span>
                            <p className="font-medium text-gray-900">{currentVisit.attending_doctor || 'Not assigned'}</p>
                          </div>
                          <div>
                            <span className="text-sm text-gray-600">Status</span>
                            <div className="mt-1">{getStatusBadge(currentVisit.status)}</div>
                          </div>
                        </div>
                      </div>

                      {/* Patient Overview */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <h4 className="font-medium text-gray-900 mb-3">Patient Information</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <span className="text-gray-500">Blood Group:</span>
                            <p className="font-medium">{patientData?.profile?.blood_group || 'Not specified'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Allergies:</span>
                            <p className="font-medium">{patientData?.profile?.allergies?.length > 0 ? patientData.profile.allergies.join(', ') : 'None recorded'}</p>
                          </div>
                          <div>
                            <span className="text-gray-500">Chronic Conditions:</span>
                            <p className="font-medium">{patientData?.profile?.chronic_conditions?.length > 0 ? patientData.profile.chronic_conditions.join(', ') : 'None recorded'}</p>
                          </div>
                        </div>
                      </div>

                      {/* Visit Details - Documents, Lab Results, etc. */}
                      {nfcSessionId && !isSessionExpired() && visitDetails[currentVisit.id] && (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                          {/* Documents */}
                          {visitDetails[currentVisit.id].documents?.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Documents ({visitDetails[currentVisit.id].documents.length})
                              </h5>
                              <div className="space-y-3">
                                {visitDetails[currentVisit.id].documents.map((doc, idx) => (
                                  <div key={idx} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border">
                                    <div className="flex-1">
                                      <div className="font-medium text-gray-900">
                                        {doc.document_type?.replace('_', ' ').toUpperCase() || 'Document'}
                                      </div>
                                      <div className="text-sm text-gray-600">{doc.description || 'No description'}</div>
                                      <div className="text-xs text-gray-500">{formatDateTime(doc.uploaded_at)}</div>
                                    </div>
                                    <div className="flex space-x-2">
                                      {doc.file && (
                                        <>
                                          <button
                                            onClick={() => window.open(doc.file, '_blank')}
                                            className="px-3 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                                          >
                                            Preview
                                          </button>
                                          <a 
                                            href={doc.file} 
                                            download
                                            className="px-3 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                                          >
                                            Download
                                          </a>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Lab Results */}
                          {visitDetails[currentVisit.id].labResults?.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                </svg>
                                Lab Results ({visitDetails[currentVisit.id].labResults.length})
                              </h5>
                              <div className="space-y-3">
                                {visitDetails[currentVisit.id].labResults.map((lab, idx) => (
                                  <div key={idx} className="p-3 bg-green-50 rounded-lg border">
                                    <div className="font-medium text-gray-900">{lab.test_name}</div>
                                    <div className="text-sm text-gray-600">
                                      Result: <span className="font-medium">{lab.result} {lab.units}</span>
                                    </div>
                                    {lab.reference_range && (
                                      <div className="text-xs text-gray-500">Normal Range: {lab.reference_range}</div>
                                    )}
                                    <div className="text-xs text-gray-500">{formatDate(lab.test_date)}</div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Prescriptions */}
                          {visitDetails[currentVisit.id].prescriptions?.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                </svg>
                                Prescriptions ({visitDetails[currentVisit.id].prescriptions.length})
                              </h5>
                              <div className="space-y-3">
                                {visitDetails[currentVisit.id].prescriptions.map((rx, idx) => (
                                  <div key={idx} className="p-3 bg-purple-50 rounded-lg border">
                                    <div className="font-medium text-gray-900">{rx.medication_name}</div>
                                    <div className="text-sm text-gray-600">
                                      {rx.dosage} - {rx.frequency} for {rx.duration}
                                    </div>
                                    {rx.instructions && (
                                      <div className="text-xs text-gray-500 mt-1">{rx.instructions}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Diagnoses */}
                          {visitDetails[currentVisit.id].diagnoses?.length > 0 && (
                            <div className="bg-white border border-gray-200 rounded-lg p-4">
                              <h5 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                                <svg className="w-5 h-5 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                </svg>
                                Diagnoses ({visitDetails[currentVisit.id].diagnoses.length})
                              </h5>
                              <div className="space-y-3">
                                {visitDetails[currentVisit.id].diagnoses.map((diagnosis, idx) => (
                                  <div key={idx} className="p-3 bg-red-50 rounded-lg border">
                                    <div className="font-medium text-gray-900">{diagnosis.condition}</div>
                                    {diagnosis.diagnosis_code && (
                                      <div className="text-sm text-gray-600">Code: {diagnosis.diagnosis_code}</div>
                                    )}
                                    {diagnosis.notes && (
                                      <div className="text-xs text-gray-500 mt-1">{diagnosis.notes}</div>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Quick Actions for Current Visit */}
                      {nfcSessionId && !isSessionExpired() && currentVisit && (
                        <div className="border-t pt-6">
                          <h4 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h4>
                          <QuickActions
                            onAddDocument={handleAddDocument}
                            onAddPrescription={handleAddPrescription}
                            onAddLabResult={handleAddLabResult}
                            onAddNotes={handleAddNotes}
                            onRequestSession={() => setShowNfcInterface(true)}
                          />
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit Selected</h3>
                      <p className="text-gray-600 mb-4">
                        Please tap your NFC card to access patient visit information, or check the Visit History tab to view past visits.
                      </p>
                      <button
                        onClick={() => setShowNfcInterface(true)}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
                      >
                        <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        Tap NFC Card
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Visit History Tab */}
              {activeTab === 'visit-history' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-medium text-gray-900">Patient Visit History</h3>
                    
                    {/* NFC Session Status */}
                    <div className="flex items-center space-x-4">
                      {nfcSessionId && !isSessionExpired() ? (
                        <div className="flex items-center text-green-600 text-sm">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          NFC Access Active
                        </div>
                      ) : (
                        <button
                          onClick={() => setShowNfcInterface(true)}
                          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-md transition-colors"
                        >
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                          </svg>
                          Tap NFC for Full Access
                        </button>
                      )}
                    </div>
                  </div>

                  {visits.length > 0 ? (
                    <div className="space-y-4">
                      {visits.map((visit) => (
                        <div key={visit.id} className="border rounded-lg bg-white">
                          {/* Visit Summary Header */}
                          <div className="p-4 border-b border-gray-100">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">
                                Visit #{visit.visit_number?.substring(0, 8)}...
                              </h4>
                              <div className="flex items-center space-x-2">
                                {getStatusBadge(visit.status)}
                                <button 
                                  onClick={() => {
                                    if (visitDetails[visit.id]) {
                                      // Remove details to hide them
                                      const newDetails = { ...visitDetails };
                                      delete newDetails[visit.id];
                                      setVisitDetails(newDetails);
                                    } else {
                                      // Fetch details to show them
                                      fetchVisitDetails(visit.id);
                                    }
                                  }}
                                  className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                  <svg 
                                    className={`w-5 h-5 transform transition-transform ${visitDetails[visit.id] ? 'rotate-180' : ''}`} 
                                    fill="none" 
                                    stroke="currentColor" 
                                    viewBox="0 0 24 24"
                                  >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                  </svg>
                                </button>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Date:</span>
                                <p className="font-medium">{formatDateTime(visit.check_in_time)}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Type:</span>
                                <p className="font-medium capitalize">{visit.visit_type?.replace('_', ' ')}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Doctor:</span>
                                <p className="font-medium">{visit.attending_doctor || 'Not assigned'}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Amount:</span>
                                <p className="font-medium">${visit.total_amount || '0.00'}</p>
                              </div>
                            </div>

                            {currentVisit?.id !== visit.id && (
                              <div className="mt-3">
                                <button
                                  onClick={() => setCurrentVisit(visit)}
                                  className="text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 px-3 py-1 rounded transition-colors"
                                >
                                  Set as Current Visit
                                </button>
                              </div>
                            )}
                          </div>

                          {/* Expandable Visit Details */}
                          {visitDetails[visit.id] && (
                            <div className="p-4 bg-gray-50 space-y-4">
                              {/* Same detailed content as current visit tab */}
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                {/* Documents */}
                                {visitDetails[visit.id].documents?.length > 0 && (
                                  <div className="bg-white border border-gray-200 rounded p-3">
                                    <h6 className="font-medium text-gray-800 mb-2 flex items-center">
                                      <svg className="w-4 h-4 mr-1 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      Documents ({visitDetails[visit.id].documents.length})
                                    </h6>
                                    <div className="space-y-2">
                                      {visitDetails[visit.id].documents.map((doc, idx) => (
                                        <div key={idx} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                                          <div className="flex-1">
                                            <div className="font-medium">{doc.document_type?.replace('_', ' ').toUpperCase() || 'Document'}</div>
                                            <div className="text-xs text-gray-600">{doc.description || 'No description'}</div>
                                          </div>
                                          <div className="flex space-x-1">
                                            {doc.file && (
                                              <>
                                                <button
                                                  onClick={() => window.open(doc.file, '_blank')}
                                                  className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                                                >
                                                  Preview
                                                </button>
                                                <a 
                                                  href={doc.file} 
                                                  download
                                                  className="px-2 py-1 text-xs bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                  Download
                                                </a>
                                              </>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                                
                                {/* Lab Results, Prescriptions, etc. - Similar structure but more compact */}
                                {visitDetails[visit.id].labResults?.length > 0 && (
                                  <div className="bg-white border border-gray-200 rounded p-3">
                                    <h6 className="font-medium text-gray-800 mb-2 flex items-center">
                                      <svg className="w-4 h-4 mr-1 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                      </svg>
                                      Lab Results ({visitDetails[visit.id].labResults.length})
                                    </h6>
                                    <div className="space-y-2">
                                      {visitDetails[visit.id].labResults.map((lab, idx) => (
                                        <div key={idx} className="p-2 bg-green-50 rounded text-sm">
                                          <div className="font-medium">{lab.test_name}</div>
                                          <div className="text-xs text-gray-600">
                                            {lab.result} {lab.units}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}

                                {visitDetails[visit.id].prescriptions?.length > 0 && (
                                  <div className="bg-white border border-gray-200 rounded p-3">
                                    <h6 className="font-medium text-gray-800 mb-2 flex items-center">
                                      <svg className="w-4 h-4 mr-1 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                                      </svg>
                                      Prescriptions ({visitDetails[visit.id].prescriptions.length})
                                    </h6>
                                    <div className="space-y-2">
                                      {visitDetails[visit.id].prescriptions.map((rx, idx) => (
                                        <div key={idx} className="p-2 bg-purple-50 rounded text-sm">
                                          <div className="font-medium">{rx.medication_name}</div>
                                          <div className="text-xs text-gray-600">
                                            {rx.dosage} - {rx.frequency}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No Visit History</h3>
                      <p className="text-gray-600">No visits found for this patient.</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* NFC Interface Modal */}
          {showNfcInterface && (
            <NFCInterface
              isOpen={showNfcInterface}
              onClose={() => setShowNfcInterface(false)}
              onSessionCreated={handleSessionCreated}
              onVisitSelected={handleVisitSelected}
              currentPatient={patientData}
              existingSession={sessionData}
              existingVisits={visits}
            />
          )}
        </div>
      </div>

      {/* NFC Interface Modal */}
      {showNfcInterface && (
        <NFCInterface
          isOpen={showNfcInterface}
          onClose={() => setShowNfcInterface(false)}
          onSessionCreated={handleSessionCreated}
          onVisitSelected={handleVisitSelected}
          currentPatient={patientData}
          existingSession={sessionData}
          existingVisits={visits}
        />
      )}

      {/* NFC Tap Modal */}
      {showNfcPrompt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">NFC Authentication</h3>
              <button
                onClick={() => setShowNfcPrompt(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="mb-4">
              <p className="text-gray-600 mb-4">
                Enter your NFC Card ID to access detailed patient visit information.
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
              
              {sessionExpiry && isSessionExpired() && (
                <p className="text-sm text-red-600 mt-2">
                  Previous session expired at {formatDateTime(sessionExpiry)}. Please tap again.
                </p>
              )}
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={() => setShowNfcPrompt(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleNfcTap}
                disabled={nfcLoading || !nfcCardId.trim()}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white rounded-md transition-colors flex items-center justify-center"
              >
                {nfcLoading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Tapping...
                  </>
                ) : (
                  'Tap NFC Card'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  );
}