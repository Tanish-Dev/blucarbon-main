import axios from 'axios';

// Get backend URL from environment variable
const API_BASE_URL = process.env.REACT_APP_BACKEND_URL || 'https://carbon-trust-ai.preview.emergentagent.com';

// Create axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Token management
let authToken = localStorage.getItem('auth_token');

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    if (authToken) {
      config.headers.Authorization = `Bearer ${authToken}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('auth_token');
      localStorage.removeItem('user_data');
      authToken = null;
      // Redirect to login if needed
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    if (response.data.access_token) {
      authToken = response.data.access_token;
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    if (response.data.access_token) {
      authToken = response.data.access_token;
      localStorage.setItem('auth_token', authToken);
      localStorage.setItem('user_data', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  logout: () => {
    authToken = null;
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
  },

  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  isAuthenticated: () => {
    return !!authToken;
  },

  getStoredUser: () => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
  }
};

// Projects API
export const projectsAPI = {
  create: async (projectData) => {
    const response = await api.post('/projects', projectData);
    return response.data;
  },

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/projects?${params.toString()}`);
    return response.data;
  },

  getById: async (projectId) => {
    const response = await api.get(`/projects/${projectId}`);
    return response.data;
  },

  update: async (projectId, projectData) => {
    const response = await api.put(`/projects/${projectId}`, projectData);
    return response.data;
  },

  delete: async (projectId) => {
    const response = await api.delete(`/projects/${projectId}`);
    return response.data;
  },

  registerOnBlockchain: async (projectId) => {
    const response = await api.post(`/projects/${projectId}/register-blockchain`);
    return response.data;
  }
};

// Field Data API
export const fieldDataAPI = {
  create: async (fieldData) => {
    const response = await api.post('/field-data', fieldData);
    return response.data;
  },

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) params.append(key, value);
    });
    
    const response = await api.get(`/field-data?${params.toString()}`);
    return response.data;
  },

  getById: async (fieldDataId) => {
    const response = await api.get(`/field-data/${fieldDataId}`);
    return response.data;
  },

  uploadImages: async (fieldDataId, files) => {
    const formData = new FormData();
    files.forEach((file, index) => {
      formData.append('files', file);
    });

    const response = await api.post(`/field-data/${fieldDataId}/upload-images`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  validate: async (fieldDataId) => {
    const response = await api.put(`/field-data/${fieldDataId}/validate`);
    return response.data;
  }
};

// Credits API
export const creditsAPI = {
  create: async (creditData) => {
    const response = await api.post('/credits', creditData);
    return response.data;
  },

  getAll: async (filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const response = await api.get(`/credits?${params.toString()}`);
    return response.data;
  },

  getById: async (creditId) => {
    const response = await api.get(`/credits/${creditId}`);
    return response.data;
  },

  issue: async (creditId, issuedTo) => {
    const response = await api.put(`/credits/${creditId}/issue`, { issued_to: issuedTo });
    return response.data;
  },

  issueOnBlockchain: async (creditId) => {
    const response = await api.post(`/credits/${creditId}/issue-blockchain`);
    return response.data;
  },

  getStats: async () => {
    const response = await api.get('/credits/stats/summary');
    return response.data;
  }
};

// Health API
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

export default api;