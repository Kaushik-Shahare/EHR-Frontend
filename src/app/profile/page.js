'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import axios from 'axios';
import Cookies from 'js-cookie';

export default function ProfileForm() {
  const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm();
  const { user, isAuthenticated, loading, hasProfile } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [existingProfile, setExistingProfile] = useState(null);
  const router = useRouter();

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!loading && !isAuthenticated) {
      router.push('/login');
      return;
    }

    // Fetch existing profile if available
    if (isAuthenticated) {
      const fetchProfile = async () => {
        try {
          const token = Cookies.get('token') || '';
          const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          
          if (response.data.profile) {
            setExistingProfile(response.data.profile);
            // Set form values
            Object.entries(response.data.profile).forEach(([key, value]) => {
              if (value !== null && key !== 'id' && key !== 'userId' && key !== 'createdAt' && key !== 'updatedAt') {
                setValue(key, value);
              }
            });
          }
        } catch (err) {
          // No profile yet or error, that's okay
          console.log('No existing profile found');
        }
      };
      
      fetchProfile();
    }
  }, [isAuthenticated, loading, router, setValue]);

  const onSubmit = async (data) => {
    setSubmitting(true);
    setError('');
    setSuccess('');

    try {
      const token = Cookies.get('token') || '';
      await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/profile`, data, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      setSuccess('Profile updated successfully!');
      setExistingProfile(data);
      
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
                {submitting ? 'Saving...' : (existingProfile ? 'Update Profile' : 'Save Profile')}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
