import api from "./apiService";


export const insuranceService = {
  // Insurance Types
  getInsuranceTypes: async () => {
    return await api.get('/api/insurance/types/');
  },

  getInsuranceTypeDetails: async (typeId) => {
    return await api.get(`/api/insurance/types/${typeId}/`);
  },

  createInsuranceType: async (typeData) => {
    return await api.post('/api/insurance/types/', typeData);
  },

  updateInsuranceType: async (typeId, typeData) => {
    return await api.put(`/api/insurance/types/${typeId}/`, typeData);
  },

  deleteInsuranceType: async (typeId) => {
    return await api.delete(`/api/insurance/types/${typeId}/`);
  },

  // Insurance Policies
  getInsurancePolicies: async () => {
    return await api.get('/api/insurance/policies/');
  },

  getInsurancePolicyDetails: async (policyId) => {
    return await api.get(`/api/insurance/policies/${policyId}/`);
  },
  
  getPatientPolicies: async (patientId) => {
    return await api.get(`/api/insurance/policies/patient_policies/?patient_id=${patientId}`);
  },

  createInsurancePolicy: async (policyData) => {
    return await api.post('/api/insurance/policies/', policyData);
  },

  // Insurance Forms/Claims
  getInsuranceForms: async () => {
    return await api.get('/api/insurance/forms/');
  },

  getInsuranceFormDetails: async (formId) => {
    return await api.get(`/api/insurance/forms/${formId}/`);
  },

  getCashlessClaims: async () => {
    return await api.get('/api/insurance/forms/cashless_claims/');
  },

  getVisitForms: async (visitId) => {
    return await api.get(`/api/insurance/forms/visit_forms/?visit_id=${visitId}`);
  },
  
  createInsuranceForm: async (formData) => {
    return await api.post('/api/insurance/forms/', formData);
  },

  updateInsuranceForm: async (formId, formData) => {
    return await api.put(`/api/insurance/forms/${formId}/`, formData);
  },

  deleteInsuranceForm: async (formId) => {
    return await api.delete(`/api/insurance/forms/${formId}/`);
  },

  // Form Processing Actions
  submitForm: async (formId) => {
    return await api.post(`/api/insurance/forms/${formId}/submit/`);
  },

  approveForm: async (formId) => {
    return await api.post(`/api/insurance/forms/${formId}/approve/`);
  },

  rejectForm: async (formId) => {
    return await api.post(`/api/insurance/forms/${formId}/reject/`);
  },

  aiApproveForm: async (formId) => {
    return await api.post(`/api/insurance/forms/${formId}/ai_approval/`);
  },

  // Auto-create form from a visit
  createFormFromVisit: async (visitId, policyId, isCashless) => {
    return await api.post('/api/insurance/forms/auto_create_from_visit/', {
      visit_id: visitId,
      policy_id: policyId,
      is_cashless: isCashless
    });
  }
};
