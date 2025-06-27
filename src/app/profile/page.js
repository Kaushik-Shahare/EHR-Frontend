'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import profileService from '@/services/profileService';
import documentService from '@/services/documentService';
import EditProfileModal from '@/components/profile/EditProfileModal';
import MainLayout from '@/components/MainLayout';

export default function ProfileForm() {
  const { user, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [profileData, setProfileData] = useState(null);
  const [hasProfile, setHasProfile] = useState(false);
  const router = useRouter();
  
  // Document upload state
  const [documents, setDocuments] = useState([]);
  const [isUploadingDocument, setIsUploadingDocument] = useState(false);
  const [documentError, setDocumentError] = useState('');
  const [documentSuccess, setDocumentSuccess] = useState('');
  const [documentDescription, setDocumentDescription] = useState('');
  const [documentType, setDocumentType] = useState('');
  const [isEmergencyAccessible, setIsEmergencyAccessible] = useState(false);
  const fileInputRef = useRef(null);

  useEffect(() => {
    // Redirect to login if not authenticated
    console.log('user from profile page', user);
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // If user data is available, set basic profile info
    if (user) {
      if (user.hasProfile) {
        setHasProfile(true);
        console.log('User has profile from auth context');
      } else if (user.name || user.email) {
        // If we have basic user info, we can at least display that
        console.log('Setting default hasProfile from user basic info');
        setHasProfile(true);
      }
      console.log('Setting user data from AuthContext:', user);
    }

    // Try to fetch existing profile if available for additional details
    const fetchProfile = async () => {
      try {
        console.log('Fetching detailed profile data...');
        const data = await profileService.getProfile();
        console.log('Profile data fetched successfully:', data);
        
        // Enhanced debugging to understand the data structure
        console.log('Profile data type:', typeof data);
        console.log('Profile data structure:', JSON.stringify(data, null, 2));
        console.log('Profile data isEmpty:', !data || Object.keys(data).length === 0);
        console.log('Profile keys available:', data ? Object.keys(data) : 'No data');
        
        // The issue might be that profile data is nested inside another object
        const extractedProfile = data?.profile || data?.data?.profile || data;
        
        console.log('Final profile data being used:', extractedProfile);
        console.log('Name:', extractedProfile?.name);
        console.log('Gender:', extractedProfile?.gender);
        console.log('Address:', extractedProfile?.address);

        // Use the extracted profile data
        
        // Store the complete profile data for display
        if (extractedProfile && typeof extractedProfile === 'object' && Object.keys(extractedProfile).length > 0) {
          setProfileData(extractedProfile);
          setHasProfile(true);
          console.log('Setting profile data and hasProfile to true with:', extractedProfile);
        } else {
          console.log('No valid profile data returned from API');
          // Create a default profile data object with user data
          if (user) {
            const defaultProfileData = {
              name: user.name || '',
              email: user.email || ''
            };
            setProfileData(defaultProfileData);
            setHasProfile(true);
            console.log('Setting default profile data from user:', defaultProfileData);
          }
        }
      } catch (err) {
        // No profile yet or error, that's okay for first-time users
        console.log('No existing profile found or error fetching profile:', err);
        
        // Create a default profile with user data if we have it
        if (user) {
          const defaultProfileData = {
            name: user.name || '',
            email: user.email || '',
            user_type: user.user_type || ''
          };
          setProfileData(defaultProfileData);
          setHasProfile(true);
          console.log('Created fallback profile data from user context:', defaultProfileData);
        }
      }
    };

    // Fetch user's documents if the user is authenticated and is a patient
    const fetchDocuments = async () => {
      try {
        if (isAuthenticated && user?.user_type?.name === 'Patient') {
          const docsData = await documentService.getMyDocuments();
          console.log('Documents fetched:', docsData);
          setDocuments(docsData);
        }
      } catch (err) {
        console.error('Error fetching documents:', err);
        setDocumentError('Failed to load your documents. Please try again.');
      }
    };

    if (isAuthenticated) {
      fetchProfile();
      fetchDocuments();
    }
  }, [isAuthenticated, loading, user, router]);

  // Handle opening the edit modal
  const openEditModal = () => {
    console.log('Opening edit modal with profile data:', profileData);
    setShowEditModal(true);
  };
  
  // Handle closing the edit modal
  const closeEditModal = () => {
    console.log('Closing edit modal');
    setShowEditModal(false);
    setError('');
  };

  const handleProfileSubmit = async (data) => {
    setError('');
    setSuccess('');

    try {
      console.log('Submitting profile data from form:', data);
      
      // Format data according to expected backend structure
      const updatedProfileData = {
        // Use data from form with fallbacks to existing profile data or user context data
        name: data.name || profileData?.name || user?.name || '',
        gender: data.gender || profileData?.gender || 'Prefer not to say',
        date_of_birth: data.date_of_birth || profileData?.date_of_birth || null,
        phone_number: data.phone_number || profileData?.phone_number || null,
        location: data.location || profileData?.location || null,
        
        address: {
          street: data.address?.street || profileData?.address?.street || '',
          area: data.address?.area || profileData?.address?.area || '',
          city: data.address?.city || profileData?.address?.city || '',
          state: data.address?.state || profileData?.address?.state || '',
          pincode: data.address?.pincode || profileData?.address?.pincode || '',
          country: data.address?.country || profileData?.address?.country || ''
        },
        
        blood_group: data.blood_group || profileData?.blood_group || null,
        height_cm: data.height_cm ? Number(data.height_cm) : profileData?.height_cm || null,
        weight_kg: data.weight_kg ? Number(data.weight_kg) : profileData?.weight_kg || null,
        marital_status: data.marital_status || profileData?.marital_status || 'Single',
        
        emergency_contact: {
          name: data.emergency_contact?.name || profileData?.emergency_contact?.name || '',
          relation: data.emergency_contact?.relation || profileData?.emergency_contact?.relation || '',
          phone_number: data.emergency_contact?.phone_number || profileData?.emergency_contact?.phone_number || ''
        },
        
        insurance: {
          provider: data.insurance?.provider || profileData?.insurance?.provider || '',
          policy_number: data.insurance?.policy_number || profileData?.insurance?.policy_number || '',
          valid_till: data.insurance?.valid_till || profileData?.insurance?.valid_till || null
        },
        
        allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()) : profileData?.allergies || [],
        chronic_conditions: data.chronic_conditions ? data.chronic_conditions.split(',').map(item => item.trim()) : profileData?.chronic_conditions || [],
        current_medications: data.current_medications ? data.current_medications.split(',').map(item => item.trim()) : profileData?.current_medications || [],
        
        primary_physician: {
          name: data.primary_physician?.name || profileData?.primary_physician?.name || '',
          department: data.primary_physician?.department || profileData?.primary_physician?.department || '',
          hospital: data.primary_physician?.hospital || profileData?.primary_physician?.hospital || ''
        },
        
        vaccination_status: {
          covid19: data.vaccination_status?.covid19 || profileData?.vaccination_status?.covid19 || 'Unknown',
          hepatitis_b: data.vaccination_status?.hepatitis_b || profileData?.vaccination_status?.hepatitis_b || 'Unknown',
          tetanus: data.vaccination_status?.tetanus || profileData?.vaccination_status?.tetanus || 'Unknown'
        }
      };
      
      // Always include user email from context if available
      if (user?.email) {
        updatedProfileData.email = user.email;
      }

      console.log('Sending profile update to API:', updatedProfileData);
      
      // Submit profile data to backend
      await profileService.updateProfile(updatedProfileData);
      
      // Update local state with new data
      setProfileData(updatedProfileData);
      setSuccess('Profile updated successfully!');
      console.log('Profile updated successfully');

      // Return success to the modal
      return true;
    } catch (err) {
      console.error('Profile update failed:', err);
      setError(err.response?.data?.message || err.message || 'Failed to update profile. Please try again.');
      throw err;
    }
  };

  // Handle document upload
  const handleDocumentUpload = async (e) => {
    e.preventDefault();
    
    // Reset status messages
    setDocumentError('');
    setDocumentSuccess('');
    
    // Check if file is selected
    if (!fileInputRef.current.files || fileInputRef.current.files.length === 0) {
      setDocumentError('Please select a file to upload');
      return;
    }
    
    const file = fileInputRef.current.files[0];
    
    // Validate file type (PDF)
    if (file.type !== 'application/pdf') {
      setDocumentError('Only PDF files are allowed');
      return;
    }
    
    // Validate file size (maximum 100MB as per backend requirement)
    if (file.size > 100 * 1024 * 1024) {
      setDocumentError('File size exceeds the maximum limit of 100MB');
      return;
    }
    
    // Validate description
    if (!documentDescription.trim()) {
      setDocumentError('Please provide a description for the document');
      return;
    }
    
    // Validate document type
    if (!documentType.trim()) {
      setDocumentError('Please select a document type');
      return;
    }
    
    // Create FormData object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('description', documentDescription.trim());
    formData.append('document_type', documentType.trim());
    formData.append('is_emergency_accessible', isEmergencyAccessible);
    
    try {
      setIsUploadingDocument(true);
      
      // Upload the document
      const response = await documentService.uploadDocument(formData);
      console.log('Document uploaded successfully:', response);
      
      // Update documents list
      setDocuments(prevDocs => [response, ...prevDocs]);
      
      // Reset form
      setDocumentDescription('');
      setDocumentType('');
      setIsEmergencyAccessible(false);
      fileInputRef.current.value = '';
      
      // Show success message
      setDocumentSuccess('Document uploaded successfully!');
      
    } catch (err) {
      console.error('Document upload failed:', err);
      setDocumentError(err.message || 'Failed to upload document. Please try again.');
    } finally {
      setIsUploadingDocument(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <MainLayout title={hasProfile ? 'Your Profile' : 'Complete Your Profile'}>
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow-lg rounded-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {hasProfile ? 'Your Profile' : 'Complete Your Profile'}
            </h1>
            <p className="text-gray-600">
              {user && user.name ? `Hello, ${user.name}! ` : ''}
              {hasProfile 
                ? 'View your profile information below' 
                : 'Please complete your profile to continue'}
            </p>
            {user && (
              <div className="mt-4 flex justify-center">
                <div className="w-20 h-20 bg-blue-600 text-black rounded-full flex items-center justify-center shadow-md">
                  <span className="font-bold text-3xl">
                    {user.name ? user.name.charAt(0).toUpperCase() : 
                     user.email ? user.email.charAt(0).toUpperCase() : 'U'}
                  </span>
                </div>
              </div>
            )}
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              {error}
            </div>
          )}

          {success && !showEditModal && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
              {success}
            </div>
          )}
          
          {/* Document Upload Section (only shown for patients) */}
          {user?.user_type?.name === 'Patient' && (
            <div className="mb-8 border-t border-gray-200 pt-8 mt-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Upload Medical Documents</h2>
              
              {documentError && (
                <div className="mb-4 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
                  {documentError}
                </div>
              )}
              
              {documentSuccess && (
                <div className="mb-4 bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
                  {documentSuccess}
                </div>
              )}
              
              <form onSubmit={handleDocumentUpload} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document (PDF only)
                  </label>
                  <input
                    type="file"
                    ref={fileInputRef}
                    accept="application/pdf"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Document Type
                  </label>
                  <select
                    value={documentType}
                    onChange={(e) => setDocumentType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    required
                  >
                    <option value="" disabled>Select document type</option>
                    <option value="Lab Report">Lab Report</option>
                    <option value="Prescription">Prescription</option>
                    <option value="Medical Certificate">Medical Certificate</option>
                    <option value="Insurance Document">Insurance Document</option>
                    <option value="X-Ray Report">X-Ray Report</option>
                    <option value="MRI Report">MRI Report</option>
                    <option value="CT Scan Report">CT Scan Report</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={documentDescription}
                    onChange={(e) => setDocumentDescription(e.target.value)}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    rows={3}
                    placeholder="Enter a brief description of this document"
                    required
                  ></textarea>
                </div>
                
                <div className="flex items-start">
                  <div className="flex items-center h-5">
                    <input
                      type="checkbox"
                      checked={isEmergencyAccessible}
                      onChange={(e) => setIsEmergencyAccessible(e.target.checked)}
                      className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                    />
                  </div>
                  <div className="ml-3 text-sm">
                    <label className="font-medium text-gray-700">Emergency Accessible</label>
                    <p className="text-gray-500">Allow emergency access to this document in critical situations</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isUploadingDocument}
                    className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black ${
                      isUploadingDocument ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'
                    } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                  >
                    {isUploadingDocument ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Uploading...
                      </>
                    ) : 'Upload Document'}
                  </button>
                </div>
              </form>
              
              {/* Document List */}
              <div className="mt-8">
                <h3 className="text-lg font-medium text-gray-800 mb-4">Your Documents</h3>
                
                {documents.length === 0 ? (
                  <div className="text-center py-6 bg-gray-50 rounded-lg">
                    <p className="text-gray-500">You haven't uploaded any documents yet</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document Type
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Description
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Uploaded
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Emergency Access
                          </th>
                          <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {documents.map((doc) => (
                          <tr key={doc.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">{doc.document_type || 'Unknown'}</div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900">{doc.description}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {new Date(doc.uploaded_at).toLocaleDateString()}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                doc.is_emergency_accessible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                              }`}>
                                {doc.is_emergency_accessible ? 'Yes' : 'No'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => window.open(doc.file, '_blank')}
                                className="text-blue-600 hover:text-blue-900 mr-4"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* View Profile Mode */}
          {!showEditModal && (
            <>
              {/* Add debugging */}
              {/* {console.log('hasProfile:', hasProfile, 'profileData:', profileData)} */}
              {hasProfile && profileData ? (
                <div className="space-y-8">
                  {/* Basic Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Basic Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Full Name</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.name) || (user && user.name) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Email</p>
                        <p className="text-base text-gray-900">
                          {(user && user.email) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Gender</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.gender) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Date of Birth</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.date_of_birth) ? 
                            new Date(profileData.date_of_birth).toLocaleDateString() : 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Phone Number</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.phone_number) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Marital Status</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.marital_status) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Location</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.location) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">User Type</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.user_type) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Age</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.age) || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Physical Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                      </svg>
                      Health Information
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Blood Group</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.blood_group) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Height (cm)</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.height_cm) || 'Not provided'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Weight (kg)</p>
                        <p className="text-base text-gray-900">
                          {(profileData && profileData.weight_kg) || 'Not provided'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Medical Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" clipRule="evenodd" />
                      </svg>
                      Medical Information
                    </h2>
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm font-medium text-gray-500">Allergies</p>
                        <p className="text-base text-gray-900">
                          {profileData && profileData.allergies && Array.isArray(profileData.allergies) && profileData.allergies.length 
                            ? profileData.allergies.join(', ')
                            : 'None reported'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Chronic Conditions</p>
                        <p className="text-base text-gray-900">
                          {profileData && profileData.chronic_conditions && Array.isArray(profileData.chronic_conditions) && profileData.chronic_conditions.length 
                            ? profileData.chronic_conditions.join(', ')
                            : 'None reported'}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-500">Current Medications</p>
                        <p className="text-base text-gray-900">
                          {profileData && profileData.current_medications && Array.isArray(profileData.current_medications) && profileData.current_medications.length 
                            ? profileData.current_medications.join(', ')
                            : 'None reported'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Address Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      Address Information
                    </h2>
                    {profileData && profileData.address ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Street</p>
                          <p className="text-base text-gray-900">
                            {profileData.address.street || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Area</p>
                          <p className="text-base text-gray-900">
                            {profileData.address.area || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">City</p>
                          <p className="text-base text-gray-900">
                            {profileData.address.city || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">State</p>
                          <p className="text-base text-gray-900">
                            {profileData.address.state || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Pincode</p>
                          <p className="text-base text-gray-900">
                            {profileData.address.pincode || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Country</p>
                          <p className="text-base text-gray-900">
                            {profileData.address.country || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No address information provided.</p>
                    )}
                  </div>

                  {/* Emergency Contact */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                      </svg>
                      Emergency Contact
                    </h2>
                    {profileData && profileData.emergency_contact ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Contact Name</p>
                          <p className="text-base text-gray-900">
                            {profileData.emergency_contact.name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Relation</p>
                          <p className="text-base text-gray-900">
                            {profileData.emergency_contact.relation || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Phone Number</p>
                          <p className="text-base text-gray-900">
                            {profileData.emergency_contact.phone_number || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No emergency contact information provided.</p>
                    )}
                  </div>

                  {/* Insurance Information */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                      </svg>
                      Insurance Information
                    </h2>
                    {profileData && profileData.insurance ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Provider</p>
                          <p className="text-base text-gray-900">
                            {profileData.insurance.provider || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Policy Number</p>
                          <p className="text-base text-gray-900">
                            {profileData.insurance.policy_number || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Valid Till</p>
                          <p className="text-base text-gray-900">
                            {profileData.insurance.valid_till ? new Date(profileData.insurance.valid_till).toLocaleDateString() : 'Not provided'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No insurance information provided.</p>
                    )}
                  </div>

                  {/* Primary Physician */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                      Primary Physician
                    </h2>
                    {profileData && profileData.primary_physician ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Doctor Name</p>
                          <p className="text-base text-gray-900">
                            {profileData.primary_physician.name || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Department/Specialization</p>
                          <p className="text-base text-gray-900">
                            {profileData.primary_physician.department || 'Not provided'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Hospital/Clinic</p>
                          <p className="text-base text-gray-900">
                            {profileData.primary_physician.hospital || 'Not provided'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No primary physician information provided.</p>
                    )}
                  </div>

                  {/* Vaccination Status */}
                  <div className="border-b border-gray-200 pb-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-blue-500" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                      </svg>
                      Vaccination Status
                    </h2>
                    {profileData && profileData.vaccination_status ? (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <p className="text-sm font-medium text-gray-500">COVID-19</p>
                          <p className="text-base text-gray-900">
                            {profileData.vaccination_status.covid19 || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Hepatitis B</p>
                          <p className="text-base text-gray-900">
                            {profileData.vaccination_status.hepatitis_b || 'Unknown'}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-500">Tetanus</p>
                          <p className="text-base text-gray-900">
                            {profileData.vaccination_status.tetanus || 'Unknown'}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-600">No vaccination information provided.</p>
                    )}
                  </div>

                  {/* Edit Profile Button */}
                  <div className="flex justify-center mt-8">
                    <button
                      type="button"
                      onClick={openEditModal}
                      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-black rounded-md font-medium shadow-sm transition-colors"
                    >
                      Edit Profile
                    </button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Profile Information</h3>
                  <p className="text-gray-600 mb-6">You haven't completed your profile yet.</p>
                  <button
                    type="button"
                    onClick={openEditModal}
                    className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-black rounded-md font-medium shadow-sm transition-colors"
                  >
                    Complete Your Profile
                  </button>
                </div>
              )}
            </>
          )}
          
          {/* EditProfileModal Component */}
          <EditProfileModal 
            isOpen={showEditModal}
            onClose={closeEditModal}
            onSubmit={handleProfileSubmit}
            profileData={profileData}
            hasProfile={hasProfile}
            user={user}
          />
        </div>
      </div>
    </div>
    </MainLayout>
  );
}
