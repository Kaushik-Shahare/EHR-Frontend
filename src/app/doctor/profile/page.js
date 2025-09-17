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
  FaShieldAlt,
  FaTimes,
  FaSave
} from 'react-icons/fa';

// EditProfileModal Component
const EditProfileModal = ({ isOpen, onClose, profileData, onSave }) => {
  const [formData, setFormData] = useState({
    name: '',
    gender: '',
    date_of_birth: '',
    phone_number: '',
    location: '',
    blood_group: '',
    height_cm: '',
    weight_kg: '',
    marital_status: '',
    address: {
      street: '',
      area: '',
      city: '',
      state: '',
      pincode: '',
      country: ''
    },
    emergency_contact: {
      name: '',
      relation: '',
      phone_number: ''
    },
    insurance: {
      provider: '',
      policy_number: '',
      valid_till: ''
    },
    allergies: [],
    chronic_conditions: [],
    current_medications: [],
    primary_physician: {
      name: '',
      department: '',
      hospital: ''
    },
    vaccination_status: {
      covid19: '',
      hepatitis_b: '',
      tetanus: ''
    }
  });
  
  const [loading, setLoading] = useState(false);
  const [allergiesInput, setAllergiesInput] = useState('');
  const [conditionsInput, setConditionsInput] = useState('');
  const [medicationsInput, setMedicationsInput] = useState('');

  // Initialize form data when modal opens
  useEffect(() => {
    if (isOpen && profileData) {
      setFormData({
        name: profileData.name || '',
        gender: profileData.gender || '',
        date_of_birth: profileData.date_of_birth || '',
        phone_number: profileData.phone_number || '',
        location: profileData.location || '',
        blood_group: profileData.blood_group || '',
        height_cm: profileData.height_cm || '',
        weight_kg: profileData.weight_kg || '',
        marital_status: profileData.marital_status || '',
        address: {
          street: profileData.address?.street || '',
          area: profileData.address?.area || '',
          city: profileData.address?.city || '',
          state: profileData.address?.state || '',
          pincode: profileData.address?.pincode || '',
          country: profileData.address?.country || 'India'
        },
        emergency_contact: {
          name: profileData.emergency_contact?.name || '',
          relation: profileData.emergency_contact?.relation || '',
          phone_number: profileData.emergency_contact?.phone_number || ''
        },
        insurance: {
          provider: profileData.insurance?.provider || '',
          policy_number: profileData.insurance?.policy_number || '',
          valid_till: profileData.insurance?.valid_till || ''
        },
        allergies: profileData.allergies || [],
        chronic_conditions: profileData.chronic_conditions || [],
        current_medications: profileData.current_medications || [],
        primary_physician: {
          name: profileData.primary_physician?.name || '',
          department: profileData.primary_physician?.department || '',
          hospital: profileData.primary_physician?.hospital || ''
        },
        vaccination_status: {
          covid19: profileData.vaccination_status?.covid19 || '',
          hepatitis_b: profileData.vaccination_status?.hepatitis_b || '',
          tetanus: profileData.vaccination_status?.tetanus || ''
        }
      });
      
      // Set array inputs as comma-separated strings
      setAllergiesInput((profileData.allergies || []).join(', '));
      setConditionsInput((profileData.chronic_conditions || []).join(', '));
      setMedicationsInput((profileData.current_medications || []).join(', '));
    }
  }, [isOpen, profileData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      // Handle nested objects
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert comma-separated strings to arrays
      const submissionData = {
        ...formData,
        allergies: allergiesInput ? allergiesInput.split(',').map(item => item.trim()) : [],
        chronic_conditions: conditionsInput ? conditionsInput.split(',').map(item => item.trim()) : [],
        current_medications: medicationsInput ? medicationsInput.split(',').map(item => item.trim()) : [],
        height_cm: formData.height_cm ? parseInt(formData.height_cm) : null,
        weight_kg: formData.weight_kg ? parseInt(formData.weight_kg) : null
      };

      await onSave(submissionData);
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <FaTimes className="text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          {/* Personal Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaUser className="mr-2 text-blue-500" />
              Personal Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={formData.gender}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="date_of_birth"
                  value={formData.date_of_birth}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="phone_number"
                  value={formData.phone_number}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Marital Status</label>
                <select
                  name="marital_status"
                  value={formData.marital_status}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Single">Single</option>
                  <option value="Married">Married</option>
                  <option value="Divorced">Divorced</option>
                  <option value="Widowed">Widowed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Medical Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaStethoscope className="mr-2 text-blue-500" />
              Medical Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Blood Group</label>
                <select
                  name="blood_group"
                  value={formData.blood_group}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Height (cm)</label>
                <input
                  type="number"
                  name="height_cm"
                  value={formData.height_cm}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Weight (kg)</label>
                <input
                  type="number"
                  name="weight_kg"
                  value={formData.weight_kg}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allergies (comma-separated)</label>
                <input
                  type="text"
                  value={allergiesInput}
                  onChange={(e) => setAllergiesInput(e.target.value)}
                  placeholder="e.g., Penicillin, Peanuts, Shellfish"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Chronic Conditions (comma-separated)</label>
                <input
                  type="text"
                  value={conditionsInput}
                  onChange={(e) => setConditionsInput(e.target.value)}
                  placeholder="e.g., Asthma, Diabetes, Hypertension"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Medications (comma-separated)</label>
                <input
                  type="text"
                  value={medicationsInput}
                  onChange={(e) => setMedicationsInput(e.target.value)}
                  placeholder="e.g., Inhaler (Salbutamol), Aspirin"
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Address Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaMapMarkerAlt className="mr-2 text-blue-500" />
              Address Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Area</label>
                <input
                  type="text"
                  name="address.area"
                  value={formData.address.area}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Pincode</label>
                <input
                  type="text"
                  name="address.pincode"
                  value={formData.address.pincode}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input
                  type="text"
                  name="address.country"
                  value={formData.address.country}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaPhone className="mr-2 text-blue-500" />
              Emergency Contact
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  name="emergency_contact.name"
                  value={formData.emergency_contact.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Relation</label>
                <input
                  type="text"
                  name="emergency_contact.relation"
                  value={formData.emergency_contact.relation}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  name="emergency_contact.phone_number"
                  value={formData.emergency_contact.phone_number}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Insurance Information */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaShieldAlt className="mr-2 text-blue-500" />
              Insurance Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                <input
                  type="text"
                  name="insurance.provider"
                  value={formData.insurance.provider}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                <input
                  type="text"
                  name="insurance.policy_number"
                  value={formData.insurance.policy_number}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Valid Till</label>
                <input
                  type="date"
                  name="insurance.valid_till"
                  value={formData.insurance.valid_till}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Primary Physician */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaHospital className="mr-2 text-blue-500" />
              Primary Physician
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Doctor Name</label>
                <input
                  type="text"
                  name="primary_physician.name"
                  value={formData.primary_physician.name}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Department</label>
                <input
                  type="text"
                  name="primary_physician.department"
                  value={formData.primary_physician.department}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hospital</label>
                <input
                  type="text"
                  name="primary_physician.hospital"
                  value={formData.primary_physician.hospital}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Vaccination Status */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <FaStethoscope className="mr-2 text-blue-500" />
              Vaccination Status
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">COVID-19</label>
                <select
                  name="vaccination_status.covid19"
                  value={formData.vaccination_status.covid19}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Partially Completed">Partially Completed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Hepatitis B</label>
                <select
                  name="vaccination_status.hepatitis_b"
                  value={formData.vaccination_status.hepatitis_b}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Partially Completed">Partially Completed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Tetanus</label>
                <select
                  name="vaccination_status.tetanus"
                  value={formData.vaccination_status.tetanus}
                  onChange={handleInputChange}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="">Select Status</option>
                  <option value="Not Started">Not Started</option>
                  <option value="Partially Completed">Partially Completed</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <FaSave className="mr-2" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

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

  // Update doctor profile data
  const updateProfile = async (updatedData) => {
    try {
      setError(null);
      
      // Make API call to update profile
      await profileService.updateProfile(updatedData);
      
      // Refresh profile data
      await fetchProfile();
      
      console.log('Profile updated successfully');
    } catch (err) {
      console.error('Error updating doctor profile:', err);
      setError('Failed to update profile');
      throw err; // Re-throw to be handled by the modal
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

              {profileData?.blood_group && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Blood Group</label>
                  <p className="text-gray-900">{profileData.blood_group}</p>
                </div>
              )}

              {(profileData?.height_cm || profileData?.weight_kg) && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Physical Stats</label>
                  <p className="text-gray-900">
                    {profileData.height_cm && `Height: ${profileData.height_cm} cm`}
                    {profileData.height_cm && profileData.weight_kg && ' | '}
                    {profileData.weight_kg && `Weight: ${profileData.weight_kg} kg`}
                  </p>
                </div>
              )}

              {profileData?.marital_status && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-1">Marital Status</label>
                  <p className="text-gray-900">{profileData.marital_status}</p>
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
        {(profileData?.address || profileData?.emergency_contact || profileData?.insurance) && (
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

            {/* Insurance Information */}
            {profileData?.insurance && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center mb-4">
                  <FaShieldAlt className="text-blue-500 mr-3" />
                  <h2 className="text-xl font-semibold text-gray-900">Insurance</h2>
                </div>
                
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Provider</label>
                    <p className="text-gray-900">{profileData.insurance.provider}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Policy Number</label>
                    <p className="text-gray-900">{profileData.insurance.policy_number}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-1">Valid Till</label>
                    <p className="text-gray-900">
                      {new Date(profileData.insurance.valid_till).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Medical Information */}
        {(profileData?.allergies || profileData?.chronic_conditions || profileData?.current_medications || profileData?.vaccination_status) && (
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center mb-4">
              <FaStethoscope className="text-blue-500 mr-3" />
              <h2 className="text-xl font-semibold text-gray-900">Medical Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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

              {profileData?.current_medications && profileData.current_medications.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">Current Medications</label>
                  <div className="space-y-1">
                    {profileData.current_medications.map((medication, index) => (
                      <span key={index} className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full mr-2 mb-1">
                        {medication}
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
      
      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        profileData={profileData}
        onSave={updateProfile}
      />
    </div>
  );
}
