/**
 * Test API Authentication
 * Run this in the browser console to test API authentication
 */

import authDebug from './authDebug.js';

const testApiAuth = async () => {
  console.log('🧪 Testing API Authentication...');
  
  // Check auth state first
  const authState = authDebug.checkAuthState();
  
  if (!authState.hasTokenInLocalStorage && !authState.hasTokenInCookies) {
    console.error('❌ No authentication token found');
    console.log('💡 You need to log in first or set a mock token for testing');
    console.log('💡 Run: authDebug.setMockAuth() for testing');
    return;
  }
  
  try {
    // Try to make a test API call
    const { getPatientVisits } = await import('../services/apiService.js');
    
    console.log('📡 Making test API call to /api/ehr/patient-visits/...');
    const response = await getPatientVisits();
    
    console.log('✅ API call successful:', response);
    return response;
  } catch (error) {
    console.error('❌ API call failed:', {
      status: error.status,
      message: error.message,
      requiresAuth: error.requiresAuth
    });
    
    if (error.status === 401) {
      console.log('🔐 Authentication failed - token may be invalid or expired');
      console.log('💡 Try logging in again or check your token');
    }
    
    return null;
  }
};

// Make it globally available
if (typeof window !== 'undefined') {
  window.testApiAuth = testApiAuth;
  console.log('🧪 Test API auth function available as window.testApiAuth()');
}

export default testApiAuth;