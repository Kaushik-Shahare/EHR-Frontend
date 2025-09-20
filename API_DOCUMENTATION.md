# EHR Frontend API Services Documentation

## Overview
This document provides a comprehensive overview of all implemented API services in the EHR Frontend application. All services follow a consistent pattern with Bearer token authentication and standardized error handling.

## Authentication Pattern
All services use the following authentication pattern:
```javascript
getAuthHeaders() {
  const token = localStorage.getItem('token') || Cookies.get('token');
  return {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  };
}
```

## Service Structure

### 1. Authentication Service (`authService.js`)
**Purpose**: Handle user authentication, registration, and user management

**Key Methods**:
- `register(userData)` - Register new user
- `login(credentials)` - User login
- `logout()` - User logout
- `forgotPassword(email)` - Password reset request
- `loadUser()` - Load current user information
- `getDoctors()` - Get list of doctors (for patient selection)

**Usage Example**:
```javascript
import authService from '@/services/authService';

// Login
const loginData = await authService.login({
  email: 'user@example.com',
  password: 'password123'
});
```

### 2. Profile Service (`profileService.js`)
**Purpose**: User profile management

**Key Methods**:
- `getProfile()` - Get current user profile
- `updateProfile(profileData)` - Update user profile
- `checkProfileStatus()` - Check profile completion status

### 3. Patient Service (`patientService.js`)
**Purpose**: Patient data management and medical records

**Key Methods**:
- `getPatientById(patientId)` - Get patient by ID
- `getMyPatients()` - Get doctor's patients
- `updateVitalSigns(visitId, vitalSignsData)` - Update vital signs
- `addDiagnosis(visitId, diagnosisData)` - Add diagnosis
- `addPrescription(visitId, prescriptionData)` - Add prescription
- `addLabResult(visitId, labResultData)` - Add lab results
- `completeVisit(visitId)` - Complete visit
- `getAllPatients()` - Get all patients (admin)

### 4. Doctor Service (`doctorService.js`) **[NEW]**
**Purpose**: Doctor-specific operations and patient management

**Key Methods**:
- `getDocuments(patientId, filters)` - Access patient documents
- `requestAccess(patientId, accessType, reason)` - Request document access
- `startNfcSession(patientId, cardId)` - Start NFC session
- `endNfcSession(sessionId)` - End NFC session
- `getMyVisits(filters)` - Get doctor's visits
- `createVisit(visitData)` - Create new visit
- `updateVisit(visitId, visitData)` - Update visit
- `generateMedicalReport(visitId, reportData)` - Generate medical report
- `requestEmergencyAccess(patientId, reason)` - Request emergency access

**Usage Example**:
```javascript
import doctorService from '@/services/doctorService';

// Request patient document access
const accessRequest = await doctorService.requestAccess(
  patientId, 
  'medical_records', 
  'Regular checkup consultation'
);
```

### 5. Admin Service (`adminService.js`) **[NEW]**
**Purpose**: Administrative operations across all system entities

**Key Methods**:
- `approveDocument(documentId)` - Approve document
- `rejectDocument(documentId, reason)` - Reject document
- `getAccessRequests(filters)` - Get access requests
- `approveAccessRequest(requestId)` - Approve access request
- `rejectAccessRequest(requestId, reason)` - Reject access request
- `getNfcCards(filters)` - Get NFC cards
- `createNfcCard(cardData)` - Create NFC card
- `assignNfcCard(cardId, patientId)` - Assign NFC card
- `getVisits(filters)` - Get all visits
- `getSessions(filters)` - Get all sessions
- `getUsers(userType)` - Get users by type

### 6. Insurance Service (`insuranceService.js`) **[ENHANCED]**
**Purpose**: Insurance types, policies, and claims management

**Key Methods**:

**Insurance Types**:
- `getInsuranceTypes()` - Get all insurance types
- `getInsuranceTypeDetails(typeId)` - Get insurance type details
- `createInsuranceType(typeData)` - Create insurance type
- `updateInsuranceType(typeId, typeData)` - Update insurance type
- `deleteInsuranceType(typeId)` - Delete insurance type

**Insurance Policies**:
- `getInsurancePolicies()` - Get user's policies
- `getInsurancePolicyDetails(policyId)` - Get policy details
- `createInsurancePolicy(policyData)` - Register with insurance
- `getPatientPolicies(patientId)` - Get patient policies

