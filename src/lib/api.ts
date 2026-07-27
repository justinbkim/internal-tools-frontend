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

// Combined request interceptor to handle auth only
api.interceptors.request.use((config) => {
  // Convert camelCase to snake_case for data only (not params anymore)
  if (config.data) {
    config.data = toSnakeCase(config.data);
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
  getKycCases: (params?: { status?: string; assignedTo?: string; riskScoreMin?: number; riskScoreMax?: number }) => {
    const queryString = new URLSearchParams();
    if (params?.status) queryString.append('status', params.status);
    if (params?.assignedTo) queryString.append('assigned_to', params.assignedTo);
    if (params?.riskScoreMin) queryString.append('risk_score_min', params.riskScoreMin.toString());
    if (params?.riskScoreMax) queryString.append('risk_score_max', params.riskScoreMax.toString());
    const url = queryString.toString() ? `/kyc/cases?${queryString.toString()}` : '/kyc/cases';
    return api.get<KycCase[]>(url);
  },
  getKycCase: (id: string) => api.get<KycCase>(`/kyc/cases/${id}`),
  createKycCase: (data: Partial<KycCase>) => api.post<KycCase>('/kyc/cases', data),
  updateKycCase: (id: string, data: Partial<KycCase>) => api.patch<KycCase>(`/kyc/cases/${id}`, data),
  decideKycCase: (id: string, decision: { decision: 'approved' | 'rejected'; reason?: string }) =>
    api.post<KycCase>(`/kyc/cases/${id}/decide`, decision),
  getKycDocuments: (caseId: string) => api.get(`/kyc/cases/${caseId}/documents`),
  addKycDocument: (caseId: string, data: { docType: string; filename: string }) =>
    api.post(`/kyc/cases/${caseId}/documents`, data),
  
  // Refunds
  getRefunds: (params?: { status?: string; requestedBy?: string; amountCentsMin?: number; amountCentsMax?: number }) => {
    const queryString = new URLSearchParams();
    if (params?.status) queryString.append('status', params.status);
    if (params?.requestedBy) queryString.append('requested_by', params.requestedBy);
    if (params?.amountCentsMin) queryString.append('amount_cents_min', params.amountCentsMin.toString());
    if (params?.amountCentsMax) queryString.append('amount_cents_max', params.amountCentsMax.toString());
    const url = queryString.toString() ? `${API_BASE_URL}/refunds?${queryString.toString()}` : `${API_BASE_URL}/refunds`;
    console.log('Full URL with base:', url);
    console.log('With params:', params);
    console.log('queryString:', queryString.toString());
    
    return axios.get<Refund[]>(url, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId'),
        'X-User-Role': localStorage.getItem('userRole'),
      },
    }).then(response => {
      console.log('Raw response data:', response.data);
      console.log('Response data length:', response.data.length);
      response.data = toCamelCase(response.data);
      console.log('Converted response data:', response.data);
      return response;
    });
  },
  getRefund: (id: string) => {
    return axios.get<Refund>(`${API_BASE_URL}/refunds/${id}`, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId'),
        'X-User-Role': localStorage.getItem('userRole'),
      },
    }).then(response => {
      response.data = toCamelCase(response.data);
      return response;
    });
  },
  createRefund: (data: Partial<Refund>) => {
    return axios.post<Refund>(`${API_BASE_URL}/refunds`, toSnakeCase(data), {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId'),
        'X-User-Role': localStorage.getItem('userRole'),
      },
    }).then(response => {
      response.data = toCamelCase(response.data);
      return response;
    });
  },
  requestRefund: (id: string) => {
    return axios.post<Refund>(`${API_BASE_URL}/refunds/${id}/request`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId'),
        'X-User-Role': localStorage.getItem('userRole'),
      },
    }).then(response => {
      response.data = toCamelCase(response.data);
      return response;
    });
  },
  approveRefund: (id: string) => {
    return axios.post<Refund>(`${API_BASE_URL}/refunds/${id}/approve`, {}, {
      headers: {
        'Content-Type': 'application/json',
        'X-User-Id': localStorage.getItem('userId'),
        'X-User-Role': localStorage.getItem('userRole'),
      },
    }).then(response => {
      response.data = toCamelCase(response.data);
      return response;
    });
  },
  
  // Feature Flags
  getFeatureFlags: (params?: { environment?: string; enabled?: boolean }) => {
    const queryString = new URLSearchParams();
    if (params?.environment) queryString.append('environment', params.environment);
    if (params?.enabled !== undefined) queryString.append('enabled', params.enabled.toString());
    const url = queryString.toString() ? `/flags?${queryString.toString()}` : '/flags';
    return api.get<FeatureFlag[]>(url);
  },
  getFeatureFlag: (key: string) => api.get<FeatureFlag>(`/flags/${key}`),
  createFeatureFlag: (data: Partial<FeatureFlag>) => api.post<FeatureFlag>('/flags', data),
  updateFeatureFlag: (key: string, data: Partial<FeatureFlag>) => api.patch<FeatureFlag>(`/flags/${key}`, data),
  deleteFeatureFlag: (key: string) => api.delete(`/flags/${key}`),
  toggleFeatureFlag: (key: string) => api.post<FeatureFlag>(`/flags/${key}/toggle`),
  
  // Saved Views
  getSavedViews: (entityType: string) => {
    const queryString = new URLSearchParams();
    queryString.append('entity_type', entityType);
    return api.get<SavedView[]>(`/saved-views?${queryString.toString()}`);
  },
  createSavedView: (data: Partial<SavedView>) => api.post<SavedView>('/saved-views', data),
  getSavedView: (id: string) => api.get<SavedView>(`/saved-views/${id}`),
  deleteSavedView: (id: string) => api.delete(`/saved-views/${id}`),
  
  // Audit Log
  getAuditLog: (params?: { entityType?: string; entityId?: string; actorId?: string; limit?: number }) => {
    const queryString = new URLSearchParams();
    if (params?.entityType) queryString.append('entity_type', params.entityType);
    if (params?.entityId) queryString.append('entity_id', params.entityId);
    if (params?.actorId) queryString.append('actor_id', params.actorId);
    if (params?.limit) queryString.append('limit', params.limit.toString());
    const url = queryString.toString() ? `/audit?${queryString.toString()}` : '/audit';
    return api.get<AuditLogEntry[]>(url);
  },
};

export default api;
