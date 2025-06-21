'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// HOC to protect routes that require authentication
export default function ProtectedRoute({ children, requireProfile = false }) {
  const { isAuthenticated, loading, hasProfile } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If not loading and not authenticated, redirect to login
    if (!loading && !isAuthenticated) {
      router.push('/login');
    }
    
    // If requiring profile and the user doesn't have one, redirect to profile page
    if (!loading && isAuthenticated && requireProfile && !hasProfile) {
      router.push('/profile');
    }
  }, [isAuthenticated, loading, hasProfile, requireProfile, router]);

  // Show loading when checking authentication
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

  // If authenticated (and has profile if required), render children
  if (isAuthenticated && (!requireProfile || hasProfile)) {
    return children;
  }

  // Otherwise, render nothing (will redirect in useEffect)
  return null;
}