**Insurance Forms/Claims**:
- `getInsuranceForms()` - Get insurance forms
- `createInsuranceForm(formData)` - Create insurance form
- `autoCreateFromVisit(visitId, policyId, isCashless)` - Auto-create from visit
- `getCashlessClaims()` - Get cashless claims
- `submitForm(formId)` - Submit form
- `approveForm(formId)` - Approve form
- `rejectForm(formId, reason)` - Reject form
- `aiApprovalForm(formId)` - AI approval

**AI Verification**:
- `verifyClaim(insuranceId)` - Verify claim using AI
- `getVerificationResult(insuranceId)` - Get verification result

**Usage Example**:
```javascript
import insuranceService from '@/services/insuranceService';

// Auto-create insurance form from visit
const form = await insuranceService.autoCreateFromVisit(
  visitId,
  policyId,
  true // is cashless
);
```

### 7. NFC Service (`nfcService.js`) **[NEW]**
**Purpose**: NFC card management, session handling, and access control

**Key Methods**:

**NFC Operations**:
- `nfcTap(cardId, patientId, deviceId, location)` - Handle NFC tap
- `getNfcCard(cardId)` - Get NFC card info
- `verifyNfcCard(cardId, signature, timestamp)` - Verify card authenticity

**Session Management**:
- `startNfcSession(cardId, sessionType, timeout)` - Start NFC session
- `endNfcSession(sessionId)` - End NFC session
- `getNfcSessionStatus(sessionId)` - Get session status
- `getActiveSessions()` - Get active sessions

**Card Management**:
- `createNfcCard(cardData)` - Create NFC card
- `getNfcCards(filters)` - Get NFC cards
- `updateNfcCard(cardId, cardData)` - Update NFC card
- `assignNfcCard(cardId, patientId, activateImmediately)` - Assign card
- `activateNfcCard(cardId)` - Activate card
- `deactivateNfcCard(cardId, reason)` - Deactivate card

**Access Logs & Emergency**:
- `getNfcLogs(filters)` - Get access logs
- `requestEmergencyAccess(cardId, reason, requestorId)` - Request emergency access
- `grantEmergencyAccess(requestId, duration)` - Grant emergency access

**Utility Methods**:
- `isNfcSupported()` - Check NFC support
- `requestNfcPermissions()` - Request NFC permissions
- `initializeNfcReader()` - Initialize Web NFC reader

**Usage Example**:
```javascript
import nfcService from '@/services/nfcService';

// Handle NFC tap
const tapResult = await nfcService.nfcTap(
  cardId,
  patientId,
  deviceId,
  'Reception Desk'
);

// Start secure session
const session = await nfcService.startNfcSession(
  cardId,
  'read',
  300 // 5 minute timeout
);
```

### 8. Document Service (`documentService.js`) **[EXISTING]**
**Purpose**: Document management and file operations
- Already implemented and functional
- Used by various components for document operations

## Error Handling Pattern
All services follow this error handling pattern:
```javascript
try {
  const response = await api.get('/api/endpoint');
  return response.data.data || response.data;
} catch (error) {
  console.error('Operation error:', error.response?.data || error);
  throw error.response?.data || { message: 'Failed to perform operation' };
}
```

## Component Integration
Services are imported and used in components as follows:
```javascript
import serviceName from '@/services/serviceName';
// or
import { serviceName } from '@/services/serviceName';
```

## Testing and Validation
A validation utility is available at `src/utils/apiValidation.js` to test service availability and method presence:
```javascript
import { validateServices } from '@/utils/apiValidation';
const results = validateServices();
console.log(results);
```

## Implementation Status
✅ **Complete**: Authentication, Profile, Patient, Doctor, Admin, Insurance, NFC APIs
✅ **Tested**: All services compile without errors
✅ **Validated**: Service structure and method availability confirmed

## Next Steps
1. Component integration testing
2. API endpoint validation with backend
3. Error handling refinement based on actual API responses
4. Performance optimization for bulk operations

---

**Total API Endpoints Implemented**: 60+ endpoints across 7 services
**Authentication**: Bearer token with localStorage/cookie fallback
**Error Handling**: Comprehensive with user-friendly messages
**Code Quality**: TypeScript-ready with JSDoc documentation