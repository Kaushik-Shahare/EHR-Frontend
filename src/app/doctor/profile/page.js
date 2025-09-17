"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import profileService from '@/services/profileService';
import { 
  FaUser, 
  FaEnvelope, 
  FaPhone, 
  FaMapMarkerAlt, 
  FaEdit,
  FaStethoscope,
  FaCalendarAlt,
  FaGraduationCap,
  FaHospital,
  FaBirthdayCake,
  FaIdCard,
  FaShieldAlt
} from 'react-icons/fa';

export default function DoctorProfilePage() {
  const { user, loading: authLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Redirect if not authenticated or not a doctor
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
      return;
    }
    
    if (!authLoading && isAuthenticated && user?.user_type !== 'Doctor') {
      router.push('/dashboard');
      return;
    }

    if (isAuthenticated && user?.user_type === 'Doctor') {
      fetchProfile();
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Fetch doctor profile data
  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await profileService.getProfile();
      console.log('Doctor profile data:', response);
      setProfileData(response);
    } catch (err) {
      console.error('Error fetching doctor profile:', err);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to get user initials
  const getUserInitials = () => {
    if (user?.profile?.name) {
      return user.profile.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
    } else if (user?.email) {
      return user.email.slice(0, 2).toUpperCase();
    }
    return 'DR';
  };

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-700">Loading profile...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-red-800 mb-4">{error}</p>
          <button 
            onClick={fetchProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-6">
              {/* Profile Picture */}
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <span className="text-white text-2xl font-bold">
                  {getUserInitials()}
                </span>
              </div>
              
              {/* Basic Info */}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {user?.profile?.name || user?.email || 'Doctor'}
                </h1>
                <p className="text-lg text-blue-600 font-medium mb-1">
                  {profileData?.primary_physician?.department || 'Medical Practitioner'}
                </p>
                <p className="text-gray-600 mb-3">
                  {profileData?.primary_physician?.hospital || 'Healthcare Professional'}
                </p>
                
                {/* Quick Stats */}
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <FaIdCard className="mr-2 text-blue-500" />
                    <span>ID: {user?.id || 'N/A'}</span>
                  </div>
                  {profileData?.age && (
                    <div className="flex items-center text-gray-600">
                      <FaBirthdayCake className="mr-2 text-blue-500" />
                      <span>{profileData.age} years old</span>
                    </div>
                  )}
                  <div className="flex items-center text-gray-600">
                    <FaShieldAlt className="mr-2 text-green-500" />
                    <span>Verified Doctor</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Edit Button */}
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <FaEdit className="mr-2" />
              Edit Profile
            </button>
          </div>
        </div>

        {/* Profile Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Personal Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FaUser className="text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Personal Information</h2>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Full Name</label>
                <p className="text-gray-900">{user?.profile?.name || 'Not provided'}</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Email Address</label>
                <div className="flex items-center">
                  <FaEnvelope className="text-gray-400 mr-2" />
                  <p className="text-gray-900">{user?.email || 'Not provided'}</p>
                </div>
              </div>
              
              {profileData?.phone_number && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Phone Number</label>
                  <div className="flex items-center">
                    <FaPhone className="text-gray-400 mr-2" />
                    <p className="text-gray-900">{profileData.phone_number}</p>
                  </div>
                </div>
              )}
              
              {profileData?.date_of_birth && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Date of Birth</label>
                  <div className="flex items-center">
                    <FaBirthdayCake className="text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {new Date(profileData.date_of_birth).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
              
              {profileData?.gender && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Gender</label>
                  <p className="text-gray-900">{profileData.gender}</p>
                </div>
              )}
              
              {profileData?.location && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Location</label>
                  <div className="flex items-center">
                    <FaMapMarkerAlt className="text-gray-400 mr-2" />
                    <p className="text-gray-900">{profileData.location}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Professional Information */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FaStethoscope className="text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Professional Information</h2>
            </div>
            
            <div className="space-y-4">
              {profileData?.primary_physician?.department && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Specialization</label>
                  <div className="flex items-center">
                    <FaGraduationCap className="text-gray-400 mr-2" />
                    <p className="text-gray-900">{profileData.primary_physician.department}</p>
                  </div>
                </div>
              )}
              
              {profileData?.primary_physician?.hospital && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Hospital/Clinic</label>
                  <div className="flex items-center">
                    <FaHospital className="text-gray-400 mr-2" />
                    <p className="text-gray-900">{profileData.primary_physician.hospital}</p>
                  </div>
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">User Type</label>
                <p className="font-medium text-blue-600">Doctor</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-500 mb-1">Account Status</label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
              
              {profileData?.last_visit && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Last Activity</label>
                  <div className="flex items-center">
                    <FaCalendarAlt className="text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {new Date(profileData.last_visit).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Additional Information */}
        {(profileData?.address || profileData?.emergency_contact) && (
          <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Address Information */}
            {profileData?.address && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FaMapMarkerAlt className="text-blue-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Address</h2>
                </div>
                
                <div className="space-y-2">
                  <p className="text-gray-900">
                    {profileData.address.street}
                  </p>
                  <p className="text-gray-900">
                    {profileData.address.area}, {profileData.address.city}
                  </p>
                  <p className="text-gray-900">
                    {profileData.address.state} - {profileData.address.pincode}
                  </p>
                  <p className="text-gray-900">
                    {profileData.address.country}
                  </p>
                </div>
              </div>
            )}

            {/* Emergency Contact */}
            {profileData?.emergency_contact && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FaPhone className="text-blue-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Emergency Contact</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Name</label>
                    <p className="text-gray-900">{profileData.emergency_contact.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Relation</label>
                    <p className="text-gray-900">{profileData.emergency_contact.relation}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Phone</label>
                    <p className="text-gray-900">{profileData.emergency_contact.phone_number}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Medical Information */}
        {(profileData?.allergies || profileData?.chronic_conditions || profileData?.vaccination_status) && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FaStethoscope className="text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {profileData?.allergies && profileData.allergies.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Allergies</label>
                  <div className="space-y-1">
                    {profileData.allergies.map((allergy, index) => (
                      <span key={index} className="inline-block bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full mr-2 mb-1">
                        {allergy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profileData?.chronic_conditions && profileData.chronic_conditions.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Chronic Conditions</label>
                  <div className="space-y-1">
                    {profileData.chronic_conditions.map((condition, index) => (
                      <span key={index} className="inline-block bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full mr-2 mb-1">
                        {condition}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {profileData?.vaccination_status && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Vaccination Status</label>
                  <div className="space-y-2">
                    {Object.entries(profileData.vaccination_status).map(([vaccine, status]) => (
                      <div key={vaccine} className="flex justify-between items-center">
                        <span className="text-sm capitalize">{vaccine.replace('_', ' ')}</span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
