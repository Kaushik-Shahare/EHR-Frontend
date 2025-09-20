/**
 * Authentication Debug Utility
 * Helps debug authentication issues in the EHR Frontend
 */

import Cookies from 'js-cookie';

const authDebug = {
  /**
   * Check current authentication state
   */
  checkAuthState() {
    const tokenFromLocalStorage = localStorage.getItem('token');
    const tokenFromCookies = Cookies.get('token');
    const refreshToken = localStorage.getItem('refreshToken');
    
    const authState = {
      hasTokenInLocalStorage: !!tokenFromLocalStorage,
      hasTokenInCookies: !!tokenFromCookies,
      hasRefreshToken: !!refreshToken,
      tokenSource: tokenFromLocalStorage ? 'localStorage' : (tokenFromCookies ? 'cookies' : 'none'),
      tokenPreview: tokenFromLocalStorage ? 
        `${tokenFromLocalStorage.substring(0, 10)}...${tokenFromLocalStorage.substring(tokenFromLocalStorage.length - 10)}` : 
        (tokenFromCookies ? `${tokenFromCookies.substring(0, 10)}...${tokenFromCookies.substring(tokenFromCookies.length - 10)}` : 'none'),
      timestamp: new Date().toISOString()
    };
    
    console.log('🔐 Authentication State:', authState);
    return authState;
  },

  /**
   * Clear all authentication data
   */
  clearAuth() {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    Cookies.remove('token');
    console.log('🧹 All authentication data cleared');
  },

  /**
   * Set mock authentication for testing
   */
  setMockAuth() {
    const mockToken = 'mock_token_for_testing_123456789';
    localStorage.setItem('token', mockToken);
    console.log('🎭 Mock authentication set');
  },

  /**
   * Test API authentication headers
   */
  testApiHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` })
    };
    
    console.log('📡 API Headers that would be sent:', headers);
    return headers;
  },

  /**
   * Check if user appears to be logged in
   */
  isLoggedIn() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    const loggedIn = !!token;
    console.log(`🔍 User appears to be logged in: ${loggedIn}`);
    return loggedIn;
  }
};

// Make it available globally for debugging in browser console
if (typeof window !== 'undefined') {
  window.authDebug = authDebug;
  console.log('🛠️ Auth debug utility available as window.authDebug');
}

export default authDebug;