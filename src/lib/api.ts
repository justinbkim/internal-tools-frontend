import axios from 'axios';
import type { User, KycCase, Refund, FeatureFlag, SavedView, AuditLogEntry } from '../types';

const API_BASE_URL = 'http://localhost:4000';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Helper function to convert snake_case to camelCase
const toCamelCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toCamelCase);
  if (typeof obj !== 'object') return obj;

  const newObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
      newObj[camelKey] = toCamelCase(obj[key]);
    }
  }
  return newObj;
};

// Helper function to convert camelCase to snake_case
const toSnakeCase = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(toSnakeCase);
  if (typeof obj !== 'object') return obj;

  const newObj: any = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
      newObj[snakeKey] = toSnakeCase(obj[key]);
    }
  }
  return newObj;
};

// Response interceptor to convert snake_case to camelCase
api.interceptors.response.use((response) => {
  response.data = toCamelCase(response.data);
  return response;
});

// Combined request interceptor to handle both auth and case conversion
api.interceptors.request.use((config) => {
  // Convert camelCase to snake_case for data and params
  if (config.data) {
    config.data = toSnakeCase(config.data);
  }
  if (config.params) {
    config.params = toSnakeCase(config.params);
  }

  // Add auth headers
  const userId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');
  
  if (userId && userRole) {
    config.headers['X-User-Id'] = userId;
    config.headers['X-User-Role'] = userRole;
  }
  
  return config;
});

// Special function for login page that uses dummy auth headers
export const getPublicUsers = () => {
  return axios.get<User[]>(`${API_BASE_URL}/users`, {
    headers: {
      'Content-Type': 'application/json',
      'X-User-Id': 'login-fetch',
      'X-User-Role': 'compliance_manager',
    },
  }).then(response => {
    response.data = toCamelCase(response.data);
    return response;
  });
};

export const apiClient = {
  // Health
  health: () => api.get('/health'),
  
  // Users
  getUsers: () => api.get<User[]>('/users'),
  getUser: (id: string) => api.get<User>(`/users/${id}`),
  
  // KYC Cases
  getKycCases: (params?: { status?: string; assignedTo?: string; riskScoreMin?: number; riskScoreMax?: number }) =>
    api.get<KycCase[]>('/kyc/cases', { params }),
  getKycCase: (id: string) => api.get<KycCase>(`/kyc/cases/${id}`),
  createKycCase: (data: Partial<KycCase>) => api.post<KycCase>('/kyc/cases', data),
  updateKycCase: (id: string, data: Partial<KycCase>) => api.patch<KycCase>(`/kyc/cases/${id}`, data),
  decideKycCase: (id: string, decision: { decision: 'approved' | 'rejected'; reason?: string }) =>
    api.post<KycCase>(`/kyc/cases/${id}/decide`, decision),
  getKycDocuments: (caseId: string) => api.get(`/kyc/cases/${caseId}/documents`),
  addKycDocument: (caseId: string, data: { docType: string; filename: string }) =>
    api.post(`/kyc/cases/${caseId}/documents`, data),
  
  // Refunds
  getRefunds: (params?: { status?: string; requestedBy?: string; amountCentsMin?: number; amountCentsMax?: number }) =>
    api.get<Refund[]>('/refunds', { params }),
  getRefund: (id: string) => api.get<Refund>(`/refunds/${id}`),
  createRefund: (data: Partial<Refund>) => api.post<Refund>('/refunds', data),
  requestRefund: (id: string) => api.post<Refund>(`/refunds/${id}/request`),
  approveRefund: (id: string) => api.post<Refund>(`/refunds/${id}/approve`),
  
  // Feature Flags
  getFeatureFlags: (params?: { environment?: string; enabled?: boolean }) =>
    api.get<FeatureFlag[]>('/flags', { params }),
  getFeatureFlag: (key: string) => api.get<FeatureFlag>(`/flags/${key}`),
  createFeatureFlag: (data: Partial<FeatureFlag>) => api.post<FeatureFlag>('/flags', data),
  updateFeatureFlag: (key: string, data: Partial<FeatureFlag>) => api.patch<FeatureFlag>(`/flags/${key}`, data),
  deleteFeatureFlag: (key: string) => api.delete(`/flags/${key}`),
  toggleFeatureFlag: (key: string) => api.post<FeatureFlag>(`/flags/${key}/toggle`),
  
  // Saved Views
  getSavedViews: (entityType: string) => api.get<SavedView[]>('/saved-views', { params: { entityType } }),
  createSavedView: (data: Partial<SavedView>) => api.post<SavedView>('/saved-views', data),
  getSavedView: (id: string) => api.get<SavedView>(`/saved-views/${id}`),
  deleteSavedView: (id: string) => api.delete(`/saved-views/${id}`),
  
  // Audit Log
  getAuditLog: (params?: { entityType?: string; entityId?: string; actorId?: string; limit?: number }) =>
    api.get<AuditLogEntry[]>('/audit', { params }),
};

export default api;
