'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import profileService from '../../services/profileService';

export default function ProfileForm() {
  const { register, handleSubmit, setValue, formState: { errors } } = useForm();
  const { user, isAuthenticated, loading, hasProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState(1);
  const [totalSteps] = useState(3);
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch existing profile if available
    if (isAuthenticated && user) {
      const fetchProfile = async () => {
        try {
          const profileData = await profileService.getProfile();
          
          if (profileData.profile) {
            // Set form values for all profile fields
            const profile = profileData.profile;
            
            // Basic info
            setValue('name', profile.name);
            setValue('gender', profile.gender);
            setValue('phone_number', profile.phone_number);
            setValue('date_of_birth', profile.date_of_birth ? profile.date_of_birth.substring(0, 10) : ''); // Format as YYYY-MM-DD
            setValue('location', profile.location);
            
            // Medical info
            setValue('blood_group', profile.blood_group);
            setValue('height_cm', profile.height_cm);
            setValue('weight_kg', profile.weight_kg);
            setValue('marital_status', profile.marital_status);
            
            // Health data
            if (profile.allergies && Array.isArray(profile.allergies)) {
              setValue('allergies', profile.allergies.join(', '));
            }
            if (profile.chronic_conditions && Array.isArray(profile.chronic_conditions)) {
              setValue('chronic_conditions', profile.chronic_conditions.join(', '));
            }
            if (profile.current_medications && Array.isArray(profile.current_medications)) {
              setValue('current_medications', profile.current_medications.join(', '));
            }
          }
        } catch (err) {
          console.error('Error fetching profile:', err);
        }
      };
      
      fetchProfile();
    }
  }, [isAuthenticated, loading, router, setValue, user]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      // Format arrays from comma-separated strings
      const formattedData = {
        ...data,
        allergies: data.allergies ? data.allergies.split(',').map(item => item.trim()) : [],
        chronic_conditions: data.chronic_conditions ? data.chronic_conditions.split(',').map(item => item.trim()) : [],
        current_medications: data.current_medications ? data.current_medications.split(',').map(item => item.trim()) : [],
      };

      await profileService.updateProfile(formattedData);
      setSuccess('Profile updated successfully!');
      
      // Redirect to dashboard after submission
      setTimeout(() => {
        router.push('/dashboard');
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const nextStep = () => {
    setStep(current => Math.min(current + 1, totalSteps));
  };
  
  const prevStep = () => {
    setStep(current => Math.max(current - 1, 1));
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
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white shadow-sm rounded-lg p-6 md:p-8">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Complete Your Health Profile</h1>
            <p className="text-gray-600">
              Please provide your health information to help us serve you better
            </p>
            
            {/* Step indicator */}
            <div className="flex justify-center items-center mt-6">
              <div className="flex items-center">
                {Array.from({ length: totalSteps }).map((_, idx) => (
                  <div key={idx} className="flex items-center">
                    <div 
                      className={`rounded-full h-8 w-8 flex items-center justify-center border-2 
                        ${step > idx ? 'bg-blue-600 text-white border-blue-600' : 
                          step === idx + 1 ? 'border-blue-600 text-blue-600' : 'border-gray-300 text-gray-400'}`}
                    >
                      {idx + 1}
                    </div>
                    {idx < totalSteps - 1 && (
                      <div 
                        className={`h-1 w-10 mx-1 
                        ${step > idx + 1 ? 'bg-blue-600' : 'bg-gray-300'}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Basic Information */}
              <div>
                <label htmlFor="bloodGroup" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Group
                </label>
                <select
                  id="bloodGroup"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('bloodGroup')}
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
                <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('age', {
                    min: { value: 0, message: 'Age cannot be negative' },
                    max: { value: 120, message: 'Age must be less than 120' }
                  })}
                />
                {errors.age && <p className="mt-1 text-sm text-red-600">{errors.age.message}</p>}
              </div>

              <div>
                <label htmlFor="weight" className="block text-sm font-medium text-gray-700 mb-1">
                  Weight (kg)
                </label>
                <input
                  id="weight"
                  type="number"
                  step="0.1"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('weight', {
                    min: { value: 0, message: 'Weight cannot be negative' }
                  })}
                />
                {errors.weight && <p className="mt-1 text-sm text-red-600">{errors.weight.message}</p>}
              </div>

              <div>
                <label htmlFor="height" className="block text-sm font-medium text-gray-700 mb-1">
                  Height (cm)
                </label>
                <input
                  id="height"
                  type="number"
                  step="0.1"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('height', {
                    min: { value: 0, message: 'Height cannot be negative' }
                  })}
                />
                {errors.height && <p className="mt-1 text-sm text-red-600">{errors.height.message}</p>}
              </div>

              <div>
                <label htmlFor="bloodPressure" className="block text-sm font-medium text-gray-700 mb-1">
                  Blood Pressure (e.g., 120/80)
                </label>
                <input
                  id="bloodPressure"
                  type="text"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('bloodPressure')}
                />
              </div>

              <div>
                <label htmlFor="sugarLevel" className="block text-sm font-medium text-gray-700 mb-1">
                  Sugar Level (mg/dL)
                </label>
                <input
                  id="sugarLevel"
                  type="text"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  {...register('sugarLevel')}
                />
              </div>
            </div>

            {/* Medical History */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Medical History</h2>
              
              <div className="space-y-6">
                <div>
                  <label htmlFor="allergies" className="block text-sm font-medium text-gray-700 mb-1">
                    Allergies
                  </label>
                  <textarea
                    id="allergies"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="List any allergies you have"
                    {...register('allergies')}
                  />
                </div>

                <div>
                  <label htmlFor="chronicDiseases" className="block text-sm font-medium text-gray-700 mb-1">
                    Chronic Diseases
                  </label>
                  <textarea
                    id="chronicDiseases"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="E.g., Diabetes, Asthma, Hypertension"
                    {...register('chronicDiseases')}
                  />
                </div>

                <div>
                  <label htmlFor="currentMedication" className="block text-sm font-medium text-gray-700 mb-1">
                    Current Medications
                  </label>
                  <textarea
                    id="currentMedication"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="List any medications you are currently taking"
                    {...register('currentMedication')}
                  />
                </div>

                <div>
                  <label htmlFor="pastSurgeries" className="block text-sm font-medium text-gray-700 mb-1">
                    Past Surgeries/Treatments
                  </label>
                  <textarea
                    id="pastSurgeries"
                    className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    rows={2}
                    placeholder="List any previous surgeries or major treatments"
                    {...register('pastSurgeries')}
                  />
                </div>
              </div>
            </div>

            {/* Emergency Information */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Emergency Information</h2>
              
              <div>
                <label htmlFor="emergencyContact" className="block text-sm font-medium text-gray-700 mb-1">
                  Emergency Contact
                </label>
                <input
                  id="emergencyContact"
                  type="text"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Name: Contact Number"
                  {...register('emergencyContact')}
                />
              </div>
            </div>

            {/* Additional Notes */}
            <div className="border-t border-gray-200 pt-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h2>
              
              <div>
                <label htmlFor="medicalNotes" className="block text-sm font-medium text-gray-700 mb-1">
                  Other Medical Information
                </label>
                <textarea
                  id="medicalNotes"
                  className="w-full rounded-md border border-gray-300 p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  rows={3}
                  placeholder="Any other information you'd like to share about your health"
                  {...register('medicalNotes')}
                />
              </div>
            </div>

            <div className="flex justify-end pt-5">
              <button
                type="submit"
                disabled={submitting}
                className="ml-3 inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-70"
              >
                {/* {submitting ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Save Profile')} */}
                Submit  
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
