'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import ScheduleCalendar from '@/components/doctor/ScheduleCalendar';

export default function DoctorSchedule() {
  const router = useRouter();
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    // Wait for AuthContext to finish loading
    if (!authLoading) {
      if (!isAuthenticated) {
        console.log('Doctor Schedule - Not authenticated, redirecting to login');
        router.push('/login');
        return;
      }

      if (!user) {
        console.log('Doctor Schedule - No user data, redirecting to login');
        router.push('/login');
        return;
      }

      if (user.user_type !== 'Doctor') {
        console.log('Doctor Schedule - User is not a doctor, redirecting to appropriate dashboard');
        // Redirect based on user type
        if (user.is_staff) {
          router.push('/admin/dashboard');
        } else {
          router.push('/dashboard');
        }
        return;
      }

      console.log('Doctor Schedule - Authentication successful');
      setAuthChecked(true);
    }
  }, [authLoading, isAuthenticated, user, router]);

  // Show loading while auth is being checked
  if (authLoading || !authChecked) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading schedule...</p>
        </div>
      </div>
    );
  }

  // Show error if not authenticated or not a doctor
  if (!isAuthenticated || !user || user.user_type !== 'Doctor') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="mt-4 text-lg font-medium text-gray-900">Access Restricted</h3>
          <p className="mt-2 text-gray-500">You need to be logged in as a doctor to view this page.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Back
              </button>
              <h1 className="text-2xl font-bold text-gray-900">
                Schedule - Dr. {user?.profile?.name || user?.email?.split('@')[0] || 'Doctor'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="text-right">
                <p className="text-sm text-gray-600">Logged in as</p>
                <p className="font-medium text-gray-900">{user?.profile?.name || user?.email}</p>
              </div>
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 font-medium">
                  {(user?.profile?.name || user?.email?.split('@')[0] || 'D')[0].toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg">
          <ScheduleCalendar 
            isOpen={true} 
            onClose={() => router.push('/doctor')}
            isFullPage={true}
          />
        </div>
      </div>
    </main>
  );
}