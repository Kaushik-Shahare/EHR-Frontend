import api from './apiService';

/**
 * NFC Service for handling NFC card related API calls
 */
const nfcService = {
  /**
   * Tap an NFC card to get a session token
   * @param {string} cardId - The NFC card ID
   * @returns {Promise} - API response with session data
   */
  tapNfcCard: async (cardId) => {
    return api.get(`/api/ehr/nfc/tap/${cardId}`);
  },
  
  /**
   * Save a session token to localStorage
   * @param {string} patientId - The patient ID
   * @param {string} sessionToken - The session token
   * @param {string} expiresAt - Session expiration date
   */
  saveSessionToken: (patientId, sessionToken, expiresAt) => {
    let sessionTokens = {};
    const existingTokens = localStorage.getItem('sessionTokens');
    
    if (existingTokens) {
      try {
        sessionTokens = JSON.parse(existingTokens);
      } catch (e) {
        console.error("Error parsing existing session tokens:", e);
        // If parsing fails, start with empty object
        sessionTokens = {};
      }
    }
    
    // Add/update this user's token
    sessionTokens[patientId] = {
      token: sessionToken,
      expires_at: expiresAt,
      created_at: new Date().toISOString()
    };
    
    // Save back to localStorage
    localStorage.setItem('sessionTokens', JSON.stringify(sessionTokens));
    console.log(`Session token for patient ${patientId} saved to localStorage`);
  },
  
  /**
   * Get session token from localStorage
   * @param {string} patientId - The patient ID
   * @returns {object|null} - Session data or null if not found
   */
  getSessionToken: (patientId) => {
    try {
      const sessionTokens = JSON.parse(localStorage.getItem('sessionTokens') || '{}');
      return sessionTokens[patientId] || null;
    } catch (e) {
      console.error("Error retrieving session token:", e);
      return null;
    }
  }
};

export default nfcService;
