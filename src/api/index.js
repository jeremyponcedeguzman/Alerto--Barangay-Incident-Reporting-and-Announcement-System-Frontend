// API Service Layer for Barangay Emergency Notification System
// Powered by Axios + Express + MongoDB Atlas + Cloudinary backend
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to get the saved JWT token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem('alerto_token') || localStorage.getItem('token') || '';
}

/**
 * Configured Axios Client Instance
 */
export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT bearer token dynamically
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Standardize return structure across app
apiClient.interceptors.response.use(
  (response) => {
    return { success: true, ...response.data };
  },
  (error) => {
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.error ||
      error.message ||
      'Network request failed';

    console.warn(`[Axios API] Request failed for ${error.config?.url || 'endpoint'}:`, errorMessage);

    return {
      success: false,
      error: errorMessage,
      status: error.response?.status || 0,
      data: null,
    };
  }
);

// ==========================================
// 1. Health API
// ==========================================
export const healthApi = {
  check: () => apiClient.get('/health'),
};

// ==========================================
// 2. Authentication API (/api/auth)
// ==========================================
export const authApi = {
  login: async (credentials) => {
    const res = await apiClient.post('/auth/login', credentials);
    if (res.success && res.token) {
      localStorage.setItem('alerto_token', res.token);
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  register: async (userData) => {
    const res = await apiClient.post('/auth/register', userData);
    if (res.success && res.token) {
      localStorage.setItem('alerto_token', res.token);
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  getMe: () => apiClient.get('/auth/me'),

  getOfficials: () => apiClient.get('/auth/officials'),

  logout: () => {
    localStorage.removeItem('alerto_token');
    localStorage.removeItem('token');
  },
};

// ==========================================
// 3. Incident Reports API (/api/incidents)
// ==========================================
export const incidentsApi = {
  getAll: (params = {}) => {
    return apiClient.get('/incidents', { params });
  },

  getById: (id) => apiClient.get(`/incidents/${id}`),

  create: (incidentData) => apiClient.post('/incidents', incidentData),

  update: (id, updateData) => apiClient.patch(`/incidents/${id}`, updateData),

  updateStatus: (id, status, notes = '') => {
    return apiClient.patch(`/incidents/${id}/status`, {
      status,
      actionTakenNotes: notes,
    });
  },

  delete: (id) => apiClient.delete(`/incidents/${id}`),

  getStats: () => apiClient.get('/incidents/stats/overview'),
};

// ==========================================
// 4. Emergency Alerts / Announcements API (/api/alerts)
// ==========================================
export const alertsApi = {
  getAll: (params = {}) => apiClient.get('/alerts', { params }),

  getActive: () => apiClient.get('/alerts/active'),

  getById: (id) => apiClient.get(`/alerts/${id}`),

  create: (alertData) => apiClient.post('/alerts', alertData),

  update: (id, alertData) => apiClient.put(`/alerts/${id}`, alertData),

  delete: (id) => apiClient.delete(`/alerts/${id}`),
};

// ==========================================
// 5. Resident Directory API (/api/residents)
// ==========================================
export const residentsApi = {
  getAll: (params = {}) => apiClient.get('/residents', { params }),

  getById: (id) => apiClient.get(`/residents/${id}`),

  register: (residentData) => apiClient.post('/residents/register', residentData),

  create: (residentData) => apiClient.post('/residents', residentData),

  update: (id, residentData) => apiClient.put(`/residents/${id}`, residentData),

  delete: (id) => apiClient.delete(`/residents/${id}`),

  getDemographics: () => apiClient.get('/residents/stats/demographics'),
};

// ==========================================
// 6. Image / Cloudinary Upload API (/api/upload)
// ==========================================
export const uploadApi = {
  uploadImage: (image, folder = 'barangay-emergency/evidence') => {
    return apiClient.post('/upload', { image, folder });
  },
};

export default {
  client: apiClient,
  health: healthApi,
  auth: authApi,
  incidents: incidentsApi,
  alerts: alertsApi,
  residents: residentsApi,
  upload: uploadApi,
};
