import axios from 'axios';
import { handleError } from '../utils/errorHandling';

// Environment-driven configuration (no real secrets baked into bundle)
// Provide minimal, non-sensitive fallbacks only for local dev if .env not configured.
const APP_ID = process.env.REACT_APP_NOVI_APP_ID || 'dev-app';
const APP_KEY = process.env.REACT_APP_NOVI_APP_KEY || 'dev-key';
const API_KEY = process.env.REACT_APP_NOVI_API_KEY || 'dev-api-key';
const BASE_URL = process.env.REACT_APP_NOVI_BASE_URL || process.env.REACT_APP_NOVI_API_URL || 'http://localhost:4000/api';

// Axios client (single instance)
const apiClient = axios.create({
  baseURL: BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
    'X-Application-Id': APP_ID,
    'X-Application-Key': APP_KEY
  },
  timeout: 10000
});

// Request interceptor – auth + conditional API key
apiClient.interceptors.request.use(
  config => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
      }

      const method = (config.method || '').toLowerCase();
      const url = config.url || '';
      if (method === 'post' && (/\/auth\//.test(url) || /\/users?(\/|$)/.test(url))) {
        config.headers['X-Api-Key'] = API_KEY;
        config.headers['Content-Type'] = 'application/json';
      }
    } catch (e) {
      // localStorage access might fail (SSR / sandbox) – ignore
    }
    return config;
  },
  error => Promise.reject(error)
);

// Response interceptor – auth + normalization
apiClient.interceptors.response.use(
  response => response,
  error => {
    if (error?.response?.status === 401) {
      try {
        localStorage.removeItem('token');
      } catch {/* ignore */}
      // Defer redirect slightly (tests / UX)
      if (typeof window !== 'undefined') {
        setTimeout(() => { window.location.href = '/login'; }, 50);
      }
    }
    return Promise.reject(error);
  }
);

// Helper to unwrap data and unify errors
async function request(method, url, { data, params, config, silent, context } = {}) {
  try {
    const response = await apiClient.request({ method, url, data, params, ...config });
    return { success: true, data: response.data, status: response.status };
  } catch (error) {
    handleError(error, { silent, context: context || `${method.toUpperCase()} ${url}` });
    return { success: false, error, status: error?.response?.status || 0 };
  }
}

export const api = {
  get: (url, opts) => request('get', url, opts),
  post: (url, data, opts) => request('post', url, { ...opts, data }),
  put: (url, data, opts) => request('put', url, { ...opts, data }),
  patch: (url, data, opts) => request('patch', url, { ...opts, data }),
  delete: (url, opts) => request('delete', url, opts),
  raw: apiClient
};

// In-memory cache helper (legacy replacement for localStorage caching kept minimal)
const cacheStore = new Map();
const setCache = (key, value, ttlMs) => {
  cacheStore.set(key, { value, expires: Date.now() + ttlMs });
};
const getCache = (key) => {
  const entry = cacheStore.get(key);
  if (!entry) return null;
  if (entry.expires < Date.now()) { cacheStore.delete(key); return null; }
  return entry.value;
};

function cacheKey(path, params) {
  const p = params ? JSON.stringify(params) : ''; return `${path}|${p}`;
}

export const apiDomain = {
  recipes: {
    list: async (params = {}) => {
      const key = cacheKey('/recipes', params);
      const cached = getCache(key);
      if (cached) return cached;
      const res = await api.get('/recipes', { params, context: 'recipes.list', silent: true });
      if (res.success) setCache(key, res.data, 30 * 60 * 1000);
      return res.data;
    },
    get: async (id) => {
      const key = cacheKey(`/recipes/${id}`);
      const cached = getCache(key);
      if (cached) return cached;
      const res = await api.get(`/recipes/${id}`, { context: 'recipes.get' });
      if (res.success) setCache(key, res.data, 60 * 60 * 1000);
      return res.data;
    },
    search: async (q) => {
      const key = cacheKey('/recipes/search', { q });
      const cached = getCache(key);
      if (cached) return cached;
      const res = await api.get('/recipes/search', { params: { q }, context: 'recipes.search' });
      if (res.success) setCache(key, res.data, 15 * 60 * 1000);
      return res.data;
    }
  },
  auth: {
    login: (credentials) => api.post('/auth/login', credentials, { context: 'auth.login' }),
    register: (userData) => api.post('/auth/register', userData, { context: 'auth.register' }),
    resetPassword: (email) => api.post('/auth/reset-password', { email }, { context: 'auth.reset' })
  },
  user: {
    updateProfile: (profileData) => api.put('/user/profile', profileData, { context: 'user.updateProfile' })
  },
  system: {
    health: () => api.get('/health', { context: 'system.health', silent: true })
  },
  cache: {
    clear: () => cacheStore.clear()
  }
};

export default apiClient;