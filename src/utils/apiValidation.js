/**
 * API Services Validation Test
 * This file validates that all API services are properly structured and importable
 */

import authService from '../services/authService.js';
import profileService from '../services/profileService.js';
import patientService from '../services/patientService.js';
import doctorService from '../services/doctorService.js';
import adminService from '../services/adminService.js';
import insuranceService from '../services/insuranceService.js';
import nfcService from '../services/nfcService.js';

// Test service availability and key methods
const validateServices = () => {
  const results = {
    authService: {
      available: !!authService,
      methods: [
        'register', 'login', 'logout', 'forgotPassword', 
        'loadUser', 'getDoctors'
      ].filter(method => typeof authService[method] === 'function')
    },
    
    profileService: {
      available: !!profileService,
      methods: [
        'getProfile', 'updateProfile', 'checkProfileStatus'
      ].filter(method => typeof profileService[method] === 'function')
    },
    
    patientService: {
      available: !!patientService,
      methods: [
        'getPatientById', 'getMyPatients', 'updateVitalSigns', 
        'addDiagnosis', 'addPrescription', 'addLabResult', 
        'completeVisit', 'getAllPatients'
      ].filter(method => typeof patientService[method] === 'function')
    },
    
    doctorService: {
      available: !!doctorService,
      methods: [
        'getDocuments', 'requestAccess', 'startNfcSession', 
        'endNfcSession', 'getMyVisits', 'createVisit', 
        'updateVisit', 'generateMedicalReport', 'requestEmergencyAccess'
      ].filter(method => typeof doctorService[method] === 'function')
    },
    
    adminService: {
      available: !!adminService,
      methods: [
        'approveDocument', 'rejectDocument', 'getAccessRequests', 
        'approveAccessRequest', 'rejectAccessRequest', 'getNfcCards',
        'createNfcCard', 'assignNfcCard', 'getVisits', 'getSessions', 'getUsers'
      ].filter(method => typeof adminService[method] === 'function')
    },
    
    insuranceService: {
      available: !!insuranceService,
      methods: [
        'getInsuranceTypes', 'createInsuranceType', 'getInsurancePolicies', 
        'createInsurancePolicy', 'getInsuranceForms', 'createInsuranceForm',
        'submitForm', 'approveForm', 'rejectForm', 'verifyClaim'
      ].filter(method => typeof insuranceService[method] === 'function')
    },
    
    nfcService: {
      available: !!nfcService,
      methods: [
        'nfcTap', 'getNfcCard', 'verifyNfcCard', 'startNfcSession', 
        'endNfcSession', 'getNfcCards', 'createNfcCard', 'assignNfcCard',
        'activateNfcCard', 'requestEmergencyAccess', 'isNfcSupported'
      ].filter(method => typeof nfcService[method] === 'function')
    }
  };
  
  return results;
};

// Export for use in components or tests
export { validateServices };

// Log validation results if run directly
if (typeof window !== 'undefined') {
  console.log('API Services Validation Results:', validateServices());
}

export default validateServices;