// API Service Layer for Barangay Emergency Notification System
// Communicates with Express + MongoDB Atlas + Cloudinary backend

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

/**
 * Helper to get the saved JWT token from localStorage
 */
export function getAuthToken() {
  return localStorage.getItem('alerto_token') || localStorage.getItem('token') || '';
}

/**
 * Universal fetch wrapper with automatic JWT injection, JSON parsing, and error handling
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getAuthToken();

  const headers = {
    ...options.headers,
  };

  // Only set Content-Type to application/json if body is not FormData
  if (!(options.body instanceof FormData) && !headers['Content-Type']) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json().catch(() => null);

    if (!response.ok) {
      const errorMsg = data?.message || data?.error || `HTTP error ${response.status}: ${response.statusText}`;
      const error = new Error(errorMsg);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return { success: true, ...data };
  } catch (err) {
    console.warn(`[API] Request failed for ${endpoint}:`, err.message);
    return {
      success: false,
      error: err.message,
      status: err.status || 0,
      data: null,
    };
  }
}

// ==========================================
// 1. Health API
// ==========================================
export const healthApi = {
  check: () => request('/health', { method: 'GET' }),
};

// ==========================================
// 2. Authentication API (/api/auth)
// ==========================================
export const authApi = {
  login: async (credentials) => {
    const res = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
    if (res.success && res.token) {
      localStorage.setItem('alerto_token', res.token);
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  register: async (userData) => {
    const res = await request('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
    if (res.success && res.token) {
      localStorage.setItem('alerto_token', res.token);
      localStorage.setItem('token', res.token);
    }
    return res;
  },

  getMe: () => request('/auth/me', { method: 'GET' }),

  getOfficials: () => request('/auth/officials', { method: 'GET' }),

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
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '' && val !== 'all') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/incidents${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  getById: (id) => request(`/incidents/${id}`, { method: 'GET' }),

  create: (incidentData) => {
    return request('/incidents', {
      method: 'POST',
      body: JSON.stringify(incidentData),
    });
  },

  update: (id, updateData) => {
    return request(`/incidents/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(updateData),
    });
  },

  updateStatus: (id, status, notes = '') => {
    return request(`/incidents/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, actionTakenNotes: notes }),
    });
  },

  delete: (id) => request(`/incidents/${id}`, { method: 'DELETE' }),

  getStats: () => request('/incidents/stats/overview', { method: 'GET' }),
};

// ==========================================
// 4. Emergency Alerts / Announcements API (/api/alerts)
// ==========================================
export const alertsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/alerts${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  getActive: () => request('/alerts/active', { method: 'GET' }),

  getById: (id) => request(`/alerts/${id}`, { method: 'GET' }),

  create: (alertData) => {
    return request('/alerts', {
      method: 'POST',
      body: JSON.stringify(alertData),
    });
  },

  update: (id, alertData) => {
    return request(`/alerts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(alertData),
    });
  },

  delete: (id) => request(`/alerts/${id}`, { method: 'DELETE' }),
};

// ==========================================
// 5. Resident Directory API (/api/residents)
// ==========================================
export const residentsApi = {
  getAll: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    const queryString = query.toString();
    return request(`/residents${queryString ? `?${queryString}` : ''}`, { method: 'GET' });
  },

  getById: (id) => request(`/residents/${id}`, { method: 'GET' }),

  register: (residentData) => {
    return request('/residents/register', {
      method: 'POST',
      body: JSON.stringify(residentData),
    });
  },

  create: (residentData) => {
    return request('/residents', {
      method: 'POST',
      body: JSON.stringify(residentData),
    });
  },

  update: (id, residentData) => {
    return request(`/residents/${id}`, {
      method: 'PUT',
      body: JSON.stringify(residentData),
    });
  },

  delete: (id) => request(`/residents/${id}`, { method: 'DELETE' }),

  getDemographics: () => request('/residents/stats/demographics', { method: 'GET' }),
};

// ==========================================
// 6. Image / Cloudinary Upload API (/api/upload)
// ==========================================
export const uploadApi = {
  uploadImage: (image, folder = 'barangay-emergency/evidence') => {
    return request('/upload', {
      method: 'POST',
      body: JSON.stringify({ image, folder }),
    });
  },
};

export default {
  health: healthApi,
  auth: authApi,
  incidents: incidentsApi,
  alerts: alertsApi,
  residents: residentsApi,
  upload: uploadApi,
};
