'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import MainLayout from '@/components/MainLayout';
import RecordList from '@/components/records/RecordList';
import profileService from '@/services/profileService';
import ehrService from '@/services/ehrService';
import documentService from '@/services/documentService';
import nfcService from '@/services/nfcService';
import patientService from '@/services/patientService';

export default function Dashboard() {
  const { user, loading, isAuthenticated, hasProfile } = useAuth();
  const router = useRouter();
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [allDocuments, setAllDocuments] = useState([]);
  const [allVisits, setAllVisits] = useState([]);
  const [visitDocuments, setVisitDocuments] = useState({});
  const [nfcSessions, setNfcSessions] = useState([]);
  const [emergencyDocs, setEmergencyDocs] = useState([]);
  const [loadingRecords, setLoadingRecords] = useState(false);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [error, setError] = useState(null);
  
  // Recent data for quick overview (keep backward compatibility)
  const [recentDocuments, setRecentDocuments] = useState([]);
  const [recentVisits, setRecentVisits] = useState([]);

  useEffect(() => {
    console.log("user from dashboard:", user);
    console.log("Dashboard render - Auth state:", { 
      isUserDefined: !!user, 
      loading, 
      isAuthenticated, 
      hasProfile,
      userObject: user
    });
    
    // Debug token status
    const token = localStorage.getItem('token') || document.cookie.includes('token');
    console.log("Token available:", !!token);

    // Wait for loading to complete
    if (loading) {
      return;
    }

    // Check authentication first
    if (!isAuthenticated) {
      console.log("Not authenticated, redirecting to login");
      router.push('/login');
      return;
    }

    // If user is not loaded yet, wait
    if (!user) {
      console.log("User data not loaded yet, waiting...");
      return;
    }

    // Handle user type routing
    const userType = typeof user.user_type === 'object' ? user.user_type?.name : user.user_type;
    
    if (userType === 'Doctor') {
      console.log("Doctor user detected, redirecting to doctor dashboard");
      router.push('/doctor');
      return;
    }
    
    // For patients and other user types, check if they need to complete profile
    if (!hasProfile) {
      console.log("User needs to complete profile, redirecting to profile page");
      router.push('/profile');
      return;
    }
    
    // If we reach here, user is authenticated, has profile, and should see dashboard
    // For Patient users or other types that should use this dashboard
    if (userType === 'Patient' || userType === 'Admin' || !userType) {
      console.log("Loading dashboard for user type:", userType);
      fetchProfile();
      fetchRecentRecords();
      fetchNfcSessions();
      fetchEmergencyDocs();
    }
  }, [loading, isAuthenticated, hasProfile, user, router]);

  const fetchProfile = async () => {
    try {
      // Only fetch profile if we have a user
      if (!user) {
        console.warn('Cannot fetch profile: User is null');
        setLoadingProfile(false);
        return;
      }
      
      setLoadingProfile(true);
      const profileData = await profileService.getProfile();
      console.log("Profile data fetched:", profileData);
      setProfile(profileData);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
      setError('Failed to load profile data. Please refresh the page.');
    } finally {
      setLoadingProfile(false);
    }
  };
  
  const fetchRecentRecords = async () => {
    try {
      if (!user) {
        console.warn('Cannot fetch records: User is null');
        setLoadingRecords(false);
        return;
      }
      
      setLoadingRecords(true);
      
      try {
        // Fetch all documents and visits in parallel
        const [documentsResponse, visitsResponse] = await Promise.all([
          documentService.getMyDocuments(),
          ehrService.getPatientVisits()
        ]);
        
        console.log("All documents fetched:", documentsResponse);
        console.log("All visits fetched:", visitsResponse);
        
        // Store all documents
        const allDocs = documentsResponse || [];
        console.log("Processed documents:", allDocs);
        setAllDocuments(allDocs);
        
        // Store all visits - handle pagination structure
        const allVisitsData = visitsResponse?.results || visitsResponse || [];
        console.log("Processed visits:", allVisitsData);
        setAllVisits(allVisitsData);
        
        // Sort documents by upload date (newest first) for recent display
        const sortedDocuments = [...allDocs]
          .sort((a, b) => new Date(b.uploaded_at) - new Date(a.uploaded_at))
          .slice(0, 5);
          
        // Sort visits by check-in time (newest first) for recent display
        const sortedVisits = [...allVisitsData]
          .sort((a, b) => new Date(b.check_in_time) - new Date(a.check_in_time))
          .slice(0, 5);
        
        setRecentDocuments(sortedDocuments);
        setRecentVisits(sortedVisits);
        
        // Fetch documents for each visit
        await fetchVisitDocuments(allVisitsData);
        
      } catch (fetchError) {
        console.error('Error in specific fetches:', fetchError);
        // Continue execution to at least show the page even if data is missing
      }
    } catch (error) {
      console.error('Failed to fetch recent records:', error);
      setError('Failed to load recent records. Please refresh the page.');
    } finally {
      setLoadingRecords(false);
    }
  };

  const fetchVisitDocuments = async (visits) => {
    try {
      const visitDocsMap = {};
      
      // Fetch documents for each visit
      await Promise.all(visits.map(async (visit) => {
        try {
          if (visit.id) {
            const visitDocs = await ehrService.getVisitDocuments(visit.id);
            visitDocsMap[visit.id] = visitDocs || [];
          }
        } catch (error) {
          console.error(`Failed to fetch documents for visit ${visit.id}:`, error);
          visitDocsMap[visit.id] = [];
        }
      }));
      
      setVisitDocuments(visitDocsMap);
      console.log("Visit documents fetched:", visitDocsMap);
    } catch (error) {
      console.error('Failed to fetch visit documents:', error);
    }
  };

  const fetchNfcSessions = async () => {
    try {
      if (!user) {
        console.warn('Cannot fetch NFC sessions: User is null');
        setLoadingSessions(false);
        return;
      }

      setLoadingSessions(true);
      
      // Fetch NFC sessions for the current user
      const sessionsResponse = await patientService.getMySessions();
      
      console.log("NFC sessions fetched:", sessionsResponse);
      
      // Handle pagination and extract results
      const sessions = sessionsResponse?.results || sessionsResponse || [];
      console.log("Processed sessions:", sessions);
      
      // Sort sessions by started_at (newest first)
      const sortedSessions = sessions
        .sort((a, b) => new Date(b.started_at) - new Date(a.started_at));
        
      setNfcSessions(sortedSessions);
    } catch (error) {
      console.error('Failed to fetch NFC sessions:', error);
      // Don't show error for NFC sessions as it's not critical
      setNfcSessions([]);
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchEmergencyDocs = async () => {
    try {
      if (!user) {
        console.warn('Cannot fetch emergency documents: User is null');
        return;
      }
      
      // Fetch emergency accessible documents
      const emergencyResponse = await documentService.getEmergencyDocuments();
      
      console.log("Emergency documents fetched:", emergencyResponse);
      
      // Handle response structure
      const emergencyDocuments = emergencyResponse?.data || emergencyResponse || [];
      console.log("Processed emergency documents:", emergencyDocuments);
      
      setEmergencyDocs(emergencyDocuments);
    } catch (error) {
      console.error('Failed to fetch emergency documents:', error);
      // Don't show error for emergency docs as it's not critical
      setEmergencyDocs([]);
    }
  };

  if (loading || loadingProfile || (loadingRecords && loadingSessions)) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will redirect in useEffect
  }
  
  const calculateAge = (dateOfBirth) => {
    if (!dateOfBirth) return null;
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }
    return age;
  };

  // Format date to readable string
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  return (
    <MainLayout title="Dashboard">
      <div className="bg-gradient-to-b from-gray-50 to-white min-h-full py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-6 bg-red-50 border-l-4 border-red-500 text-red-700 px-6 py-4 rounded-r shadow-sm" role="alert">
              <div className="flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">{error}</span>
              </div>
            </div>
          )}

          {/* Debug Information */}
          <div className="mb-6 bg-blue-50 border-l-4 border-blue-500 text-blue-700 px-6 py-4 rounded-r shadow-sm">
            <h4 className="font-semibold">Debug Info:</h4>
            <p>Documents: {allDocuments.length} | Visits: {allVisits.length} | Emergency Docs: {emergencyDocs.length} | Sessions: {nfcSessions.length}</p>
            <p>Loading: Records={loadingRecords ? 'Yes' : 'No'}, Sessions={loadingSessions ? 'Yes' : 'No'}</p>
            <p>User: {user?.id || 'No user'} | Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
            <p>Current Token: {localStorage.getItem('token') ? 'Present' : 'Missing'} | Token Length: {localStorage.getItem('token')?.length || 0}</p>
            <div className="mt-4 space-x-2">
              <button 
                onClick={() => fetchRecentRecords()} 
                className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                disabled={loadingRecords}
              >
                Reload Data
              </button>
              <button 
                onClick={() => console.log('Current state:', { allDocuments, allVisits, emergencyDocs, nfcSessions })} 
                className="bg-green-500 text-white px-3 py-1 rounded text-sm hover:bg-green-600"
              >
                Log State
              </button>
              <button 
                onClick={() => {
                  const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ0b2tlbl90eXBlIjoiYWNjZXNzIiwiZXhwIjoxNzU4OTQ2OTQ5LCJpYXQiOjE3NTg5NDMzNDksImp0aSI6ImExNjFhZWVlNjliYjQ0NDhhZTQxOGVlNTg3NTk1NzM2IiwidXNlcl9pZCI6M30.WVRVvDfHFYMtpj1uy6BFLvY5ZRTX87QWpQCN9XFGAx8';
                  localStorage.setItem('token', token);
                  console.log('Token set, reloading page...');
                  window.location.reload();
                }} 
                className="bg-orange-500 text-white px-3 py-1 rounded text-sm hover:bg-orange-600"
              >
                Set Test Token
              </button>
              <button 
                onClick={async () => {
                  try {
                    console.log('Testing API calls...');
                    const [docs, visits, emergency] = await Promise.all([
                      documentService.getMyDocuments(),
                      ehrService.getPatientVisits(),
                      documentService.getEmergencyDocuments()
                    ]);
                    console.log('API Test Results:', { docs, visits, emergency });
                    alert(`API Test: Docs=${docs?.length || 0}, Visits=${visits?.results?.length || visits?.length || 0}, Emergency=${emergency?.length || 0}`);
                  } catch (error) {
                    console.error('API Test Error:', error);
                    alert('API Test Failed: ' + error.message);
                  }
                }} 
                className="bg-purple-500 text-white px-3 py-1 rounded text-sm hover:bg-purple-600"
              >
                Test APIs
              </button>
            </div>
          </div>
          
          <div className="bg-white shadow-xl sm:rounded-xl p-8 border border-gray-100">
            <div className="flex items-center mb-8">
              <div className="h-14 w-14 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                <span className="text-blue-600 text-xl font-bold">
                  {(profile?.name || (user?.email || 'U')).charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">Welcome, {profile?.name || (user ? user.email?.split('@')[0] : '') || 'User'}!</h2>
                <p className="text-gray-500 mt-1">Here's your health dashboard overview</p>
              </div>
            </div>
            
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
                Account Details
              </h3>
              <div className="p-5 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-white rounded-md shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium mt-1">{profile?.name || 'Not provided'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-md shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium mt-1 truncate">{user?.email || 'Email not available'}</p>
                  </div>
                  <div className="p-3 bg-white rounded-md shadow-sm border border-gray-100">
                    <p className="text-sm text-gray-500">User Type</p>
                    <p className="font-medium mt-1">{user?.user_type?.name || (user?.user_type === 'Doctor' ? 'Doctor' : 'Patient')}</p>
                  </div>
                </div>
              </div>
            </div>

            {profile && (
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-700 mb-3 flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                  </svg>
                  Health Profile
                </h3>
                
                <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 shadow-sm border border-gray-200">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {profile.blood_group && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Blood Group</span>
                        <span className="text-lg font-bold mt-1">{profile.blood_group}</span>
                      </div>
                    )}
                    
                    {profile.date_of_birth && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Age</span>
                        <span className="text-lg font-bold mt-1">{calculateAge(profile.date_of_birth)} years</span>
                      </div>
                    )}
                    
                    {profile.weight_kg && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Weight</span>
                        <span className="text-lg font-bold mt-1">{profile.weight_kg} kg</span>
                      </div>
                    )}
                    
                    {profile.height_cm && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Height</span>
                        <span className="text-lg font-bold mt-1">{profile.height_cm} cm</span>
                      </div>
                    )}
                    
                    {profile.gender && (
                      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex flex-col">
                        <span className="text-sm font-medium text-gray-500">Gender</span>
                        <span className="text-lg font-bold mt-1">{profile.gender}</span>
                      </div>
                    )}
                  </div>
                  
                  {(profile.allergies && profile.allergies.length > 0) || (profile.chronic_conditions && profile.chronic_conditions.length > 0) ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      {profile.allergies && profile.allergies.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Allergies</span>
                          <div className="mt-2">
                            {profile.allergies.map((allergy, index) => (
                              <span key={index} className="inline-block bg-red-50 text-red-700 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                                {allergy}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {profile.chronic_conditions && profile.chronic_conditions.length > 0 && (
                        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                          <span className="text-sm font-medium text-gray-500">Chronic Conditions</span>
                          <div className="mt-2">
                            {profile.chronic_conditions.map((condition, index) => (
                              <span key={index} className="inline-block bg-blue-50 text-blue-700 rounded-full px-3 py-1 text-sm mr-2 mb-2">
                                {condition}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : null}

                  <div className="mt-6 flex justify-end">
                    <Link href="/profile">
                      <button className="flex items-center bg-blue-600 hover:bg-blue-700 text-black px-4 py-2 rounded-md transition duration-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-2" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                        Edit Profile
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            )}
            
            {!profile && hasProfile === false && (
              <div className="mb-8">
                <div className="bg-gradient-to-r from-yellow-50 to-amber-50 rounded-xl p-6 border-l-4 border-amber-400 shadow-md flex items-center justify-between">
                  <div className="flex items-center">
                    <div className="mr-4 bg-amber-100 rounded-full p-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <div>
                      <h4 className="font-bold text-amber-700">Profile Incomplete</h4>
                      <p className="text-amber-800">Please complete your health profile for better healthcare service.</p>
                    </div>
                  </div>
                  <Link href="/profile">
                    <button className="bg-amber-500 hover:bg-amber-600 text-black px-4 py-2 rounded-md transition duration-200 whitespace-nowrap">
                      Complete Profile
                    </button>
                  </Link>
                </div>
              </div>
            )}
            
            <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-blue-50 p-4 border-b border-blue-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-blue-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    Medical Documents
                  </h3>
                  <Link href="/records">
                    <button className="group flex items-center text-sm text-blue-600 bg-white hover:bg-blue-600 hover:text-black rounded-full px-4 py-1 font-medium transition-colors duration-200 border border-blue-200 hover:border-blue-600">
                      View All
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </Link>
                </div>
                
                <div className="h-[280px] overflow-auto">
                  {loadingRecords ? (
                    <div className="p-6 flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-500">Fetching your recent documents...</p>
                    </div>
                  ) : recentDocuments.length === 0 ? (
                    <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                      <div className="bg-blue-50 p-3 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v3m0 0v3m0-3h3m-3 0H9m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg mb-2">No documents found</p>
                      <p className="text-gray-400 text-sm">Upload your first medical document to get started</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {recentDocuments.map(doc => (
                        <li key={doc.id} className="hover:bg-blue-50 transition-colors duration-200">
                          <div className="flex items-start p-4">
                            <div className="bg-blue-100 rounded-md p-2 mr-4">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-grow">
                              <div className="flex justify-between items-start mb-1">
                                <h4 className="font-medium text-gray-900">{doc.document_type || 'Document'}</h4>
                                <a 
                                  href={doc.file} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-black p-1 rounded transition-colors duration-200 ml-2"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                  </svg>
                                </a>
                              </div>
                              <p className="text-sm text-gray-600 line-clamp-1">{doc.description}</p>
                              <p className="text-xs text-gray-400 mt-1">{formatDate(doc.uploaded_at)}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
              
              <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
                <div className="bg-green-50 p-4 border-b border-green-100 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-green-800 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    Recent Visits
                  </h3>
                  <Link href="/visits">
                    <button className="group flex items-center text-sm text-green-600 bg-white hover:bg-green-600 hover:text-black rounded-full px-4 py-1 font-medium transition-colors duration-200 border border-green-200 hover:border-green-600">
                      View All
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 transition-transform duration-200 group-hover:translate-x-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M12.293 5.293a1 1 0 011.414 0l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </Link>
                </div>
                
                <div className="h-[280px] overflow-auto">
                  {loadingRecords ? (
                    <div className="p-6 flex flex-col items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-green-500 mb-4"></div>
                      <p className="text-gray-500">Fetching your recent visits...</p>
                    </div>
                  ) : recentVisits.length === 0 ? (
                    <div className="p-6 text-center h-full flex flex-col items-center justify-center">
                      <div className="bg-green-50 p-3 rounded-full mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <p className="text-gray-500 text-lg mb-2">No visits found</p>
                      <p className="text-gray-400 text-sm">Your appointment history will appear here</p>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {recentVisits.map(visit => (
                        <li key={visit.id} className="hover:bg-green-50 transition-colors duration-200">
                          <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div className="flex items-center">
                                <div className="mr-3">
                                  <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                                    visit.status === 'completed' ? 'bg-green-100 text-green-600' : 
                                    visit.status === 'checked_in' ? 'bg-blue-100 text-blue-600' : 
                                    'bg-amber-100 text-amber-600'
                                  }`}>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                  </div>
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-900">{visit.visit_type || 'Medical Visit'}</h4>
                                  <p className="text-sm text-gray-600">{formatDate(visit.check_in_time)}</p>
                                </div>
                              </div>
                              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                visit.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                visit.status === 'checked_in' ? 'bg-blue-100 text-blue-800' : 
                                'bg-amber-100 text-amber-800'
                              }`}>
                                {visit.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 mb-2">{visit.reason_for_visit || 'No reason provided'}</p>
                            <div className="flex justify-end">
                              <Link href={`/visits/${visit.id}`}>
                                <button className="text-green-600 hover:text-black hover:bg-green-600 text-sm flex items-center border border-green-200 rounded-md px-3 py-1 transition-colors duration-200">
                                  View Details
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                  </svg>
                                </button>
                              </Link>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>
            
            {/* Comprehensive Data Sections */}
            <div className="mt-12 space-y-8">
              {/* All Documents Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-blue-100">
                  <h3 className="text-xl font-bold text-blue-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                    All Medical Documents ({allDocuments.length})
                  </h3>
                  <p className="text-blue-700 mt-1">Complete history of your medical documents and records</p>
                </div>
                
                <div className="p-6">
                  {loadingRecords ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mb-4"></div>
                      <p className="text-gray-500">Loading all documents...</p>
                    </div>
                  ) : allDocuments.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-blue-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">No Documents Yet</h4>
                      <p className="text-gray-500 mb-4">Start building your medical record by uploading your first document</p>
                      <Link href="/records/new">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg transition duration-200">
                          Upload First Document
                        </button>
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {allDocuments.map((doc) => (
                        <div key={doc.id} className="bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors duration-200 border border-gray-200">
                          <div className="flex items-start space-x-3">
                            <div className="bg-blue-100 rounded-lg p-2">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="font-semibold text-gray-900 truncate">{doc.document_type || 'Medical Document'}</h4>
                                <a 
                                  href={doc.file} 
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white p-1.5 rounded-md transition-colors duration-200 flex-shrink-0 ml-2"
                                  title="Open document"
                                >
                                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                    <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                  </svg>
                                </a>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{doc.description || 'No description available'}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(doc.uploaded_at)}</span>
                                {doc.file_size && (
                                  <span className="bg-gray-200 px-2 py-1 rounded">{doc.file_size}</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Emergency Documents Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-red-50 to-orange-50 p-6 border-b border-red-100">
                  <h3 className="text-xl font-bold text-red-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z" />
                    </svg>
                    Emergency Access Documents ({emergencyDocs.length})
                  </h3>
                  <p className="text-red-700 mt-1">Documents marked for emergency access by medical professionals</p>
                </div>
                
                <div className="p-6">
                  {emergencyDocs.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-red-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">No Emergency Documents</h4>
                      <p className="text-gray-500">No documents are currently marked for emergency access</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {emergencyDocs.map((doc) => (
                        <div key={doc.id} className="border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow duration-200 bg-red-50">
                          <div className="flex items-start space-x-3">
                            <div className="h-12 w-12 bg-red-100 rounded-lg flex items-center justify-center flex-shrink-0">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                            </div>
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold text-gray-900 truncate">{doc.document_type || 'Emergency Document'}</h4>
                                <div className="flex items-center space-x-2">
                                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                    Emergency
                                  </span>
                                  <a 
                                    href={doc.file} 
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="bg-red-50 text-red-600 hover:bg-red-600 hover:text-white p-1.5 rounded-md transition-colors duration-200 flex-shrink-0"
                                    title="Open document"
                                  >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                      <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                      <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                    </svg>
                                  </a>
                                </div>
                              </div>
                              <p className="text-sm text-gray-600 mb-2 line-clamp-2">{doc.description || 'No description available'}</p>
                              <div className="flex items-center justify-between text-xs text-gray-500">
                                <span>{formatDate(doc.uploaded_at)}</span>
                                {doc.is_approved && (
                                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">Approved</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* All Visits with Documents Section */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 border-b border-green-100">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-xl font-bold text-green-900 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                        </svg>
                        All Medical Visits ({allVisits.length})
                      </h3>
                      <p className="text-green-700 mt-1">Complete history of your medical visits with attached documents</p>
                    </div>
                    <Link 
                      href="/visits"
                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm flex items-center"
                    >
                      View All Visits
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                      </svg>
                    </Link>
                  </div>
                </div>
                
                <div className="p-6">
                  {loadingRecords ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500 mb-4"></div>
                      <p className="text-gray-500">Loading all visits...</p>
                    </div>
                  ) : allVisits.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-green-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">No Visits Yet</h4>
                      <p className="text-gray-500">Your medical visit history will appear here</p>
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {allVisits.map((visit) => (
                        <div key={visit.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow duration-200">
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start space-x-4">
                              <div className={`h-12 w-12 rounded-full flex items-center justify-center ${
                                visit.status === 'completed' ? 'bg-green-100 text-green-600' : 
                                visit.status === 'checked_in' ? 'bg-blue-100 text-blue-600' : 
                                visit.status === 'scheduled' ? 'bg-yellow-100 text-yellow-600' :
                                'bg-gray-100 text-gray-600'
                              }`}>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 002 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <div>
                                <h4 className="text-lg font-semibold text-gray-900">{visit.visit_type || 'Medical Visit'}</h4>
                                <p className="text-gray-600">{formatDate(visit.check_in_time)}</p>
                                <p className="text-sm text-gray-500 mt-1">{visit.reason_for_visit || 'No reason specified'}</p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                                visit.status === 'completed' ? 'bg-green-100 text-green-800' : 
                                visit.status === 'checked_in' ? 'bg-blue-100 text-blue-800' : 
                                visit.status === 'scheduled' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                              }`}>
                                {visit.status?.replace('_', ' ')}
                              </span>
                              <div className="mt-2">
                                <Link href={`/visits/${visit.id}`}>
                                  <button className="text-green-600 hover:text-white hover:bg-green-600 text-sm flex items-center border border-green-200 rounded-md px-3 py-1 transition-colors duration-200">
                                    View Details
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" viewBox="0 0 20 20" fill="currentColor">
                                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                                    </svg>
                                  </button>
                                </Link>
                              </div>
                            </div>
                          </div>
                          
                          {/* Visit Documents */}
                          {visitDocuments[visit.id] && visitDocuments[visit.id].length > 0 && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <h5 className="text-sm font-semibold text-gray-700 mb-3 flex items-center">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" />
                                </svg>
                                Attached Documents ({visitDocuments[visit.id].length})
                              </h5>
                              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {visitDocuments[visit.id].map((doc) => (
                                  <div key={doc.id} className="bg-gray-50 rounded-md p-3 hover:bg-gray-100 transition-colors duration-200">
                                    <div className="flex items-center space-x-2">
                                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                      </svg>
                                      <div className="flex-grow min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">{doc.name || doc.document_type || 'Document'}</p>
                                        <p className="text-xs text-gray-500">{formatDate(doc.uploaded_at || doc.created_at)}</p>
                                      </div>
                                      <a 
                                        href={doc.file} 
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-green-50 text-green-600 hover:bg-green-600 hover:text-white p-1 rounded transition-colors duration-200"
                                      >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                          <path d="M11 3a1 1 0 100 2h2.586l-6.293 6.293a1 1 0 101.414 1.414L15 6.414V9a1 1 0 102 0V4a1 1 0 00-1-1h-5z" />
                                          <path d="M5 5a2 2 0 00-2 2v8a2 2 0 002 2h8a2 2 0 002-2v-3a1 1 0 10-2 0v3H5V7h3a1 1 0 000-2H5z" />
                                        </svg>
                                      </a>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Visit Summary Info */}
                          {(visit.diagnosis || visit.treatment || visit.notes) && (
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                {visit.diagnosis && (
                                  <div>
                                    <span className="font-medium text-gray-700">Diagnosis:</span>
                                    <p className="text-gray-600 mt-1">{visit.diagnosis}</p>
                                  </div>
                                )}
                                {visit.treatment && (
                                  <div>
                                    <span className="font-medium text-gray-700">Treatment:</span>
                                    <p className="text-gray-600 mt-1">{visit.treatment}</p>
                                  </div>
                                )}
                                {visit.notes && (
                                  <div>
                                    <span className="font-medium text-gray-700">Notes:</span>
                                    <p className="text-gray-600 mt-1">{visit.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Enhanced NFC Session History */}
              <div className="bg-white rounded-xl shadow-lg border border-gray-100">
                <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-6 border-b border-purple-100">
                  <h3 className="text-xl font-bold text-purple-900 flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                    </svg>
                    NFC Session History ({nfcSessions.length})
                  </h3>
                  <p className="text-purple-700 mt-1">Complete history of NFC card access organized by visit, user, and date</p>
                </div>
                
                <div className="p-6">
                  {loadingSessions ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500 mb-4"></div>
                      <p className="text-gray-500">Loading NFC session history...</p>
                    </div>
                  ) : nfcSessions.length === 0 ? (
                    <div className="text-center py-12">
                      <div className="bg-purple-50 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <h4 className="text-xl font-semibold text-gray-800 mb-2">No NFC Sessions Yet</h4>
                      <p className="text-gray-500">NFC session history will appear here once you start using your medical card for access</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {nfcSessions.map((session, index) => (
                        <div key={session.id || index} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors duration-200">
                          <div className="flex items-start space-x-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              session.is_active ? 'bg-green-100 text-green-600' : 
                              session.valid ? 'bg-blue-100 text-blue-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {session.is_active ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              ) : session.valid ? (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                              )}
                            </div>
                            
                            <div className="flex-grow min-w-0">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-2">
                                  <h4 className="text-sm font-semibold text-gray-900">
                                    {session.session_type === 'doctor' ? 'Doctor Access Session' :
                                     session.session_type === 'emergency' ? 'Emergency Access Session' :
                                     `${session.session_type || 'NFC'} Session`}
                                  </h4>
                                  {session.visit && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                      Visit #{session.visit}
                                    </span>
                                  )}
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                                    session.is_active ? 'bg-green-100 text-green-800' :
                                    session.valid ? 'bg-blue-100 text-blue-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {session.is_active ? 'Active' : session.valid ? 'Valid' : 'Expired'}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500">
                                  {formatDate(session.started_at)}
                                </span>
                              </div>
                              
                              <div className="mt-2 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs text-gray-600">
                                {session.accessed_by && (
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                    </svg>
                                    <span>Accessed by: {session.accessed_by.profile?.name || session.accessed_by.email || 'Unknown User'}</span>
                                  </div>
                                )}
                                {session.expires_at && (
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <span>Expires: {formatDate(session.expires_at)}</span>
                                  </div>
                                )}
                                {session.session_token && (
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                    </svg>
                                    <span>Token: {session.session_token.substring(0, 8)}...</span>
                                  </div>
                                )}
                                {session.patient && (
                                  <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <span>Patient: {session.patient.profile?.name || 'Patient Data'}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            <div className="mt-10">
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-2 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Quick Actions
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <Link href="/records/new">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                    <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-blue-100 group-hover:bg-blue-500 group-hover:text-black transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-600 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors duration-200">Upload Document</h4>
                    <p className="text-sm text-gray-600">Add medical records</p>
                  </div>
                </Link>

                <Link href="/emergency-access">
                  <div className="bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                    <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-red-100 group-hover:bg-red-500 group-hover:text-black transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-red-600 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-red-700 transition-colors duration-200">Emergency Access</h4>
                    <p className="text-sm text-gray-600">Critical information</p>
                  </div>
                </Link>

                <Link href="/profile">
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 border border-purple-200 rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                    <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-purple-100 group-hover:bg-purple-500 group-hover:text-black transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-purple-700 transition-colors duration-200">Edit Profile</h4>
                    <p className="text-sm text-gray-600">Update your information</p>
                  </div>
                </Link>

                <Link href="/records">
                  <div className="bg-gradient-to-br from-amber-50 to-amber-100 border border-amber-200 rounded-xl p-6 text-center hover:shadow-md hover:-translate-y-1 transition-all duration-200 group">
                    <div className="bg-white rounded-full h-16 w-16 flex items-center justify-center mx-auto mb-4 shadow-sm border border-amber-100 group-hover:bg-amber-500 group-hover:text-black transition-colors duration-200">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-amber-600 group-hover:text-black transition-colors duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h4 className="text-lg font-bold text-gray-800 mb-1 group-hover:text-amber-700 transition-colors duration-200">Medical Records</h4>
                    <p className="text-sm text-gray-600">View your history</p>
                  </div>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}
