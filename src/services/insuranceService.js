import api from "./apiService";
import Cookies from 'js-cookie';

/**
 * Service for handling insurance-specific operations
 * Covers all insurance APIs from the documentation including types, policies, and forms management
 */
const insuranceService = {
  
  // Helper function to get auth headers
  getAuthHeaders() {
    const token = localStorage.getItem('token') || Cookies.get('token');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  },

  // ===== INSURANCE TYPES =====
  
  /**
   * Get list of insurance types (All users)
   * GET /api/insurance/types/
   */
  async getInsuranceTypes() {
    try {
      const response = await api.get('/api/insurance/types/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get insurance types error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch insurance types' };
    }
  },

  /**
   * Get detailed insurance type information (All users)
   * GET /api/insurance/types/{insurance_type}/
   */
  async getInsuranceTypeDetails(typeId) {
    try {
      const response = await api.get(`/api/insurance/types/${typeId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get insurance type details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch insurance type details' };
    }
  },

  /**
   * Create insurance type (Admin/Doctor only)
   * POST /api/insurance/types/
   */
  async createInsuranceType(typeData) {
    try {
      const response = await api.post('/api/insurance/types/', typeData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create insurance type error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create insurance type' };
    }
  },

  /**
   * Update insurance type (Admin/Doctor only)
   * PUT /api/insurance/types/{insurance_type}/
   */
  async updateInsuranceType(typeId, typeData) {
    try {
      const response = await api.put(`/api/insurance/types/${typeId}/`, typeData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update insurance type error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update insurance type' };
    }
  },

  /**
   * Update insurance type (Admin/Doctor only) - Partial update
   * PATCH /api/insurance/types/{insurance_type}/
   */
  async patchInsuranceType(typeId, typeData) {
    try {
      const response = await api.patch(`/api/insurance/types/${typeId}/`, typeData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Patch insurance type error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update insurance type' };
    }
  },

  /**
   * Delete insurance type (Admin/Doctor only)
   * DELETE /api/insurance/types/{insurance_type}/
   */
  async deleteInsuranceType(typeId) {
    try {
      const response = await api.delete(`/api/insurance/types/${typeId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Delete insurance type error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to delete insurance type' };
    }
  },

  // ===== INSURANCE POLICIES =====
  
  /**
   * Get list of insurance policies (Patient)
   * GET /api/insurance/policies/
   */
  async getInsurancePolicies() {
    try {
      const response = await api.get('/api/insurance/policies/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get insurance policies error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch insurance policies' };
    }
  },

  /**
   * Get detailed insurance policy information (Patient)
   * GET /api/insurance/policies/{policy_id}/
   */
  async getInsurancePolicyDetails(policyId) {
    try {
      const response = await api.get(`/api/insurance/policies/${policyId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get insurance policy details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch insurance policy details' };
    }
  },

  /**
   * Register patient with insurance
   * POST /api/insurance/policies/
   */
  async createInsurancePolicy(policyData) {
    try {
      const response = await api.post('/api/insurance/policies/', policyData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create insurance policy error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create insurance policy' };
    }
  },

  /**
   * Get patient insurance policies
   * GET /api/insurance/policies/patient_policies/?patient_id={patient_id}
   */
  async getPatientPolicies(patientId) {
    try {
      const response = await api.get(`/api/insurance/policies/patient_policies/?patient_id=${patientId}`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get patient policies error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch patient policies' };
    }
  },

  // ===== INSURANCE FORMS/CLAIMS =====
  
  /**
   * View insurance forms
   * GET /api/insurance/forms/
   */
  async getInsuranceForms() {
    try {
      const response = await api.get('/api/insurance/forms/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get insurance forms error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch insurance forms' };
    }
  },

  /**
   * Get detailed insurance form
   * GET /api/insurance/forms/{form_id}/
   */
  async getInsuranceFormDetails(formId) {
    try {
      const response = await api.get(`/api/insurance/forms/${formId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get insurance form details error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch insurance form details' };
    }
  },

  /**
   * Create basic insurance form
   * POST /api/insurance/forms/
   */
  async createInsuranceForm(formData) {
    try {
      const response = await api.post('/api/insurance/forms/', formData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Create insurance form error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to create insurance form' };
    }
  },

  /**
   * Auto create insurance form from a visit
   * POST /api/insurance/forms/auto_create_from_visit/
   */
  async autoCreateFromVisit(visitId, policyId, isCashless = false) {
    try {
      const response = await api.post('/api/insurance/forms/auto_create_from_visit/', {
        visit_id: visitId,
        policy_id: policyId,
        is_cashless: isCashless
      }, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Auto create form from visit error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to auto create form from visit' };
    }
  },

  /**
   * Get cashless claims only
   * GET /api/insurance/forms/cashless_claims/
   */
  async getCashlessClaims() {
    try {
      const response = await api.get('/api/insurance/forms/cashless_claims/', this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get cashless claims error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch cashless claims' };
    }
  },

  /**
   * Get forms by visit ID
   * GET /api/insurance/forms/visit_forms/?visit_id={visit_id}
   */
  async getFormsByVisitId(visitId) {
    try {
      const response = await api.get(`/api/insurance/forms/visit_forms/?visit_id=${visitId}`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get forms by visit ID error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to fetch forms by visit ID' };
    }
  },

  /**
   * Update insurance form
   * PUT /api/insurance/forms/{form_id}/
   */
  async updateInsuranceForm(formId, formData) {
    try {
      const response = await api.put(`/api/insurance/forms/${formId}/`, formData, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Update insurance form error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to update insurance form' };
    }
  },

  /**
   * Delete insurance form
   * DELETE /api/insurance/forms/{form_id}/
   */
  async deleteInsuranceForm(formId) {
    try {
      const response = await api.delete(`/api/insurance/forms/${formId}/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Delete insurance form error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to delete insurance form' };
    }
  },

  // ===== FORM PROCESSING =====
  
  /**
   * Submit insurance form
   * POST /api/insurance/forms/{form_id}/submit/
   */
  async submitForm(formId) {
    try {
      const response = await api.post(`/api/insurance/forms/${formId}/submit/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Submit form error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to submit form' };
    }
  },

  /**
   * Reject insurance form request
   * POST /api/insurance/forms/{form_id}/reject/
   */
  async rejectForm(formId, reason = null) {
    try {
      const payload = reason ? { reason } : {};
      const response = await api.post(`/api/insurance/forms/${formId}/reject/`, payload, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Reject form error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to reject form' };
    }
  },

  /**
   * Approve insurance form request
   * POST /api/insurance/forms/{form_id}/approve/
   */
  async approveForm(formId) {
    try {
      const response = await api.post(`/api/insurance/forms/${formId}/approve/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Approve form error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to approve form' };
    }
  },

  /**
   * AI approval for insurance form
   * POST /api/insurance/forms/{form_id}/ai_approval/
   */
  async aiApprovalForm(formId) {
    try {
      const response = await api.post(`/api/insurance/forms/${formId}/ai_approval/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('AI approval form error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to process AI approval' };
    }
  },

  // ===== AI VERIFICATION (Insurance Agent) =====
  
  /**
   * Verify insurance claim using AI
   * POST /api/ai/verification/{insurance_id}/
   */
  async verifyClaim(insuranceId) {
    try {
      const response = await api.post(`/api/ai/verification/${insuranceId}/`, {}, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Verify claim error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to verify claim' };
    }
  },

  /**
   * Get AI verification result
   * GET /api/ai/verification/{insurance_id}/result/
   */
  async getVerificationResult(insuranceId) {
    try {
      const response = await api.get(`/api/ai/verification/${insuranceId}/result/`, this.getAuthHeaders());
      return response.data.data || response.data;
    } catch (error) {
      console.error('Get verification result error:', error.response?.data || error);
      throw error.response?.data || { message: 'Failed to get verification result' };
    }
  }
};

export { insuranceService };
export default insuranceService;