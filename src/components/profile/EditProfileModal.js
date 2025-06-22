'use client';

import { useForm } from 'react-hook-form';
import { useState, useEffect } from 'react';

/**
 * Edit Profile Modal Component
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Function to close the modal
 * @param {Function} props.onSubmit - Function to handle form submission
 * @param {Object} props.profileData - Current profile data
 * @param {boolean} props.hasProfile - Whether user has a profile
 * @param {Object} props.user - Current user data
 */
export default function EditProfileModal({ isOpen, onClose, onSubmit, profileData, hasProfile, user }) {
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm();

  // Populate the form with existing profile data when opened
  useEffect(() => {
    console.log('useEffect triggered in EditProfileModal', {
      isOpen,
      hasProfileData: !!profileData,
      profileDataType: profileData ? typeof profileData : 'N/A'
    });
    
    if (isOpen && profileData) {
      console.log('Modal opened with profile data:', JSON.stringify(profileData, null, 2));
      
      // Set top-level form values
      Object.entries(profileData).forEach(([key, value]) => {
        if (value !== null && value !== undefined && key !== 'patient_id' && key !== 'id' && 
            !['address', 'emergency_contact', 'insurance', 'primary_physician', 'vaccination_status'].includes(key)) {
          console.log(`Setting field ${key} to:`, value);
          setValue(key, value);
        }
      });

      // Set nested form values for address
      if (profileData.address) {
        console.log('Setting address fields:', JSON.stringify(profileData.address, null, 2));
        Object.entries(profileData.address).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`Setting address.${key} to:`, value);
            setValue(`address.${key}`, value);
          }
        });
      }

      // Set nested form values for emergency contact
      if (profileData.emergency_contact) {
        console.log('Setting emergency contact fields:', JSON.stringify(profileData.emergency_contact, null, 2));
        Object.entries(profileData.emergency_contact).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`Setting emergency_contact.${key} to:`, value);
            setValue(`emergency_contact.${key}`, value);
          }
        });
      }

      // Set nested form values for insurance
      if (profileData.insurance) {
        console.log('Setting insurance fields:', JSON.stringify(profileData.insurance, null, 2));
        Object.entries(profileData.insurance).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`Setting insurance.${key} to:`, value);
            setValue(`insurance.${key}`, value);
          }
        });
      }

      // Set nested form values for primary physician
      if (profileData.primary_physician) {
        console.log('Setting primary physician fields:', JSON.stringify(profileData.primary_physician, null, 2));
        Object.entries(profileData.primary_physician).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`Setting primary_physician.${key} to:`, value);
            setValue(`primary_physician.${key}`, value);
          }
        });
      }

      // Set vaccination status values
      if (profileData.vaccination_status) {
        console.log('Setting vaccination status fields:', JSON.stringify(profileData.vaccination_status, null, 2));
        Object.entries(profileData.vaccination_status).forEach(([key, value]) => {
          if (value !== null && value !== undefined) {
            console.log(`Setting vaccination_status.${key} to:`, value);
            setValue(`vaccination_status.${key}`, value);
          }
        });
      }

      // For array fields, convert to comma-separated strings
      ['allergies', 'chronic_conditions', 'current_medications'].forEach(field => {
        if (Array.isArray(profileData[field])) {
          if (profileData[field].length > 0) {
            console.log(`Setting array field ${field} to:`, profileData[field].join(', '));
            setValue(field, profileData[field].join(', '));
          } else {
            console.log(`Setting empty array field ${field} to empty string`);
            setValue(field, '');
          }
        }
      });
    }
    
    // Always set the user email if available
    if (user?.email) {
      console.log(`Setting email from user context to:`, user.email);
      setValue('email', user.email);
    }
    
    // Set user name if available and name field is empty
    if (user?.name) {
      console.log(`Setting name from user context to:`, user.name);
      setValue('name', user.name);
    }
    
    // Add a debug message to check all form values after setting
    console.log('Form values set. Ready for editing.');
  }, [isOpen, profileData, user, setValue]);

  // Handle form submission
  const submitHandler = async (data) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      await onSubmit(data);
      setSuccess('Profile updated successfully!');
      
      // Close modal after success
      setTimeout(() => {
        setSuccess('');
        onClose();
      }, 1500);
    } catch (err) {
      setError(err.message || 'Failed to update profile.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-800/50 bg-opacity-75 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-screen overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {hasProfile ? 'Edit Your Profile' : 'Complete Your Profile'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-md p-4">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 rounded-md p-4">
              {success}
            </div>
          )}
          
          <form onSubmit={handleSubmit(submitHandler)} className="space-y-6">
            {/* Basic Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Basic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name*
                  </label>
                  <input
                    type="text"
                    id="name"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    disabled
                    className="w-full rounded-md border border-gray-200 bg-gray-50 p-2.5"
                    {...register('email')}
                  />
                </div>

                <div>
                  <label htmlFor="date_of_birth" className="block text-sm font-medium text-gray-700 mb-1">
                    Date of Birth*
                  </label>
                  <input
                    type="date"
                    id="date_of_birth"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('date_of_birth', { required: 'Date of birth is required' })}
                  />
                  {errors.date_of_birth && <p className="mt-1 text-sm text-red-600">{errors.date_of_birth.message}</p>}
                </div>

                <div>
                  <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
                    Gender*
                  </label>
                  <select
                    id="gender"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('gender', { required: 'Gender is required' })}
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                  {errors.gender && <p className="mt-1 text-sm text-red-600">{errors.gender.message}</p>}
                </div>

                <div>
                  <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number*
                  </label>
                  <input
                    type="tel"
                    id="phone_number"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g., 9359139756"
                    {...register('phone_number', { required: 'Phone number is required' })}
                  />
                  {errors.phone_number && <p className="mt-1 text-sm text-red-600">{errors.phone_number.message}</p>}
                </div>

                <div>
                  <label htmlFor="marital_status" className="block text-sm font-medium text-gray-700 mb-1">
                    Marital Status
                  </label>
                  <select
                    id="marital_status"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('marital_status')}
                  >
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                    <option value="Divorced">Divorced</option>
                    <option value="Widowed">Widowed</option>
                    <option value="Separated">Separated</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    id="location"
                    placeholder="e.g., Mumbai, Maharashtra"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('location')}
                  />
                </div>
              </div>
            </div>

            {/* Address Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Address Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="address.street" className="block text-sm font-medium text-gray-700 mb-1">
                    Street
                  </label>
                  <input
                    type="text"
                    id="address.street"
                    placeholder="e.g., B-201, Sagar Heights"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('address.street')}
                  />
                </div>

                <div>
                  <label htmlFor="address.area" className="block text-sm font-medium text-gray-700 mb-1">
                    Area
                  </label>
                  <input
                    type="text"
                    id="address.area"
                    placeholder="e.g., Andheri East"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('address.area')}
                  />
                </div>

                <div>
                  <label htmlFor="address.city" className="block text-sm font-medium text-gray-700 mb-1">
                    City
                  </label>
                  <input
                    type="text"
                    id="address.city"
                    placeholder="e.g., Mumbai"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('address.city')}
                  />
                </div>

                <div>
                  <label htmlFor="address.state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <input
                    type="text"
                    id="address.state"
                    placeholder="e.g., Maharashtra"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('address.state')}
                  />
                </div>

                <div>
                  <label htmlFor="address.pincode" className="block text-sm font-medium text-gray-700 mb-1">
                    Pincode
                  </label>
                  <input
                    type="text"
                    id="address.pincode"
                    placeholder="e.g., 400069"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('address.pincode')}
                  />
                </div>

                <div>
                  <label htmlFor="address.country" className="block text-sm font-medium text-gray-700 mb-1">
                    Country
                  </label>
                  <input
                    type="text"
                    id="address.country"
                    placeholder="e.g., India"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('address.country')}
                  />
                </div>
              </div>
            </div>

            {/* Medical Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Medical Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="blood_group" className="block text-sm font-medium text-gray-700 mb-1">
                    Blood Group
                  </label>
                  <select
                    id="blood_group"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('blood_group')}
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
                  <label htmlFor="height_cm" className="block text-sm font-medium text-gray-700 mb-1">
                    Height (cm)
                  </label>
                  <input
                    type="number"
                    id="height_cm"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('height_cm', { 
                      valueAsNumber: true,
                      validate: value => !value || value > 0 || 'Height must be a positive number'
                    })}
                  />
                  {errors.height_cm && <p className="mt-1 text-sm text-red-600">{errors.height_cm.message}</p>}
                </div>

                <div>
                  <label htmlFor="weight_kg" className="block text-sm font-medium text-gray-700 mb-1">
                    Weight (kg)
                  </label>
                  <input
                    type="number"
                    id="weight_kg"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('weight_kg', {
                      valueAsNumber: true,
                      validate: value => !value || value > 0 || 'Weight must be a positive number'
                    })}
                  />
                  {errors.weight_kg && <p className="mt-1 text-sm text-red-600">{errors.weight_kg.message}</p>}
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <textarea
                    id="allergies"
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter allergies separated by commas (e.g., Penicillin, Peanuts)"
                    {...register('allergies')}
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="chronic_conditions" className="block text-sm font-medium text-gray-700 mb-1">
                    Chronic Conditions
                  </label>
                  <textarea
                    id="chronic_conditions"
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter chronic conditions separated by commas (e.g., Asthma, Diabetes)"
                    {...register('chronic_conditions')}
                  ></textarea>
                </div>

                <div className="md:col-span-2">
                  <label htmlFor="current_medications" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications
                  </label>
                  <textarea
                    id="current_medications"
                    rows={2}
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Enter medications separated by commas (e.g., Inhaler (Salbutamol), Metformin)"
                    {...register('current_medications')}
                  ></textarea>
                </div>
              </div>
            </div>

            {/* Emergency Contact */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Contact</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="emergency_contact.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Contact Name
                  </label>
                  <input
                    type="text"
                    id="emergency_contact.name"
                    placeholder="e.g., Rajesh Shahare"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('emergency_contact.name')}
                  />
                </div>

                <div>
                  <label htmlFor="emergency_contact.relation" className="block text-sm font-medium text-gray-700 mb-1">
                    Relation
                  </label>
                  <input
                    type="text"
                    id="emergency_contact.relation"
                    placeholder="e.g., Father"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('emergency_contact.relation')}
                  />
                </div>

                <div>
                  <label htmlFor="emergency_contact.phone_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    id="emergency_contact.phone_number"
                    placeholder="e.g., 9823123456"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('emergency_contact.phone_number')}
                  />
                </div>
              </div>
            </div>

            {/* Insurance Information */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Insurance Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="insurance.provider" className="block text-sm font-medium text-gray-700 mb-1">
                    Provider
                  </label>
                  <input
                    type="text"
                    id="insurance.provider"
                    placeholder="e.g., Star Health Insurance"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('insurance.provider')}
                  />
                </div>

                <div>
                  <label htmlFor="insurance.policy_number" className="block text-sm font-medium text-gray-700 mb-1">
                    Policy Number
                  </label>
                  <input
                    type="text"
                    id="insurance.policy_number"
                    placeholder="e.g., STH12345678"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('insurance.policy_number')}
                  />
                </div>

                <div>
                  <label htmlFor="insurance.valid_till" className="block text-sm font-medium text-gray-700 mb-1">
                    Valid Till
                  </label>
                  <input
                    type="date"
                    id="insurance.valid_till"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('insurance.valid_till')}
                  />
                </div>
              </div>
            </div>

            {/* Primary Physician */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Primary Physician</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="primary_physician.name" className="block text-sm font-medium text-gray-700 mb-1">
                    Doctor Name
                  </label>
                  <input
                    type="text"
                    id="primary_physician.name"
                    placeholder="e.g., Dr. Neha Mehta"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('primary_physician.name')}
                  />
                </div>

                <div>
                  <label htmlFor="primary_physician.department" className="block text-sm font-medium text-gray-700 mb-1">
                    Specialization/Department
                  </label>
                  <input
                    type="text"
                    id="primary_physician.department"
                    placeholder="e.g., Pulmonology"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('primary_physician.department')}
                  />
                </div>

                <div>
                  <label htmlFor="primary_physician.hospital" className="block text-sm font-medium text-gray-700 mb-1">
                    Hospital/Clinic
                  </label>
                  <input
                    type="text"
                    id="primary_physician.hospital"
                    placeholder="e.g., Apollo Hospitals, Mumbai"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('primary_physician.hospital')}
                  />
                </div>
              </div>
            </div>

            {/* Vaccination Status */}
            <div className="border-b border-gray-200 pb-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Vaccination Status</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label htmlFor="vaccination_status.covid19" className="block text-sm font-medium text-gray-700 mb-1">
                    COVID-19
                  </label>
                  <select
                    id="vaccination_status.covid19"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('vaccination_status.covid19')}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="vaccination_status.hepatitis_b" className="block text-sm font-medium text-gray-700 mb-1">
                    Hepatitis B
                  </label>
                  <select
                    id="vaccination_status.hepatitis_b"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('vaccination_status.hepatitis_b')}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="vaccination_status.tetanus" className="block text-sm font-medium text-gray-700 mb-1">
                    Tetanus
                  </label>
                  <select
                    id="vaccination_status.tetanus"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    {...register('vaccination_status.tetanus')}
                  >
                    <option value="Unknown">Unknown</option>
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="pt-6">
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={submitting}
              >
                {submitting ? 'Saving Profile...' : 'Save Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
